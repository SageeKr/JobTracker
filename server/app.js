import express from "express";
import authRoutes from "./routes/users.js";
import ResumesRoutes from "./routes/resumes.js";
import RawJobDescription from "./routes/get-raw-job-description.js";
import MatchScore from "./routes/get-match-score.js";
import ProcessData from './routes/get-processes.js';
import SalaryPrediction from './routes/get-salary-prediction-data.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
const port = 8080;

// // CORS
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
//   res.setHeader("Access-Control-Allow-Methods", "GET, PUT", "POST");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   //next() passs the request to the next middleware in the chain.
//   next();
// });
// CORS Configuration
const corsOptions = {
  origin: "http://localhost:3000", // Must be explicit when `credentials: true`
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", 'PATCH' ], // Allowed methods
  credentials: true // allow cookies to be sent with the requests
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());// Middleware to parse JSON request bodies
app.use(authRoutes);
app.use(ResumesRoutes);
app.use(RawJobDescription);
app.use(MatchScore);
app.use(ProcessData);
app.use(SalaryPrediction);

export default app;