const TRANSLATE_PROMPT = "Can you translate the following text to english? Please resond only with the translated text, in a raw text format\n"

const CV_EXTRACT_PROMPT = `I have a resume and I'd like you to extract the following information:\n\n- name\n- email\n- phone\n- work_experience (an array of jsons with company_name, position, and dates for each job) \n- latest_degree_earned\n- total_years_of_experience (calculated from the work experience section)\n- university\n- degree\n- skills (including technical and soft skills)\n
Please return only the JSON without any extra caption outside of it. In the extracted information, remove stopwords and make it lower case.\n\nHere is the JSON schema definition for the output:
\n\`\`\`json\n{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"email\": {\n      \"type\": \"string\"\n    },\n    \"phone\": {\n      \"type\": \"string\"\n    },\n    \"work_experience\": {\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"company_name\": {\n            \"type\": \"string\"\n          },\n          \"position\": {\n            \"type\": \"string\"\n          },\n          \"dates\": {\n            \"type\": \"string\"\n          }\n        },\n        \"required\": [\"company_name\", \"position\", \"dates\"]\n      }\n    },\n    \"total_years_of_experience\": {\n      \"type\": \"integer\"\n    },\n    \"university\": {\n      \"type\": \"string\"\n    },\n    \"degree\": {\n      \"type\": \"string\"\n    },\n    \"skills\": {\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"string\"\n      }\n    },\n    \"latest_degree_earned\": {\n      \"type\": \"string\"\n    }\n  },\n  \"required\": [\"name\", \"email\", \"phone\", \"work_experience\", \"total_years_of_experience\", \"university\", \"degree\", \"skills\", \"latest_degree_earned\"]\n}\n\`\`\`\n\n---\n\nPlease extract the information according to this schema and return the JSON.`;

const JOB_DESCRIPTION_EXTRACT_PROMPT = `The following is a text representing a job description. The text can be in multiple languages. Please extract and translate the following details into English:
1. The position's name or title (\`title\`)
2. The company's (\`company\`)
3. The needed skills (\`skills\`)
4. The required years of experience (\`yearsOfExperience\`)
5. The job's requirements (\`requirements\`)\n
Ensure the language you use is English, even if it needs to be translated. Avoid symbols and enumeration in strings within arrays. Please format your response in raw JSON using camelCase casing.\n
\`\`\`json\n{\n  \"title\": \"string\",\n  \"company\": \"string\",\n  \"skills\": [\"string\"],\n  \"yearsOfExperience\": \"integer\",\n  \"requirements\": [\"string\"]\n}\n\`\`\`\n`

const EVALUATE_CV_JOB_MATCH_SCORE_PROMPT = `Predict the match of a job applicant and an open job position using the provided CV and Job Description JSONs.
Evaluate the match based on the following criteria and their precise relationship to the job requirements. Ensure to extract and calculate the relevant data accurately and provide a detailed breakdown of the score.\n
1. **Years of Experience (0-35 points)**:
    - Extract the total years of relevant experience from the applicant's CV (take \`total_years_of_experience\` from the CV object)(let's call this ApplicantExperience).
    - Compare the total years of relevant experience with the required years of experience in the job description (take \`yearOfExperience\` from the job description object)(let's call this DescriptionExperience):
    - If the ApplicantExperience meets or exceeds the DescriptionExperience: 35 points
    - If the ApplicantExperience is slightly below the DescriptionExperience (within 1 year): 25 points
    - If the ApplicantExperience is moderately below the DescriptionExperience (within 2 years): 15 points
    - If the ApplicantExperience is significantly below the DescriptionExperience (more than 2 years): 0 points
2. **Skills (0-40 points)**: 
    - Extract the list of required and additional skills from the job description.
    - Compare each skill with the skills listed in the applicant's CV:
    - Each essential skill match: 5 points per skill (up to 25 points for 5 essential skills)  
    - Each additional skill match: 3 points per skill (up to 15 points for 5 additional skills)  
    - No match for essential skills: 0 points per skill\n
3. **Job Responsibilities (0-20 points)**: 
    - Extract the job responsibilities from the applicant's previous roles.
    - Compare the job responsibilities with those listed in the job description:
    - Strong match (most responsibilities align): 20 points
    - Partial match (some responsibilities align): 10 points
    - Minimal match (few responsibilities align): 5 points
    - No match: 0 points\n
4. **Education (0-5 points)**:
    - Relevant degree: 5 points
    - No relevant degree: 0 points\n
Please use a scale of 0-100 to represent the match strength by summing up all the criteria points (score).\n
Categorize the score into one of the following categories:\n- 0-20: \"Irrelevant\"\n- 21-40: \"Weak Match\"\n- 41-60: \"Partial Match\"\n- 61-80: \"Strong Match\"\n- 81-100: \"Perfect Match\"\n
Present the reasons for the match, especially if the score is below 60, listing them in an array (reasons).
Additionally, provide some points to consider during an interview (tips).\n\nInclude all the information in a single JSON schema.
Use the strings inside the parentheses to set the object entry names, with the following schema:\n\n\`\`\`json\n{\n    \"score\": Int,\n    \"scoreCategory\": String,\n    \"breakdown\": {\n        \"yearsOfExperience\": Int,\n        \"skills\": Int,\n        \"jobResponsibilities\": Int,\n        \"education\": Int\n    },\n    \"reasons\": [String],\n    \"tips\": [String]\n}\n\`\`\`\n\n**Example:**\n
Given a CV and job description, your output should look similar to the following:\n\n\`\`\`json\n{\n    \"score\": 75,\n    \"scoreCategory\": \"Strong Match\",\n    \"breakdown\": {\n        \"yearsOfExperience\": 35,\n        \"skills\": 30,\n        \"jobResponsibilities\": 10,\n        \"education\": 0\n    },\n    \"reasons\": [\n        \"Has 5 years of experience, matching the required experience.\",\n        \"Proficient in key skills: Python, Data Analysis, SQL, which are required.\",\n        \"Previous job responsibilities align well with the job description.\",\n        \"Does not hold a relevant degree.\"\n    ],\n    \"tips\": [\n        \"Discuss experience with Python in more detail.\",\n        \"Ask about specific projects involving data analysis.\"\n    ]\n}\n\`\`\`\n
Please make sure to provide a detailed breakdown of the scoring for each category, clearly showing how the total score is calculated.\n\n---\n\nThis version of the prompt ensures that the output includes a detailed breakdown of the score for each component, making it clear how the total score was derived.`

const generateEvaluateCvJobMatchScoreContent = (cvData, jobDescriptionData) => {
    console.log(`
CV: ${JSON.stringify(cvData)}
      
Job Description: ${JSON.stringify(jobDescriptionData)}
`);
    return`
CV: ${JSON.stringify(cvData)}
      
Job Description: ${JSON.stringify(jobDescriptionData)}
`};

export {
    TRANSLATE_PROMPT,
    CV_EXTRACT_PROMPT,
    JOB_DESCRIPTION_EXTRACT_PROMPT,
    EVALUATE_CV_JOB_MATCH_SCORE_PROMPT,
    generateEvaluateCvJobMatchScoreContent
};
