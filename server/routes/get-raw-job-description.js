import fs from "fs";
import puppeteer from "puppeteer";
import express from "express";
import sendMessageToGemini from "../util/gemini-util.js";
import { JOB_DESCRIPTION_EXTRACT_PROMPT, EVALUATE_CV_JOB_MATCH_SCORE_PROMPT, generateEvaluateCvJobMatchScoreContent } from "../util/prompts.js";
import { authMiddleware } from "../util/auth.js";
import {
  addNewJobDescription,
  getAllJobDescriptionsForUser,
  deleteJobDescription,
  updateJobDescriptionStatus,
  addNewScore,
  addOrUpdateProcess,
  FindOneCv
} from "../util/mongo.js";
const router = express.Router();

async function scrapeContent(url, selector, includeUA) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    if (includeUA) {
      // Mock a random UserAgent to represent casual user browser
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
    }
    await page.goto(url);

    // Wait for the content elements to be present
    await page.waitForSelector(selector);

    // Extract content
    const content = await page.evaluate((selector) => {
      return document.querySelector(selector).innerText;
    }, selector);

    await browser.close();

    return content;
  } catch (error) {
    console.error("Error scraping content:", error);
    await browser.close();
    throw new Error(
      "Failed to scrape content. Please add the job information manually."
    );
  }
}
// Function to validate URL format
function isValidUrl(url) {
  const urlPattern = /^(https?:\/\/)?([\w\d]+\.)+[a-z]{2,}(\/.*)*$/i;
  return urlPattern.test(url);
}
async function saveToFile(content, filename) {
  try {
    fs.writeFileSync(filename + ".txt", content);
    console.log("Content saved to files:", filename);
  } catch (error) {
    console.error("Error saving to files:", error);
    throw new Error(
      "Failed to save content. Please add the job information manually."
    );
  }
}

function parseDomainFromUrl(url) {
  // Remove 'www.', 'com', and 'il' from the URL
  return url
    .split("/")[2]
    .replace("www.", "")
    .replace(".com", "")
    .replace(".il", "");
}

//route which gives back a job description extracted from a job url and calauts the match score with the user cv
router.post("/get-raw-job-description", authMiddleware, async (req, res) => {
  const { identifier } = req.identifier; // Retrieve identifier from the decoded token
  if (!identifier) {
    return;
  }
  const { url } = req.body;
  // Check if url is provided
  if (!isValidUrl(url)) {
    return res
      .status(400)
      .json({ message: "Invalid URL format. Please enter a valid URL." });
  }
  try {
    console.log("Scraping content..."); // Display a loading message

    let selector, includeUA;
    const domain = parseDomainFromUrl(url);

    // Determine the appropriate CSS selector based on the job board website
    // Each website has a unique structure, so we use different selectors to target the relevant job content
    // Working on a  uniqe link to a spesipic job discription

    if (url.includes("alljobs.co.il")) {
      selector = ".job-content-top"; // Changed selector based on AllJobs structure
    } else if (url.includes("team8.vc")) {
      selector = ".section-career"; // Changed selector based on Team8 structure
    } else if (url.includes("jobmaster.co.il")) {
      selector = ".articleJob.JobItem"; // Changed selector based on Jobmaster structure
    } else if (url.includes("jobnet.co.il")) {
      selector = "#ContentPlaceHolder1_ucSearhRes_upRes"; // Changed selector based on Jobnet structure}
    } else if (url.includes("drushim.co.il")) {
      selector = ".job-item-main"; // Changed selector based on drushim structure}
    } else if (url.includes("muvtal.co.il")) {
      selector = ".wrap-container"; // Changed selector based on muvtal structure}
    } else if (url.includes("il.indeed.com")) {
      selector = ".jobsearch-JobComponent"; // Changed selector based on indeed structure}
      includeUA = true // indeed blocks bots (when there is no UA), including UA helps receiving expected page
    } else {
      selector = "body"; // For a general case, just get the entire body content
    }

    const content = await scrapeContent(url, selector, includeUA);
    await saveToFile(content, `uploads/${domain}_content`);

    console.log("Sending JOB_DESCRIPTION_EXTRACT_PROMPT to Gemini...");
    const jobDescriptionData = await sendMessageToGemini(
      JOB_DESCRIPTION_EXTRACT_PROMPT,
      content,
      true,
      true
    );

    const cv = await FindOneCv({ user: identifier });
    if (!cv) {

      return res.status(404).json({ message: 'cv Data not found' });
    }
    console.log("Sending EVALUATE_CV_JOB_MATCH_SCORE_PROMPT to Gemini...");
    const matchScore = await sendMessageToGemini(
      EVALUATE_CV_JOB_MATCH_SCORE_PROMPT,
      generateEvaluateCvJobMatchScoreContent(cv.cvData, jobDescriptionData),
      false,
      true
    );
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    fs.writeFileSync(
      `uploads/${timestamp}.${"testingd"}.${"sdfsd"}.match_score.json`,
      JSON.stringify(matchScore, null, 4)
    );
    const filename = `uploads/${timestamp}.${jobDescriptionData.title}.${domain}_content.json`;
    fs.writeFileSync(filename, JSON.stringify(jobDescriptionData, null, 4));
    // Prepare job description data with URL, current date, and status
    const jobDataWithMetadata = {
      url: url,
      date: new Date().toLocaleDateString(),
      status: "Interested",
      ...jobDescriptionData,
    };
    const _id = await addNewJobDescription(
      identifier,
      JSON.stringify(jobDataWithMetadata, null, 4)
    );
    await addNewScore(_id, matchScore);

    // Add the new process document
    const today = new Date();
    const processData = {
      stage: "Interesting",
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      comment: "",
    };
    await addOrUpdateProcess(_id, processData);
    console.log('processData update to default');

    console.log("Content scraped, processed, and saved successfully.");
    return res
      .status(200)
      .json({ message: "Content processed successfully", jobDataWithMetadata, _id });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: error.message || "Failed to process content. Please add the job information manually.",
      });
  }
});
// import { updateJobDescription, addJobDescription } from './controllers/jobDescriptionsController';

//route gives back all the job descriptions of the user
router.get("/get-all-job-descriptions", authMiddleware, async (req, res) => {
  const { identifier } = req.identifier;
  try {
    const jobDescriptions = await getAllJobDescriptionsForUser(identifier);
    res.json(jobDescriptions.length ? jobDescriptions : []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job descriptions" });
  }
});
router.delete(
  "/delete-job-description/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await deleteJobDescription(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error deleting job description" });
    }
  }
);

//route updates the status of a specifc job 
router.patch(
  "/update-job-description-status/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const updatedJobDescription = await updateJobDescriptionStatus(
        req.params.id,
        req.body.status
      );
      res.json(updatedJobDescription);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating job description status" });
    }
  }
);

router.post("/save-stages", authMiddleware, async (req, res) => {

  const { identifierJob, stageData } = req.body;
  if (!identifierJob) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const updatedJobDescription = await addOrUpdateProcess(
      identifierJob,
      stageData
    );
    res.json(updatedJobDescription);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating job description status" });
  }
}
)

export default router;
