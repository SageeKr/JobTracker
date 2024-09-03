import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage.jsx";
import AppContainer from "./components/AppContainer.jsx";
import ErrorPage from "./pages/Error.jsx";
import MyPositions from "./pages/MyPositions.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import AboutPage from "./pages/About.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import { loadMe } from "./loaders/meLoader.js";
import { loadJobDescriptions } from "./loaders/jobLoaders.js";
import SignInForm from "./pages/SignInPage.jsx";
import ResumeSignUpPage from "./pages/ResumeSignUpPage.jsx";
import { LoadingProvider } from './contexts/LoadingContext.js';
import LoadingOverlay from './components/LoadingOverlay.jsx'
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.js";
import Dashboard from "./pages/Dashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    id: 'root',
    children: [
      { path: "login", element: <SignInForm /> },
      { path: "signup", element: <ResumeSignUpPage /> },
      { index: true, element: <LandingPage /> },
      {
        path: "/", element: <AppContainer />, loader: loadMe, children: [
          { path: "positions", element: <MyPositions />, loader: loadJobDescriptions },
          { path: "positions/:id", element: <JobDetailPage /> },
          { path: "about", element: <AboutPage /> },
          { path: "userprofile", element: <UserProfile /> },
          { path: "dashboard", element: <Dashboard/>},
        ]
      },
    ],
  },
]);
function App() {
  return (
    <LoadingProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingOverlay />
      <RouterProvider router={router} />
    </ThemeProvider>
    </LoadingProvider>
  )
}

export default App;
