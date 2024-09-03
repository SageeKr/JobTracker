import React, { useEffect, useState } from 'react';
import { Chrono } from 'react-chrono';
import { Button, Paper } from '@mui/material';

const Timeline = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const stages = [
    'Interesting', 'Applied CV', 'Screen Phone Interview',
    'Team Lead Interview', 'Home Task', 'Advanced Interview',
    'HR Interview', 'References', 'Agreement', 'Accepted'
  ];

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
        const positionsData  = jobDescriptionsData.map(job => {
            const { _id, jobDescriptionData } = job;
            const jobDataWithMetadata = JSON.parse(jobDescriptionData);
            return {
              id: _id,
              company: jobDataWithMetadata.company,
              position: jobDataWithMetadata.title,
              status: jobDataWithMetadata.status,
            };
          });
          //map the statuses of all the positions
          const uniqueStatuses = ['All', ...new Set(positionsData.map(p => p.status))];
          setStatuses(uniqueStatuses);
          
          //to the positions that get from the job desciption - get the process 
          await fetchProcessData(positionsData);
        }
    catch (error) {
        console.error('Error fetching timeline data:', error);
        setLoading(false);
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
    const processData = await processDataResponse.json();
    setPositions(processData);
    setLoading(false);
}
catch (error) {
    console.error('Error fetching timeline data:', error);
    setLoading(false);
}}
fetchJobDescriptionData();

}, []);

//when the user click to filter the positions by status
const handleStatusClick = (status) => {
  setSelectedStatus(status);
};


  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter positions based on the selected status
  const filteredPositions = selectedStatus === 'All'
    ? positions
    : positions.filter(position => position.status === selectedStatus);

    //set the items fot the timeline cards
    const items = stages.map(stage => {
      const positionsInStage = filteredPositions.filter(position => position.stage === stage);
      const count = positionsInStage.length;
    return {
        cardTitle: `${stage} (${count})`,
        title: `${stage} (${count})`,
        cardSubtitle: count > 0 
          ? positionsInStage.map(position => `${position.company}: ${position.position}`).join('\n')
          : 'No positions',
      };
    });

    
    return (
      <>
      <Paper sx={{p: 1, mb: 2}}>
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
      </Paper>
      <Paper className="timeline-container" sx={{height: "900px"}}>
      {/* Button Bar for filtering status*/}
        <Chrono
        key={JSON.stringify(items)} //help to synchronize the chrono after filtering
          items={items}
          mode="VERTICAL_ALTERNATING"
          cardHeight={110}
          slideItemDuration={2000}
          slideShow
          density='Low'
          theme={{
            primary: '#425F57',
            secondary: '#F2F1EB',
            cardBgColor: '#f5f5f5',
            cardForeColor: '#425F57',
            titleColor: '#88AB8E',
            cardTitleColor: "#425F57",
            cardSubtitleColor: "#88AB8E",
            titleColorActive: '#4d756b', 
          }}
          fontSizes={{
            cardTitle: '1.2rem',
            cardSubtitle: '0.8rem',
            cardText: '0.8rem',
          }}
          classNames={{
            card: 'custom-card',
            cardTitle: 'custom-card-title',
            cardSubtitle: 'custom-card-subtitle',
            controls: 'timeline-controls'
          }}
          scrollable={true}
          useReadMore={true}
          enableLayoutSwitch={true}
          enableQuickJump={true}
        />
      </Paper>
      </>
    );
  };
export default Timeline;