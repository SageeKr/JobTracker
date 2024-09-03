import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import Timeline from '../components/Timeline';
import UpcomingEvents from '../components/UpcomingEvents';
import SalaryPrediction from '../components/SalaryPrediction';

const DashboardGrid = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(2),
}));

const DashboardItem = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const Dashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      </Box>
      <DashboardGrid container spacing={3}>
        <Grid item xs={12} md={6.2}>
            <Timeline />
        </Grid>
        <Grid item xs={12} md={5.5} container direction="row" spacing={3}>
          <Grid item xs={12} md={25}>
            <DashboardItem sx={{Height: '100%'}}>
              <UpcomingEvents />
            </DashboardItem>
          </Grid>
          <Grid item xs={12} md={12}>
            <DashboardItem sx={{ Height: '100%'}}>
              <SalaryPrediction />
            </DashboardItem>
          </Grid>
        </Grid>
      </DashboardGrid>
    </Container>
  );
};

export default Dashboard;