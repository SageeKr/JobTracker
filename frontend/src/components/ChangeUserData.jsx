import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SnackBarAlert from "../components/SnackBarAlert";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUploadBtn";
import MultiSelectWithSearch from "./MultiSelect";
import { jobList } from "../util/jobTitleList.js";
import { useLoading } from '../contexts/LoadingContext.js';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

//component which i being used to present the dialog and allow data change
export default function ChangeUserData({
  title,
  fields,
  endpoint,
  successMessage,
  isFileUpload,
}) {
  //state to hold error which might come back from the fetch
  const [errorMessage, setErrorMessage] = useState(null);
  //open is the state which manages the dialog being open or close
  const [open, setOpen] = useState(false);
  //state to manage the Snackbar being open or close
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  //the file is for the upload file component in case the user wants to change resume
  const [file, setFile] = useState(null);
  //the loading context to manage loading while featching
  const { isLoading,setIsLoading } = useLoading();
  //the jon list is in case the user wants to change resume and select other jobs for the salary prediction.
  const [ListOfSelectedJobs, setListOfSelectedJobs] = useState([]);

  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);
    
    if (isFileUpload && file) {
      formData.append("file", file);
      formData.append("jobSelect", ListOfSelectedJobs);
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    setIsLoading(false);
    const errorData = await response.json();
    console.log(errorData.message)
    if (response.status === 500 && errorData.message.toLowerCase().includes("generativeai")) {
      setErrorMessage("Google Generative AI service error: Please try again later." || "Upload failed");
    }
      else if (
        response.status === 422 ||
        response.status === 401 ||
        response.status === 400
      ) {
        setErrorMessage(errorData.message || "Authentication failed");
      } else if (!response.ok) {
        setErrorMessage("Could not authenticate user.");
      } else {
        setSnackbarOpen(true);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    //refrshing the page for the effects to show up
    navigate(0);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 1, mr: 1 }}
        onClick={handleClickOpen}
      >
        {title}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}
            {/* going over all the recived fields and creating them*/}
            {fields.map((field) => (
              <TextField
                key={field.name}
                margin="normal"
                required
                fullWidth
                id={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                autoFocus={field.autoFocus}
                defaultValue={field.defaultValue || ""}
                disabled={isLoading}
              />
            ))}
            {/*if this component is being used for regular forms thats fine but in case the user wants to change resume
            other fields are required such as the file upload and the multi select*/}
            {isFileUpload && (
              <>
              <FileUpload
                file={file}
                setFile={setFile}
              />
               <MultiSelectWithSearch
                name="job_experience"
                id="job_experience"
                options={jobList}
                setSelectedJobs={setListOfSelectedJobs}
              />
              <Typography component="p" sx={{mt:2, color: "rgba(0, 0, 0, 0.4)"}} >
              *Note: Updating your resume will not change match scores for previously applied jobs.*
              </Typography>
              </>
            )}
            {/*the Dialog actions for submiting or canceling*/}
            <DialogActions>
              <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>Change</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
      {/*the SnackBarAlert component which presnts the success alert*/}
      <SnackBarAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={successMessage}
        severity="success"
      />
    </React.Fragment>
  );
}
