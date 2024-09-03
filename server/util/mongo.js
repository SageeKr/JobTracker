import mongoose from 'mongoose'; // Import mongoose using ES module syntax
import fs from "fs";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/DataBase")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  joinDate: { type: Date, required: true },
});
const UserDataModel = mongoose.model("Users", userSchema);

const cvSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  cvData: { type: mongoose.Schema.Types.Mixed, required: true },
  images: {type: Map, of: String, default: {} },
});
const CvModel = mongoose.model("Cvs", cvSchema);

const jobDescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  jobDescriptionData: { type: mongoose.Schema.Types.Mixed, required: true },
});
const jobDescriptionsModel = mongoose.model("jobDescriptions", jobDescriptionSchema);

const jobMatchScoreSchema = new mongoose.Schema({
  jobDescription: { type: mongoose.Schema.Types.ObjectId, ref: 'jobDescriptions', required: true },
  MatchScoreData: { type: mongoose.Schema.Types.Mixed, required: true },
});
const jobMatchScoreModel = mongoose.model("jobMatchScore", jobMatchScoreSchema);

const processSchema = new mongoose.Schema({
  jobDescription: { type: mongoose.Schema.Types.ObjectId, ref: 'jobDescriptions', required: true },
  processData: { type: mongoose.Schema.Types.Mixed, required: true },
});
const processModel = mongoose.model("Processes", processSchema);

// Function to find one document based on the provided data
export async function FindOneUser(dataToFind, ...args) {
  return UserDataModel.findOne(dataToFind, ...args);
}
export async function FindOneJobDescription(dataToFind) {
  return jobDescriptionsModel.findOne(dataToFind);
}
export async function FindOneCv(dataToFind) {
  return CvModel.findOne(dataToFind);
}

// Function to check if an email exists
export async function emailExists(email) {
  try {
    const user = await UserDataModel.findOne({ email });
    return !!user; // Return true if user exists, false otherwise
  } catch (error) {
    console.error("Error while checking email existence:", error);
    return false; // Return false in case of any error
  }
}

// Function to save user data to the database
export async function addNewUser(UserData) {
  console.log(UserData);
  try {
    const newUser = await UserDataModel.create(UserData);
    console.log("New document created:", newUser);
    return newUser._id; // Return the newly created document
  } catch (error) {
    console.error("Error while saving data:", error);
    throw error; // Throw the error to be handled by the caller
  }
}
// Function to save CV data to the database
export async function addNewScore(Identifier, ScoreData) {
  try {
    const newCv = await jobMatchScoreModel.create({ jobDescription: Identifier, MatchScoreData:ScoreData });
    // console.log("New CV document created:", newCv);
    return ScoreData; // Return the newly created CV document
  } catch (error) {
    console.error("Error while saving score data:", error);
    throw error; // Throw the error to be handled by the caller
  }
}
export async function getMatchScoreData(Identifier) {
  try {
    const MatchScoreData = await jobMatchScoreModel.find({ jobDescription: Identifier });
    return MatchScoreData;
  } catch (error) {
    console.error('Error fetching MatchScoreData:', error);
    throw error;
  }
}

export async function addOrUpdateProcess(Identifier, processDatas) {
  try {
    const newOrUpdatedProcess = await processModel.findOneAndUpdate(
      { jobDescription: Identifier },
      { $set: { processData: processDatas } },
      { new: true, upsert: true } // `new: true` returns the updated document; `upsert: true` creates a new document if none exists
    );
    return newOrUpdatedProcess; // Return the newly created or updated process document
  } catch (error) {
    console.error("Error while saving process data:", error);
    throw error; // Throw the error to be handled by the caller
  }
}
export async function changePassword(Identifier,newPassword)
{
  try {
  const result = await UserDataModel.updateOne({ _id: Identifier },
    { $set: { password: newPassword } }
  );
  if (result.nModified === 0) {
    throw new Error('No user found with the provided identifier.');
  }

  return result;
}catch (error) {
  console.error('Error updating password:', error);
  throw error;
}}

export async function changeAccountInformation(Identifier, userName, email, phone) {
  try {
    const result = await UserDataModel.updateOne(
      { _id: Identifier },
      { 
        $set: { 
          name: userName,
          email: email,
          phone: phone 
        } 
      }
    );
    if (result.nModified === 0) {
      throw new Error('No user found with the provided identifier.');
    }
    return result;
  } catch (error) {
    console.error('Error updating account information:', error);
    throw error;
  }
}


export async function getProcessData(Identifier) {
  try {
    const ProcessData = await processModel.find({ jobDescription: Identifier });
    return ProcessData;
  } catch (error) {
    console.error('Error fetching process data:', error);
    throw error;
  }
}

// Function to save or update CV data for a user
export async function upsertCv(userIdentifier, cvData) {
  try {
    const updatedCv = await CvModel.findOneAndUpdate(
      { user: userIdentifier },
      { $set: { cvData } }, // Use $set to explicitly overwrite the cvData field
      { new: true, upsert: true } // Return the updated document, create if it doesn't exist
    );
    return updatedCv; // Return the newly created or updated CV document
  } catch (error) {
    console.error("Error while saving CV data:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

// Function to save CV data to the database
export async function addNewJobDescription(userIdentifier, jobDescriptionData) {
  try {
    const newJobDescription = await jobDescriptionsModel.create({ user: userIdentifier, jobDescriptionData });
    // console.log("New job Description created:", newJobDescription);
    return newJobDescription._id; // Return the newly created Job Description _id
  } catch (error) {
    console.error("Error while saving job Description data:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

export async function getJobDescription(Id) {
  try {
    const jobDescription = await jobDescriptionsModel.find({ _id: Id});
    return jobDescription;
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
}
export async function getAllJobDescriptionsForUser(userId) {
  try {
    const jobDescriptions = await jobDescriptionsModel.find({ user: userId });
    return jobDescriptions;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
}

export async function deleteJobDescription(jobDescriptionId) {
  try {
    await jobDescriptionsModel.findByIdAndDelete(jobDescriptionId);
    return { message: 'Job description deleted successfully' };
  } catch (error) {
    console.error('Error deleting job description:', error);
    throw error;
  }
}

export async function updateJobDescriptionStatus(jobDescriptionId, newStatus) {
  try {
    const jobDescription = await jobDescriptionsModel.findById(jobDescriptionId);
    if (!jobDescription) {
      throw new Error('Job description not found');
    }

    let jobDescriptionData = JSON.parse(jobDescription.jobDescriptionData);
    jobDescriptionData.status = newStatus;
    jobDescription.jobDescriptionData = JSON.stringify(jobDescriptionData);

    const updatedJobDescription = await jobDescription.save();
    return updatedJobDescription;
  } catch (error) {
    console.error('Error updating job description status:', error);
    throw error;
  }
}

export async function saveCvWithImages(userIdentifier, cvData, predsData) {
  try {
    // Prepare the images object and imagePaths object
    const images = {};
    const imagePaths = {};

    if (predsData) {
      for (const jobName in predsData) {
        // Construct the file path
        const filePath = `../server/${jobName} prediction.jpg`;

        // Read the image file and encode it as Base64
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');

        // Set the job name as the key in the objects
        images[jobName] = base64Image;
        imagePaths[jobName] = filePath;
      }
    }

    // Update or create a document in CvModel to include the CV data, images, and imagePaths
    const result = await CvModel.updateOne(
      { user: userIdentifier },
      { $set: { cvData, images, imagePaths } },
      { upsert: true }
    );

    console.log('CV and images stored in MongoDB document');
    return result;
  } catch (error) {
    console.error('Error saving CV and images:', error);
    throw error;
  }
}
export async function deleteProcessData(jobDescriptionId) {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const updateResult = await processModel.findOneAndUpdate(
      { jobDescription: jobDescriptionId },
      {
        $set: {
          'processData.comment': '',         // Delete the comment by setting it to an empty string
          'processData.date': todayDate,    // Set the date to today
          'processData.stage': 'Interesting' // Set the stage to 'Interesting'
        }
      },
      { new: true } // Return the updated document
    );

    if (updateResult) {
      return { message: 'Process updated successfully', success: true };
    } else {
      return { message: 'Process not found', success: false };
    }
  } catch (error) {
    console.error('Error updating process:', error);
    throw error;
  }
}
