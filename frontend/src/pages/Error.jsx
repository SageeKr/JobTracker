import { useNavigate } from "react-router-dom";
import MainNavigation from "../components/MainNavigation.jsx";
import { Container, Typography, Box, Button } from "@mui/material";
/**
 * ErrorPage which is shown for exmple if the user went to an unknown route.
 */
function ErrorPage() {
  const navigate = useNavigate();
  return (
    <>
      <MainNavigation />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          sx={{ mt: 4 }}
        >
          <Typography variant="h4" gutterBottom>
          Oops!
          </Typography>
          <Typography variant="h4" gutterBottom>
          Sorry, an unexpected error has occurred.
          </Typography>
          <Typography variant="body1" gutterBottom>
            Could not find this page!
          </Typography>
          {/*navigate to previous page*/}
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back to Previous Route
          </Button>
        </Box>
      </Container>
    </>
  );
}

export default ErrorPage;
