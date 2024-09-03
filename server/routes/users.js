import express from "express";
import { authMiddleware, createJSONToken, hashPassword, comparePassword } from "../util/auth.js";
import {
  isValidEmail,
  isValidString,
  isMatchingPasswords,
  isValidPhoneNumber
} from "../util/validation.js";
import { FindOneUser, emailExists, addNewUser,saveCvWithImages, changePassword,changeAccountInformation } from "../util/mongo.js";
import { spawn } from "child_process"; //spawn function specifically allows you to spawn a new process with specified arguments.here its used to execute a Python script.
import path from "path";
import fs from "fs";
import multer from "multer"; //Middleware for handling file uploads from client requests
import { getPythonApiKey } from "../util/gemini-api-key.js";

const router = express.Router();
const ___dirname = path.resolve(); // Get the current directory path
const uploadsFolder = path.join(___dirname, "uploads");

router.post("/sign-up", async (req, res, next) => {
  let userFormData = req.body;
  let errors = {};

  // Validation
  if (!isValidEmail(userFormData.email)) {
    errors.email = "Invalid email.";
  } else {
    try {
      const existingUser = await emailExists(userFormData.email);
      if (existingUser) {
        errors.email = "Email exists already.";
      }
    } catch (error) {
      errors.email = "Problem getting Email server data.";
    }
  }

  if (!isValidString(userFormData.password, 6)) {
    errors.password = "Invalid password. Must be at least 6 characters long.";
  }
  if (!isValidString(userFormData.userName, 2)) {
    errors.userName = "Invalid user name. Must be at least 2 characters long.";
  }
  if (!isMatchingPasswords(userFormData.password, userFormData.confirmPassword)) {
    errors.password = "Passwords don't match.";
  }
  if (!isValidPhoneNumber(userFormData.phone)) {
    errors.phone = "Invalid phone number.";
  }
  if (userFormData.jobSelect.length < 1) {
    errors.jobSelect = "Must select at least one job.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "User signup failed due to validation errors.",
      errors,
    });
  }

  try {
    const filePath = path.join(uploadsFolder, `${userFormData.identifier}.json`);
    const temporaryData = await fs.promises.readFile(filePath, "utf8");
    let parsedData = JSON.parse(temporaryData);

    delete userFormData.confirmPassword;
    delete parsedData.email;
    delete userFormData.identifier;
    delete parsedData.phone;
    delete parsedData.name;

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const userData = {
      name: userFormData.userName,
      email: userFormData.email,
      phone: userFormData.phone,
      password: await hashPassword(userFormData.password),
      joinDate: date
    };

    const userId = await addNewUser(userData);

    parsedData = { ...parsedData, jobSelect: userFormData.jobSelect };
    delete parsedData.name;
    delete userFormData.phone;

    const apikey = getPythonApiKey();
    let pythonData = "";
    try {
      const pythonProcess = spawn("python", [
        "./scripts/SalaryPrediction.py",
        JSON.stringify(parsedData),
        apikey,
      ]);

      pythonProcess.stdout.on("data", (data) => {
        pythonData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        if (!data.toString().includes("gRPC experiments enabled")) {
          console.error(`Python stderr: ${data}`);
        }
      });

      await new Promise((resolve, reject) => {
        pythonProcess.on("close", (code) => {
          if (code !== 0) {
            reject(new Error(`Python process exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error running Python script:", error);
      throw error;
    }

    let finalCvData = { ...parsedData };
    try {
      if (pythonData) {
        const result = JSON.parse(pythonData);
        finalCvData = { ...finalCvData, ...result['predictions'] };
        await saveCvWithImages(userId, finalCvData, result['predictions']);
        
        for (const jobName in result['predictions']) {
          const filePath = path.join(___dirname, `../server/${jobName} prediction.jpg`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        console.log("Images successfully deleted after saving to MongoDB.");
      } else {
        console.warn("Python script returned empty data.");
      }
    } catch (error) {
      console.error("Error parsing JSON from Python script or saving data:", error);
      throw error;
    }

    const token = createJSONToken(userId);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.send();
  } catch (error) {
    next(error);
  }
});


// Configure multer
const upload = multer();
router.post("/change-password", authMiddleware , upload.none(), async (req, res) => {
  const {oldPassword,newPassword,newPasswordConfirm} = req.body;
  // Check if Old, New password and Confirm are provided
  if (!oldPassword || !newPassword ||!newPasswordConfirm) {
    return res.status(400).json({ message: "Old, New and Confirm passwords are required" });
  }
  if (newPassword != newPasswordConfirm) {
    return res.status(400).json({ message: "New and Confirm passwords should be the same" });
  }
  if (!isValidString(newPassword, 6)) {
    return res.status(422).json({
      message: "Invalid password. Must be at least 6 characters long.",
    });
  }

  const { identifier } = req.identifier; // Retrieve identifier from the decoded token
  if (!identifier) {
    return;
  }
  try {
      // Fetch the user document using FindOneUser function
      const user = await FindOneUser({ _id: identifier });

      if (!user) {
        return res.status(400).json({ message: "No user found with the provided identifier." });
      }
  
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await comparePassword(oldPassword, user.password);
    if (!passwordMatch) {
      // If passwords don't match, return authentication failed message
      return res
        .status(400)
        .json({ message: "Authentication failed wrong password" });
    }
  
    // replacing the password
    const result = await changePassword(identifier, await hashPassword(newPassword));
    if (!result) {
      // If user not found, return authentication failed message
      return res
        .status(401)
        .json({ message: "Changing The Password Failed" });
    }
    return res
    .status(200)
    .json({ message: "Password Was Replaced." })

  } catch (error) {
    // If an error occurs during database query or password comparison, return internal server error message
    console.error("Error querying MongoDB:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/change-account-information", authMiddleware , upload.none(), async (req, res) => {
  const { newEmail,password, newUsername, newPhone } = req.body;
  if (!isValidString(password, 6)) {
    return res.status(422).json({
      message: "Invalid password. Must be at least 6 characters long.",
    });
  }
  if (!isValidString(newUsername, 2)) {
    return res.status(422).json({
      message: "Invalid user name. Must be at least 2 characters long.",
    });
  }
  if (!isValidPhoneNumber(newPhone)) {
    return res.status(422).json({
      message: "Invalid phone number",
    });
  }
  const { identifier } = req.identifier; // Retrieve identifier from the decoded token
  if (!identifier) {
    return;
  }
  try {
      // Fetch the user document using FindOneUser function
      const user = await FindOneUser({ _id: identifier });

      if (!user) {
        return res.status(400).json({ message: "No user found with the provided identifier." });
      }
      if (!isValidEmail(newEmail)) {
        return res.status(422).json({
          message: "Invalid email.",
        });
      } else {
        try {
          const existingUser = await emailExists(newEmail);
          if (existingUser && user.email!=newEmail) {
            errors.email = "Email exists already.";
          }
        } catch (error) { }
      }
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      // If passwords don't match, return authentication failed message
      return res
        .status(400)
        .json({ message: "Authentication failed wrong password" });
    }
  
    // replacing the data
    const result = await changeAccountInformation(identifier, newUsername, newEmail,newPhone);
    if (!result) {
      // If user not found, return authentication failed message
      return res
        .status(401)
        .json({ message: "Changing The Account Info Failed" });
    }
    return res
    .status(200)
    .json({ message: "Account Info Was Replaced." })

  } catch (error) {
    // If an error occurs during database query or password comparison, return internal server error message
    console.error("Error querying MongoDB:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { password, email } = req.body;
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if(!isValidEmail(email))
  {
    return res.status(400).json({ message: "Email is Invalid" });
  }
  if(!isValidString(password,6))
    {
      return res.status(400).json({ message: "Password is Invalid" });
    }
  try {
    // Query MongoDB to find a user with the provided email
    const user = await FindOneUser({ email });
    if (!user) {
      // If user not found, return authentication failed message
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid email or password." });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      // If passwords don't match, return authentication failed message
      return res
        .status(401)
        .json({ message: "Authentication failed. Invalid email or password." });
    }

    // If username and password match, generate a JSON Web Token (JWT)
    const token = createJSONToken(user._id);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 1 hour expiration
    });
    res.send();

  } catch (error) {
    // If an error occurs during database query or password comparison, return internal server error message
    console.error("Error querying MongoDB:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie("auth_token");
  res.sendStatus(200);
});

router.get("/me", authMiddleware, async (req, res) => {
  const { identifier } = req.identifier;

  const user = await FindOneUser({ _id: identifier }, '-password');

  if (user)
    res.status(200).send(user);
  else
    res.sendStatus(401);
});

export default router;
