import React from "react";
import { Container, Typography, Box, Paper, Grid } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import noaDolevImgSrc from "../assets/NoaDolev.jpg";
import sageeKronImgSrc from "../assets/SageeKron.jpg";
import ellaEyalImgSrc from "../assets/EllaEyal.jpeg";
import tehilaInyImgSrc from "../assets/TehilaIny.jpeg";

const AboutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          About Job Tracker
        </Typography>
        <Typography variant="h6" gutterBottom>
          Job Tracker is your ultimate tool for managing job applications.
        </Typography>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Project History
          </Typography>
          <Typography>
            Founded in 2023, Job Tracker began as a final project for a Bachelor's degree program at Bar-Ilan University,
            Job Tracker was developed to address the challenges faced by job seekers in managing their applications.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Mission Statement
          </Typography>
          <Typography>
            Our mission is to streamline the job application process and help
            job seekers stay organized and efficient. We aim to reduce the
            stress of job hunting by providing a comprehensive tool that tracks
            applications, manages statuses, and matches resumes to job
            descriptions.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Products or Services
          </Typography>
          <Typography>
            Job Tracker offers a range of features designed to assist you in
            your job search journey:
          </Typography>
          <ul>
            <li>Track all your job applications in one place.</li>
            <li>Update the status of each application as you progress.</li>
            <li>
              Match your resume to job descriptions to improve your chances of
              success.
            </li>
            <li>Receive reminders for follow-ups and deadlines.</li>
            <li>Generate reports and insights on your application progress.</li>
          </ul>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Project Vision
          </Typography>
          <Typography>
            Our vision is to develop an innovative job-seeking platform that
            empowers individuals to effectively navigate their early career
            paths. We aim to create a user-friendly interface that combines
            personalized job matching, skill assessment tools, and career
            guidance resources, ultimately enhancing the job search experience.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Location Information
          </Typography>
          <Typography>
            Based in Tel-Aviv, we serve job seekers, offering support and
            resources to help you succeed no matter where you are.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Contact Information
          </Typography>
          <Typography>
            Have any questions or feedback? Feel free to reach out to us at{" "}
            <a href="mailto:support@jobtracker.com">support@jobtracker.com</a>.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Team Members
          </Typography>
          <Typography>
            Our dedicated team combines students in information science and an
            experienced human resources professional to provide a tool that
            meets the needs of modern job hunters.
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Meet the team:
          </Typography>
        </Box>

        <Box
          mt={2}
          sx={{
            maxWidth: "40%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={10} sm={3} textAlign="center">
              <Box
                component="img"
                src={noaDolevImgSrc}
                alt="Noa Dolev"
                width="100%"
                sx={{ borderRadius: "50%" }}
              />
              <Typography>Noa Dolev</Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <Box
                component="img"
                src={sageeKronImgSrc}
                alt="Sagee Kron"
                width="100%"
                sx={{ borderRadius: "50%" }}
              />
              <Typography>Sagee Kron</Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <Box
                component="img"
                src={ellaEyalImgSrc}
                alt="Ella Eyal"
                width="100%"
                sx={{ borderRadius: "50%" }}
              />
              <Typography>Ella Eyal</Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <Box
                component="img"
                src={tehilaInyImgSrc}
                alt="Tehila Iny"
                width="100%"
                sx={{ borderRadius: "50%" }}
              />
              <Typography>Tehilla Iny</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Typography variant="h5" gutterBottom>
            Connect with us on LinkedIn:
          </Typography>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <a
                href="https://www.linkedin.com/in/noa-dolev-a2b68617b/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "underline",
                  color: "inherit",
                }}
              >
                <LinkedInIcon sx={{ color: "#0e76a8", marginRight: "8px" }} />
                Noa Dolev
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/sagee-kron-634198200/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "underline",
                  color: "inherit",
                }}
              >
                <LinkedInIcon sx={{ color: "#0e76a8", marginRight: "8px" }} />
                Sagee Kron
              </a>
            </li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
