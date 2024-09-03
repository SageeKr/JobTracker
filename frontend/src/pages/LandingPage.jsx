import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Avatar, 
} from "@mui/material";
import Icon from "../assets/logo.png";

/**
 * the websites LandingPage it explains the app capabilities and allowing the user to go sign in or sign up.
 */
const LandingPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              textAlign: "center",
            }}
          >
            <Avatar
              src={Icon}
              alt="Website Icon"
              sx={{ width: 80, height: 80, mb: 2, mx: 'auto' }} 
            />
            <Typography variant="h3" gutterBottom>
              Welcome to Job Tracker
            </Typography>
            <Typography variant="h6" gutterBottom>
              Your ultimate tool to track and manage your job applications.
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Sign In
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Track Applications
            </Typography>
            <Typography>
              Keep track of all your job applications in one place.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Manage Status
            </Typography>
            <Typography>
              Update the status of each application as you move through the
              process.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Match Resumes
            </Typography>
            <Typography>
              Check if the job matches your resume to increase your chances of
              success.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Ready to get started?
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/signup"
              >
                Sign Up Now
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingPage;
