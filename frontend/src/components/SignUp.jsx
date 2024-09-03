import { useNavigate, Link as RouterLink } from "react-router-dom";
import MultiSelect from "./MultiSelect.jsx";
import { jobList } from "../util/jobTitleList.js";
import { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import { useLoading } from '../contexts/LoadingContext.js';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Job Tracker
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
/**
 * SignUpPage component handles the sign-up process for new users.
 * gets the userData passed to it by the UploadResume
 */
export default function SignUpPage({ userData }) {
  const [ListOfSelectedJobs, setListOfSelectedJobs] = useState([]);
  const {setIsLoading } = useLoading();
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

// Handles the submission of the sign-up form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    const formData = new FormData(e.target);
    const authData = {
      identifier: userData.identifier,
      userName: formData.get("userName") || "",
      email: formData.get("email") || "",
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      phone: formData.get("contactNumber") || "",
      jobSelect: ListOfSelectedJobs,
    };

    try {
       // Make the API request to sign up the user
      const response = await fetch("http://localhost:8080/sign-up", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(authData),
        credentials: "include",
      });
  // Handle different response statuses
      if (response.status === 422 || response.status === 401) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Authentication failed");
        if (errorData.errors) {
          setFieldErrors(errorData.errors);
        }
      } else if (!response.ok) {
        setErrorMessage("Could not authenticate user.");
      } else {
      setIsLoading(false);
        navigate("/positions");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}></Avatar>
        <Typography component="h1" variant="h5">
          {userData?.name
            ? `Hey ${userData.name}, let's create your new user`
            : `Let's create your new user`}
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {errorMessage && <Alert sx={{ mb: 2 }} severity="error">{errorMessage}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="userName"
                label="Full Name"
                name="userName"
                autoComplete="userName"
                defaultValue={userData?.name || ""}
                error={!!fieldErrors.userName}
                helperText={fieldErrors.userName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                defaultValue={userData?.email || ""}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="contactNumber"
                label="Contact Number"
                type="tel"
                id="contactNumber"
                defaultValue={userData?.phone || ""}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Please Select Fitting Job Titles and Years Of Experience:
              </Typography>
              <MultiSelect
                name="job_experience"
                id="job_experience"
                options={jobList}
                setSelectedJobs={setListOfSelectedJobs}
                error={!!fieldErrors.jobList}
                helperText={fieldErrors.jobList}
              />
            </Grid>
            <Grid item xs={12}>
              <input type="hidden" name="job_experience" value={ListOfSelectedJobs} />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Go back to Sign in
                </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}
