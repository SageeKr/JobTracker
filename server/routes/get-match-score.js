import express from "express";
import { authMiddleware } from "../util/auth.js";
import { getMatchScoreData, getJobDescription } from "../util/mongo.js";

const router = express.Router();

// Route handler for retrieving match score and job description
// This endpoint:
// 1. Authenticates the request using authMiddleware
// 2. Expects an identifierJob in the request body
// 3. Retrieves match score data and job description from the database
// 4. Returns both pieces of data in the response
// Error handling is implemented for missing fields and server errors

router.post("/get-match-score-and-description", authMiddleware, async (req, res) => {
  try {
    // const { identifier } = req.identifier; 
    const { identifierJob } = req.body;
    if (!identifierJob) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const scoreData = await getMatchScoreData(identifierJob);
    const jobDescription = await getJobDescription(identifierJob);
    return res
    .status(200)
    .json({scoreData, jobDescription });
}
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});
export default router;

