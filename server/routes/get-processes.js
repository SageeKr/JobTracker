import express from "express";
import { authMiddleware } from "../util/auth.js";
import { getProcessData,deleteProcessData } from "../util/mongo.js";

const router = express.Router();

//get positions and return the stages from process schema
router.post("/get-processes", authMiddleware, async (req, res) => {
  try {
      const { positions } = req.body;

      const updatedPositions = await Promise.all(positions.map(async (onePosition) => {
          const { id } = onePosition;
          if (id) {
              try {
                  const process = await getProcessData(id);
                  if (process && process[0] && process[0].processData) {
                      const { stage, date, comment } = process[0].processData;
                      return { ...onePosition, stage, date, comment };
                  }
              } catch (error) {
                  console.error(`Error processing position ${id}:`, error);
                  return onePosition; // Return original position if there's an error
              }
          }
          return onePosition; // Return original position if there's no id
      }));
      res.json(updatedPositions); // Send the response
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: "Error fetching processes" });
  }
});

//get one position and return it's stage from process schema
router.post("/get-one-process", authMiddleware, async (req, res) => {
    try {
        const { identifierJob } = req.body;
        if (identifierJob) {
            const process = await getProcessData(identifierJob);
            if (process && process.length > 0) {
                const { stage, date, comment } = process[0].processData;
                // Return an object containing stage, date, and comment
                res.json({ stage, date, comment });
            } else {
                // If no process is found, return null values
                res.json({ stage: null, date: null, comment: null });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error fetching process" });
    }
});
router.post("/delete-process", authMiddleware, async (req, res) => {
    try {
        const { identifierJob } = req.body;
        if (identifierJob) {
            const deleteResult = await deleteProcessData(identifierJob);
            if (deleteResult) {
                res.json({ message: "Process deleted successfully." });
            } else {
                res.status(404).json({ message: "Process not found." });
            }
        } else {
            res.status(400).json({ message: "Job identifier is required." });
        }
    } catch (error) {
        console.error('Error deleting process:', error);
        res.status(500).json({ message: "Error deleting process." });
    }
});

export default router;  