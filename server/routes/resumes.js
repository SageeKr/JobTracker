import express from "express";
import path from "path";
import fs from "fs";
import sendMessageToGemini from "../util/gemini-util.js";
import { CV_EXTRACT_PROMPT } from "../util/prompts.js";
import getTextFromFile from "../util/get-text-from-file-util.cjs";
import multer from "multer"; //Middleware for handling file uploads from client requests
import { FindOneUser, upsertCv } from "../util/mongo.js";
import { getPythonApiKey } from "../util/gemini-api-key.js";
import {
  authMiddleware,
  createJSONToken,
  hashPassword,
  comparePassword,
} from "../util/auth.js";
import { spawn } from "child_process"; //spawn function specifically allows you to spawn a new process with specified arguments.here its used to execute a Python script.
import { isValidCvType } from "../util/validation.js";
const __dirname = path.resolve(); // Get the current directory path
const uploadsFolder = path.join(__dirname, "uploads");

// Function to delete all files in a directory
async function clearUploadsFolder(directory) {
  try {
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
      if (file === ".gitkeep") // exclude .gitkeep file
        continue;
      const filePath = path.join(directory, file);
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error clearing directory ${directory}: ${err}`);
  }
}


// Clear the uploads folder on server startup
clearUploadsFolder(uploadsFolder);

const router = express.Router();
// Multer configuration to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save uploaded files to the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  },
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limit file size to 5MB
 });

// Endpoint to handle resume file upload
router.post("/uploadresume", (req, res) => {
  upload.single("file")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File too large. Please upload a file smaller than 3MB.",
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message || "Failed to process content. Please add the job information manually."});
    }
  // If no file is received
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  if (!isValidCvType(req.file.mimetype)) {
    return res
      .status(400)
      .json({
        message:
          "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.",
      });
  }
  try {
    // Extract text from the uploaded file
    const fileContent = await getTextFromFile(req.file.path);

    // Send the extracted text to Gemini
    let cvData = await sendMessageToGemini(
      CV_EXTRACT_PROMPT,
      fileContent,
      true,
      true
    );

    // Handle null values in name, email, and phone
    cvData.name = cvData.name && cvData.name !== "null" ? cvData.name : "";
    cvData.email = cvData.email && cvData.email !== "null" ? cvData.email : "";
    cvData.phone = cvData.phone && cvData.phone !== "null" ? cvData.phone : "";

    // Check if all critical fields are missing
    if (!cvData.name && !cvData.email && !cvData.phone) {
      await fs.unlink(req.file.path); // Delete the uploaded file
      return res.status(400).json({
        message: "Invalid resume: missing name, email, or phone number.",
      });
    }

    // Generate a unique identifier based on the name, email, or phone
    const username =
      cvData.name.toLowerCase().replace(/\s+/g, "_") ||
      cvData.email ||
      cvData.phone;
    if (!username) {
      await fs.unlink(req.file.path); // Delete the uploaded file
      return res.status(400).json({
        message:
          "Invalid resume: name, email, and phone number are all missing.",
      });
    }

    const timestamp = Date.now();
    const identifier = `${username}_${timestamp}`;

    // Save parsed data JSON to a file in the uploads folder
    const filePath = path.join(uploadsFolder, `${identifier}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(cvData, null, 4));

    cvData = { ...cvData, identifier };

    // Send a response back to the client
    res.status(200).json({ message: "File uploaded and processed", cvData });
  } catch (error) {
    console.error("Error parsing data:", error);
    res.status(500).json({ message: error.message || "Internal server error. Please try uploading your resume again."});
  }
});
});

// Endpoint to handle changing resume
router.post(
  "/change-resume",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    // If no file is received
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!isValidCvType(req.file.mimetype)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.",
        });
    }
    const { passwordr, jobSelect } = req.body;
    const { identifier } = req.identifier; // Retrieve identifier from the decoded token
    try {
      // Fetch the user document using FindOneUser function
      const user = await FindOneUser({ _id: identifier });

      if (!user) {
        return res
          .status(400)
          .json({ message: "No user found with the provided identifier." });
      }
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await comparePassword(passwordr, user.password);
      if (!passwordMatch) {
        // If passwords don't match, return authentication failed message
        return res
          .status(400)
          .json({ message: "Authentication failed wrong password" });
      }
      if (jobSelect[1] == "}") {
        return res
          .status(400)
          .json({ message: "Must select at least one job" });
      }
      // Extract text from the uploaded file
      const fileContent = await getTextFromFile(req.file.path);
      // Send the extracted text to Gemini
      let cvData = await sendMessageToGemini(
        CV_EXTRACT_PROMPT,
        fileContent,
        true,
        true
      );
      delete cvData.name;
      delete cvData.email;
      delete cvData.phone;
      cvData.jobSelect = jobSelect;


      const apikey = getPythonApiKey();
      let pythonData = "";
      try {
        const pythonProcess = spawn("python", [
          "./scripts/SalaryPrediction.py",
          JSON.stringify(cvData),
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
      try {
        if (pythonData) {
          const result = JSON.parse(pythonData);
          const finalCvData = { ...cvData, ...result['predictions'] };
          await upsertCv(identifier, finalCvData);
          
          for (const jobName in result['predictions']) {
            const filePath = path.join(__dirname, `../server/${jobName} prediction.jpg`);
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
      // Send a response back to the client
      res.status(200).json({ message: "File uploaded and processed", cvData });
    } catch (error) {
      console.error("Error parsing data:", error);
      res.status(500).json({ message: error.message || "Internal server error. Please try changing your resume again."});
    }
  }
);
export default router;
