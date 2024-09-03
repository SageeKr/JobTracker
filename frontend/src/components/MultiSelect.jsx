import React, { useState } from "react";
import { jobList } from "../util/jobTitleList.js";
import {
  TextField,
  Chip,
  Box,
  Autocomplete,
  Typography,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const MultiSelectWithSearch = ({ setSelectedJobs, error, helperText }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [yearsExperience, setYearsExperience] = useState({});
  const [inputErrors, setInputErrors] = useState({});

  const handleToggleOption = (event, options) => {
    setSelectedOptions(options);
    updateParentComponent(options, yearsExperience);
  };

  const handleYearsChange = (option, value) => {
    // Allow the user to type any value
    const floatValue = parseFloat(value);
    const isValid = !isNaN(floatValue) && floatValue >= 0 && value.match(/^(\d+\.5|\d+)$/);
  
    // Update the state even if invalid
    setYearsExperience({ ...yearsExperience, [option]: value });
    setInputErrors({ ...inputErrors, [option]: !isValid });
  
    // Update parent component only if valid
    if (isValid) {
      const updatedYearsExperience = { ...yearsExperience, [option]: floatValue };
      setYearsExperience(updatedYearsExperience);
      updateParentComponent(selectedOptions, updatedYearsExperience);
    }
  };

  const updateParentComponent = (selectedOptions, yearsExperience) => {
    const jobSelect = {};
    selectedOptions.forEach((option) => {
      jobSelect[option] = yearsExperience[option] || "";
    });
    const jsonString = JSON.stringify(jobSelect);
    setSelectedJobs(jsonString);
  };

  return (
    <Box>
      <Autocomplete
        multiple
        id="multi-select-with-search"
        options={jobList}
        getOptionLabel={(option) => option}
        filterSelectedOptions
        value={selectedOptions}
        onChange={handleToggleOption}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option}
              label={option}
              onDelete={() => {
                const newOptions = selectedOptions.filter(item => item !== option);
                setSelectedOptions(newOptions);
                updateParentComponent(newOptions, yearsExperience);
              }}
              deleteIcon={<CloseIcon />}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Search and Select Jobs"
            placeholder="Favorites"
            error={error}
            helperText={helperText}
          />
        )}
      />
      {selectedOptions.length > 0 && (
        <Typography variant="h6" gutterBottom>
          Years of Experience
        </Typography>
      )}
      {selectedOptions.map((option) => (
        <TextField
        key={option}
        label={`Years of experience for ${option}`}
        variant="outlined"
        fullWidth
        margin="normal"
          type="number"
          inputProps={{ step: "0.1" }}
        value={yearsExperience[option] || ''}
        onChange={(e) => handleYearsChange(option, e.target.value)}
        error={inputErrors[option]}
        helperText={inputErrors[option] ? "Please enter a positive number. Half numbers allowed (e.g., 1 or 1.5)" : ""}
      />
      ))}
    </Box>
  );
};

export default MultiSelectWithSearch;