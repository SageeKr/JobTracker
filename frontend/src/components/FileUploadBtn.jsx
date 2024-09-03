import React from "react";
import { Box, Button, Typography, CssBaseline, Container } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";

const FileUpload = ({
  file,
  setFile,
}) => {
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Upload Your CV (pdf or doc File)
        </Typography>
        <Box sx={{ mt: 3 }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="upload-file"
          />
          <label htmlFor="upload-file">
            <Button
              variant="contained"
              component="span"
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              {file ? file.name : "Upload File "}
              {file ? <FileDownloadDoneIcon /> : <FileUploadIcon />}
            </Button>
          </label>
        </Box>
      </Box>
    </Container>
  );
};

export default FileUpload;
