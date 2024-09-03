import React from "react";
import { Container, Typography, Box, Grid, Paper, Avatar } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import ChangeUserData from "../components/ChangeUserData";

const ProfilePage = () => {
  const { user } = useOutletContext();

  const userJoinedDate = user.joinDate && new Date(user.joinDate);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
              <Typography variant="h3">
                {user.name.charAt(0).toUpperCase()}
              </Typography>
            </Avatar>
            <Typography variant="h6">{user.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Typography>
                <strong>Username:</strong> {user.name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Phone: </strong>
              {user.phone}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Account Statistics
            </Typography>
            <Typography>
              <strong>Join Date:</strong> {userJoinedDate?.toLocaleDateString() ?? 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Account Management
            </Typography>
            <ChangeUserData
              title="Change Password"
              fields={[
                {
                  name: "oldPassword",
                  label: "Old Password",
                  type: "password",
                  autoComplete: "oldPassword",
                  autoFocus: true,
                },
                {
                  name: "newPassword",
                  label: "New Password",
                  type: "password",
                  autoComplete: "newPassword",
                },
                {
                  name: "newPasswordConfirm",
                  label: "New Password Confirm",
                  type: "password",
                  autoComplete: "newPasswordConfirm",
                },
              ]}
              endpoint="http://localhost:8080/change-password"
              successMessage="Password changed successfully!"
            />
            <ChangeUserData
              title="Change Resume"
              fields={[
                {
                  name: "passwordr",
                  label: "Password",
                  type: "password",
                  autoComplete: "current-password",
                  autoFocus: true,
                },
              ]}
              isFileUpload={true}
              endpoint="http://localhost:8080/change-resume"
              successMessage="Resume changed successfully!"
            />
            <ChangeUserData
              title="Change Account Information"
              fields={[
                {
                  name: "password",
                  label: "Password",
                  type: "password",
                  autoComplete: "current-password",
                  autoFocus: true,
                },
                {
                  name: "newUsername",
                  label: "New Username",
                  type: "text",
                  autoComplete: "username",
                  defaultValue: `${user.name}`,
                },
                {
                  name: "newEmail",
                  label: "New Email",
                  type: "email",
                  autoComplete: "email",
                  defaultValue: `${user.email}`,
                },
                {
                  name: "newPhone",
                  label: "New Phone",
                  type: "phone",
                  autoComplete: "phone",
                  defaultValue: `${user.phone}`,
                },
              ]}
              endpoint="http://localhost:8080/change-account-information"
              successMessage="Username changed successfully!"
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
