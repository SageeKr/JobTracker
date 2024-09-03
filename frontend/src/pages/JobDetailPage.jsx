import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import SnackBarAlert from "../components/SnackBarAlert";

/**
 * the page shows data about a specifc job the user added 
 */

const stagesOptions = [
  'Interesting', 'Applied CV', 'Screen Phone Interview',
  'Team Lead Interview', 'Home Task', 'Advanced Interview',
  'HR Interview', 'References', 'Agreement', 'Accepted'
];

const JobDetailPage = () => {
  //geting the id of the job by params from react-router-dom
  const { id } = useParams();
  const navigate = useNavigate();
  //states to hold the data being fetchd about each job
  const [matchScoreData, setMatchScoreData] = useState({});
  const [jobDescriptionData, setJobDescriptionData] = useState({});

  //state to hold the state data which will be shown as a comment
  const [stageData, setStageData] = useState({
    stage: stagesOptions[0],
    date: '',
    comment: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage]=useState("Stage saved successfully!");
  // Calculate the current date, minDate, and maxDate to limit the date input from the user into two years before and two years ahead from the current date
  const currentDate = new Date();
  const minDate = new Date(currentDate);
  minDate.setFullYear(currentDate.getFullYear() - 2); // Two years before
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(currentDate.getFullYear() + 2); // Two years ahead
  // Format dates to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };
  const formattedMinDate = formatDate(minDate);
  const formattedMaxDate = formatDate(maxDate);

  //loading all the Job Details on the start of the page
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/get-match-score-and-description",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifierJob: id }),
            credentials: "include"
          }
        );
        if (response.status === 401) {
          const res = await fetch("http://localhost:8080/logout", {
            credentials: "include",
          });

          if (res.ok) navigate("/login");
        }
        const responseData = await response.json();
        const scoreData = responseData.scoreData[0].MatchScoreData;
        const jobDescription = responseData.jobDescription[0];

        setMatchScoreData(scoreData);
        setJobDescriptionData(JSON.parse(jobDescription.jobDescriptionData));
      } catch (error) {
        console.error("Error showing job details:", error);
      }
    };

    const fetchStage = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/get-one-process",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifierJob: id }),
            credentials: "include"
          }
        );
        if (response.ok) {
          const responseStageData = await response.json();
          if (responseStageData) {
            setStageData({
              stage: responseStageData.stage,
              date: responseStageData.date || '',
              comment: responseStageData.comment || ''
            });
          } else {
            // Set to default values if no stage data is found
            setStageData({
              stage: stagesOptions[0],
              date: '',
              comment: ''
            });
          }
        } else {
          console.error("Error fetching stage:", response.statusText);
        }
      }
      catch (error) {
        console.error("Error fetching stage:", error);
      }
    };
    fetchJobDetails();
    fetchStage();
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setStageData({ ...stageData, [field]: value });
  };
  //handle user new stage submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/save-stages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifierJob: id, stageData }),
          credentials: "include"
        }
      );
      if (response.ok) {
        setSnackbarMessage("Stage added successfully!")
        setSnackbarOpen(true);
      } else {
        console.error("Error saving stages:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving stages:", error);
    }
  };
  const handleDeleteProcess = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/delete-process",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifierJob: id }),
            credentials: "include"
          }
        );
        if (response.ok) {
          setSnackbarMessage("Stage deleted successfully!")
          setSnackbarOpen(true);
          setStageData({
            stage: stagesOptions[0],
            date: '',
            comment: ''
          });
        } else {
          console.error("Error deleting process:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting process:", error);
      }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const highScoreColor = '#388E3C'; // Dark green for high scores
  const lowScoreColor = '#95c095';  // Light green for lower scores

  return (
    <Container>
      <Box display="flex" alignItems="center" mb={2} color="primary">
        <h2>
          {jobDescriptionData.title} - {jobDescriptionData.company}
        </h2>
      </Box>
      {matchScoreData && jobDescriptionData && (
        <Box display="flex" justifyContent="space-between" mb={2}>
          {/* Match Score Box */}
          <Box flex="1" component={Paper} p={2} mr={3}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }} >
              Match Score Details
            </Typography>
            <Box display="flex" justifyContent="center" mb={2} >
              <Card
                variant="outlined"
                sx={{
                  width: '130px',         // Smaller width for the card
                  height: '100px',
                  textAlign: 'center',    // Center the content inside the card
                  backgroundColor: matchScoreData.score >= 80 ? highScoreColor : lowScoreColor,
                  color: '#fff',
                }}
              >
                <CardContent>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {matchScoreData.score}%
                  </Typography>
                  <Typography variant="subtitle1">
                    Match Score
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              <strong>Score Category:</strong> {matchScoreData.scoreCategory}
            </Typography>
            <Typography variant="body1">
              <strong>Reasons:</strong>
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
            {matchScoreData.reasons && matchScoreData.reasons.map((reason, index) => (
               <ListItem key={index} sx={{ display: 'list-item', paddingLeft: 0 }}>
               <ListItemText primary={reason} />
             </ListItem>
           ))}
         </List>
            <Typography variant="body1">
              <strong>Tips:</strong>
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              {matchScoreData.tips && matchScoreData.tips.map((tip, index) => (
                <ListItem key={index} sx={{ display: 'list-item', paddingLeft: 0 }}>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Job Description Box */}
          <Box flex="1" component={Paper} p={3} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                textAlign: 'center',
                color: "primary",  // Green color for the title
                fontWeight: 'bold',
                marginBottom: 3
              }}
            >
              Job Description
            </Typography>

            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Title:</strong> {jobDescriptionData.title}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Company:</strong> {jobDescriptionData.company}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Date:</strong> {jobDescriptionData.date}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Status:</strong> {jobDescriptionData.status}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Skills:</strong>
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              {jobDescriptionData.skills && jobDescriptionData.skills.map((skill, index) => (
                <ListItem key={index} sx={{ display: 'list-item', paddingLeft: 0 }}>
                  <ListItemText primary={skill} />
                </ListItem>
              ))}
            </List>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
              <strong>Requirements:</strong>
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              {jobDescriptionData.requirements && jobDescriptionData.requirements.map((requirement, index) => (
                <ListItem key={index} sx={{ display: 'list-item', paddingLeft: 0 }}>
                  <ListItemText primary={requirement} />
                </ListItem>
              ))}
            </List>
          </Box>

        </Box>
      )}
      {/*stage*/}
      <Box component={Paper} p={2} mb={2}>
        <Typography variant="h5" gutterBottom>
          Update Stage
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Stage</InputLabel>
            <Select
              value={stageData.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
            >
              {stagesOptions.map((stage, index) => (
                <MenuItem key={index} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={stageData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            inputProps={{
              min: formattedMinDate,
              max: formattedMaxDate,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Comment"
            multiline
            rows={4}
            value={stageData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Save
          </Button>
        </form>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ mt: 2 }} 
          onClick={handleDeleteProcess}
>
  Delete Process
</Button>
      </Box>
      <SnackBarAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity="success"
      />

    </Container>
  );
};

export default JobDetailPage;
