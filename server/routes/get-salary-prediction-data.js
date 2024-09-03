import express from "express";
import { authMiddleware } from "../util/auth.js";
import { FindOneCv } from "../util/mongo.js"

const router = express.Router();

//return salary predictions - roles and values
router.get("/get-salary-prediction-data", authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.identifier;
        if (!identifier) {
            return res.status(400).json({ message: 'Missing required fields' });   
        }   
    const cv = await FindOneCv({user: identifier});
    if (!cv) {
      return res.status(404).json({ message: 'CV not found' });
    }
    const jobSelect = JSON.parse(cv.cvData.jobSelect || '{}');

    const salaryPredictions = {};
    for (const [job, _] of Object.entries(jobSelect)) {
      if (cv.cvData[job]) {
        salaryPredictions[job] = cv.cvData[job];
      }
      else{
        salaryPredictions[job] = null;
      }

    }
    res.json(salaryPredictions);
  } catch (error) {
    console.error('Error fetching salary prediction data:', error);
    res.status(500).json({ message: 'Error fetching salary prediction data' });
  }
});

//return the histogram images for each role
router.get("/get-salary-prediction-images", authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.identifier;
        if (!identifier) {
            return res.status(400).json({ message: 'Missing required fields' });   
        }   
    const cv = await FindOneCv({user: identifier});
    if (!cv) {
      return res.status(404).json({ message: 'CV not found' });
    }
    const images = JSON.stringify(cv.images || []);
    res.json(images);
  } 
  catch (error) {
    console.error('Error fetching salary prediction images:', error);
    res.status(500).json({ message: 'Error fetching salary prediction images' });
  }
});

export default router;