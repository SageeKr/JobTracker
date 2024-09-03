import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" 
    sx={{ py: 2, 
    textAlign: 'center', 
    backgroundColor: 'primary.main', 
    color: 'white' }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Job-Tracker. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
