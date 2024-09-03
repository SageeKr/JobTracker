import React, { useState } from "react";
import { Link as RouterLink, useLoaderData } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Paper,
  IconButton,
} from "@mui/material";
import { useLoading } from '../contexts/LoadingContext.js';
import SnackBarAlert from "../components/SnackBarAlert";


import DeleteIcon from "@mui/icons-material/Delete";
const MyPositions = () => {
  const loadedPositions = useLoaderData(); // Get the data from the loader
  const [positions, setPositions] = useState(loadedPositions); // Initialize state with the loader data
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); 
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); 
  const { setIsLoading } = useLoading();
  const [selectedStatus, setSelectedStatus] = useState('All');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAddPosition = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("url");
    try {
      const response = await fetch(
        "http://localhost:8080/get-raw-job-description",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
          credentials: "include"
        }
      );

      if (response.ok) {
        //setSnackbarOpen(true);
        const jobDescription = await response.json();
        const { jobDataWithMetadata, _id } = jobDescription;

        const newJobDescription = {
          id: _id,
          appliedDate: jobDataWithMetadata.date,
          company: jobDataWithMetadata.company,
          position: jobDataWithMetadata.title,
          url: jobDataWithMetadata.url,
          status: jobDataWithMetadata.status,
        };

        setPositions((prevPositions) => [...prevPositions, newJobDescription]);
        setSnackbarOpen(true);
        setSnackbarMessage("Position added successfully!");
        setSnackbarSeverity("success");
      } else {
        const errorText = await response.text();
        if (response.status === 500 && errorText.toLowerCase().includes("generativeai")) {
          console.error("Failed to fetch job description");
          setSnackbarOpen(true);
          setSnackbarMessage("Google Generative AI service error: Please try again later.");
          setSnackbarSeverity("error");
        }
        else{
        console.error("Failed to fetch job description");
        setSnackbarOpen(true);
        setSnackbarMessage("Failed to add position. Please try again.");
        setSnackbarSeverity("error");
      }
      }
    } catch (error) {
      console.error("Error:", error);
      setSnackbarOpen(true);
      setSnackbarMessage("An error occurred while adding the position.");
      setSnackbarSeverity("error");
    }
    setIsLoading(false);
  };

  const handleDeletePosition = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/delete-job-description/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (response.ok) {
        setPositions((prevPositions) =>
          prevPositions.filter((position) => position.id !== id)
        );
      } else {
        console.error("Failed to delete job description");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8080/update-job-description-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include"
        }
      );

      if (response.ok) {
        // Update the state immediately
        setPositions((prevPositions) =>
          prevPositions.map((position) =>
            position.id === id ? { ...position, status: newStatus } : position
          )
        );
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleStatusClick = (status) => {
    setSelectedStatus(status);
  };
  const statuses = ['All', ...new Set(positions.map(p => p.status))];

  const filteredPositions = selectedStatus === 'All'
    ? positions
    : positions.filter(position => position.status === selectedStatus);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Positions
      </Typography>
      {/* Button Bar for filtering */}
      <Box mb={2}>
        {statuses.map(status => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'contained' : 'outlined'}
            onClick={() => handleStatusClick(status)}
            sx={{ margin: '0 5px 5px 0' }}
          >
            {status}
          </Button>
        ))}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applied Date</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Position Name</TableCell>
              <TableCell>Url Link for Position</TableCell>
              <TableCell>Position Status</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPositions.map((position) => (
              <TableRow key={position.id}>
                <TableCell>{position.appliedDate}</TableCell>
                <TableCell>
                  {position.company}
                </TableCell>
                <TableCell>
                  <RouterLink to={`/positions/${position.id}`}>
                    {position.position}
                  </RouterLink>
                </TableCell>
                <TableCell sx={{ wordBreak: "break-all", maxWidth: "200px" }}>
                  <a
                    href={position.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {position.url}
                  </a>
                </TableCell>
                <TableCell>
                  <Select
                    value={position.status}
                    onChange={(e) =>
                      handleStatusChange(position.id, e.target.value)
                    }
                  >
                    <MenuItem value="Interested">Interested</MenuItem>
                    <MenuItem value="Hold">Hold</MenuItem>
                    <MenuItem value="In process">In process</MenuItem>
                    <MenuItem value="Finished">Finished</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeletePosition(position.id)}
                    color="secondary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box component="form" onSubmit={handleAddPosition} mt={4}>
        <Typography variant="h6" gutterBottom>
          Add New Position
        </Typography>
        <TextField
          fullWidth
          type="url"
          name="url"
          label="URL Link for Position"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Add Position
        </Button>
      </Box>

      <Typography variant="h6" mt={4}>
        Total number of applied positions: {positions.length}
      </Typography>
      <SnackBarAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Container>
  );
};

export default MyPositions;
