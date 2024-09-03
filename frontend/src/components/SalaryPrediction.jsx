import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  styled,
  Container
} from '@mui/material';

const SalaryPrediction = () => {
  const [predictions, setPredictions] = useState({});
  const [hoveredRole, setHoveredRole] = useState(null);
  const [images, setImages] = useState({});

  useEffect(() => {
    //fetch salary predictions data
    const fetchPredictions = async () => {
      try {
        const response = await fetch(
            'http://localhost:8080/get-salary-prediction-data',
            {
                method: 'GET',
                credentials: 'include'
            });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPredictions(data || {});
      } catch (error) {
        console.error('Error fetching salary predictions:', error);
      }
    };

    //fetch images
    const fetchImagesPredictions = async () => {
      try {
        const response = await fetch(
            'http://localhost:8080/get-salary-prediction-images',
            {
                method: 'GET',
                credentials: 'include'
            });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const parsedImages = JSON.parse(data);
        setImages(parsedImages || []);
      }
      catch (error) {
        console.error('Error fetching salary predictions images:', error);
      }
    };

    fetchPredictions();
    fetchImagesPredictions();
  }, []);

//Styled components
const formatRole = (role) => {
    return role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
const PredictionCircle = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: '50%',
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  aspectRatio: '1 / 1',
  position: 'relative',
  width: '190px', 
  height: '190px',
  '&:hover': {
    '& .prediction-image': {
      transform: 'translateX(-50%) scale(1.05)',
    },
  },
}));

const PredictionAmount = styled(({ isSmall, ...other }) => (
  <Typography {...other} />
))(({ theme, isSmall }) => ({
  fontSize: isSmall ? '0.8em' : '2em',
  fontWeight: isSmall ? 'normal' : 'bold',
  color: isSmall ? '#000000' : theme.palette.primary.main,
}));


const PredictionRole = styled(Typography)(({ theme }) => ({
  fontSize: '1em',
  marginTop: theme.spacing(1),
}));

const PredictionImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  top: '110%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '350px',
  height: 'auto',
  zIndex: 20,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
}));
//hover on the box show the images, each box to each circle
const HoverBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '5px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
  zIndex: 15,
}));

return (
  <Container maxWidth="md">
  <Box px={2} py={2}>
    <Typography variant="h5" gutterBottom sx={{ color: '#425F57' }}>
      Salary Predictions
    </Typography>
    <Grid container spacing={4}>
      {/* Iterate over the predictions object, 
      which contains role names as keys and scores as values */}
      {Object.entries(predictions).map(([role, score]) => (
       <Grid item xs={12} sm={6} key={role}>
          <PredictionCircle
            elevation={3}
            onMouseEnter={() => setHoveredRole(role)} // Set the hovered role when the mouse enters
            onMouseLeave={() => setHoveredRole(null)}
          >
            <PredictionAmount isSmall={score === null}>
              {score !== null ? `${parseInt(score).toLocaleString()}₪` : 'Could not calculate prediction'}
            </PredictionAmount>
            <PredictionRole>
              {formatRole(role)}
            </PredictionRole>
            {hoveredRole === role && images[role] && (
            <HoverBox>
                <PredictionImage
                  src={`data:image/jpeg;base64,${images[role]}`}
                  alt={`${role}_prediction`}
                  className="prediction-image"
                  onError={(e) => {
                    console.error(`Error loading image for ${role}`);
                    e.target.style.display = 'none';
                  }}
                />
              </HoverBox>
            )}
          </PredictionCircle>
        </Grid>
      ))}
    </Grid>
  </Box>
  </Container>
);
};

export default SalaryPrediction;