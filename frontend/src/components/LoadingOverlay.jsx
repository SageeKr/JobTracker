import React from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { useLoading } from '../contexts/LoadingContext';

export default function LoadingOverlay() {
  //using the isLoading context to open or close the loading overlay Backdrop
  const { isLoading } = useLoading();
  return (
    <Backdrop
      sx={{
        color: 'primary',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        
      }}
      open={isLoading}
    >
      <CircularProgress color="inherit" size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2}}>
        Submitting...
      </Typography>
    </Backdrop>
  );
}
