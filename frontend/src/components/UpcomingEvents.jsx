import React, { useEffect, useState } from 'react';
import {  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Collapse,
  styled } from '@mui/material';


const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch job descriptions
    const fetchJobDescriptionData = async () => {
      try {
        const jobDescriptionsResponse = await fetch(
            'http://localhost:8080/get-all-job-descriptions', 
        {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include'
        });
        const jobDescriptionsData = await jobDescriptionsResponse.json();
        //map the positions to get for each position the company to display,
        //and the id to look for in process schema
        const positions = jobDescriptionsData.map(job => {
            const { _id, jobDescriptionData } = job;
            const jobDataWithMetadata = JSON.parse(jobDescriptionData);
            return {
              id: _id,
              company: jobDataWithMetadata.company,
            };
          });
          //after get the positions, get them from the process schema
        await fetchProcessData(positions);
    }
    catch (error) {
        console.error('Error fetching timeline data:', error);
    }
}
//fetch the process data
const fetchProcessData = async (positionsData) => {
    try{
        const processDataResponse = await fetch(
            `http://localhost:8080/get-processes`, 
            {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ positions:positionsData }),
          });
    const eventsData = await processDataResponse.json();
    const currentDate = new Date();
    //check to get only future positions, and get the 3 soon
    const futureEvents = eventsData
      .filter(event => new Date(event.date) > currentDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
    setEvents(futureEvents);
    }
catch (error) {
    console.error('Error fetching timeline data:', error);
}}
fetchJobDescriptionData();
}, []);

  //set the formate date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const EventCard = styled(Card)(({ theme }) => ({
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(2),
  }));
  
  const EventDate = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    color: '#425F57',
  }));
  
  const EventDescription = styled(Typography)(({ theme }) => ({
    marginTop: '10px',
    fontSize: '0.9em',
    color: theme.palette.primary.main,
  }));

  return (
    <Box sx={{ padding: '20px' }} className="upcoming-events">
      <Typography variant="h5" gutterBottom sx={{ color: '#425F57' }}>
        Upcoming Events
      </Typography>
      <Box className="event-list">
        {events.length === 0 ? (
          <Typography variant="body1" sx={{ color: '#757575' }}>
            No future events yet.
          </Typography>
        ) : (
          events.map((event) => (
            <EventCard key={event.id}>
              <CardContent>
                <EventDate variant="subtitle1">
                  {formatDate(event.date)}
                </EventDate>
                <EventDescription>
                  {event.stage} at {event.company}
                </EventDescription>
                {event.comment && (
                  <EventDescription>
                    Comment: {event.comment}
                  </EventDescription>
                )}
              </CardContent>
            </EventCard>
          ))
        )}
      </Box>
    </Box>
  );
};
export default UpcomingEvents;