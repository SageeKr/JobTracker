import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Grid,
  Link,
  Typography,
  Button,
} from "@mui/material";
import FileUpload from "./FileUploadBtn";
import { useLoading } from '../contexts/LoadingContext.js';
import SnackBarAlert from "./SnackBarAlert.jsx";

/**
 * UploadResume component handles the resume upload process.
 * gets moveDataToSignUp a function which sets the state in ResumeSignUpPage in order to get the cv data to SignUp
 */
function UploadResume({ moveDataToSignUp }) {

  //state to manage the Snackbar being open or close
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  //holds the error the might come back from the fetch
  const [error, setErrorMessage] = useState(null);
  const { setIsLoading } = useLoading();

  const [resume, setResume] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Make the API request to upload resume for the user
    try {
      const formData = new FormData();
      formData.append("file", resume);

      const response = await fetch("http://localhost:8080/uploadresume", {
        method: "POST",
        body: formData,
      });

      setIsLoading(false);
      const errorData = await response.json();

      if (response.status === 400) {
        setErrorMessage(errorData.message || "Upload failed");
        return;
      }
      if (response.status === 500 && errorData.message.toLowerCase().includes("generativeai")) {
        setErrorMessage("Google Generative AI service error: Please try again later." || "Upload failed");
      }

      if (response.ok) {
        const data = await response.json();
        const { identifier, name, email, phone } = data.cvData;
        setSnackbarOpen(true); // Set success message
        moveDataToSignUp( { "identifier":identifier, "name":name, "email":email, "phone":phone })

      } else {
        console.error("Sign up failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <Container component="form" onSubmit={handleSubmit} maxWidth="xs">
      <CssBaseline />
      <FileUpload setFile={setResume} file={resume} />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Submit
      </Button>
      {error && (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      )}
      {/*the SnackBarAlert component which presnts the success alert*/}
        <SnackBarAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message="The cv file was saved successfully."
        severity="success"
      />
      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Go back to Sign in
            </Link>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UploadResume;
