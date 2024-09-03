# JOB TRACKER
**Job Tracker** is an all-in-one tool designed to help job seekers efficiently manage their job applications.
Our mission is to simplify the job search process by providing a comprehensive platform to track applications,
manage statuses, and match resumes to job descriptions, reducing the stress of job hunting.

## Installation Instructions
To get started with Job Tracker, open two terminal windows and navigate to the server ( `cd server`) and frontend ( `cd frontend`) directories, respectively. Run the following commands in each terminal:
```sh
npm install
```
```sh
npm start
```
  
## Usage Instructions
### User Registration and Login
- **Sign-Up**: New users can sign up by uploading their CV.
- **Login**: Existing users can log in directly.
### Job Selection and Salary Prediction
- **Job Selection**: After uploading your CV, browse through the list of job opportunities and select the most suitable ones.
- **Salary Prediction**: The platform automatically predicts your potential salary based on your skills and the relevance to the chosen job.
### Managing Job Applications
- **My Positions**: In the 'My Positions' page, you can view and manage job offers you've applied to or wish to apply for. This page provides an overview of all your job applications.
- **Stage Updates**: Keep track of your application status by updating the stages (e.g., Interested, Interview) for each position.
### Dashboard Overview
- **Progress Timeline**: View a timeline showing your progress across different stages.
- **Upcoming Events**: See the three closest upcoming events related to your job applications.
- **Salary Prediction**: Review salary predictions for the jobs you selected during registration.

### Web Scraping Instructions for Job Links

When inserting job links for web scraping, follow these instructions to ensure successful data extraction:

#### General Instructions
- **Open Links in a New Page/Tab**: Right-click the job link and choose "Open in a New Page" or "Open in a New Tab" to allow the scraping tool to access the data. This step is essential for the web scraping tool to properly access and extract the data.

- **Ensure Unique ID**: The job link must contain a unique identifier (e.g., `JobID`, `positionid`) to accurately scrape the job details.

#### Specific Websites

1. **alljobs.co.il**  
   - Website Link: [https://www.alljobs.co.il](https://www.alljobs.co.il)  
   - Example: [https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=7850341](https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=7850341)

2. **team8.vc**  
   - Website Link: [https://team8.vc/careers](https://team8.vc/careers)  
   - Example: [https://team8.vc/careers/senior-fullstack-engineer-2/](https://team8.vc/careers/senior-fullstack-engineer-2/)

3. **jobmaster.co.il**  
   - Website Link: [https://www.jobmaster.co.il](https://www.jobmaster.co.il)  
   - Example: [https://www.jobmaster.co.il/jobs/checknum.asp?key=9152704](https://www.jobmaster.co.il/jobs/checknum.asp?key=9152704)

4. **jobnet.co.il**  
   - Website Link: [https://www.jobnet.co.il](https://www.jobnet.co.il)  
   - Example: [https://www.jobnet.co.il/jobs?positionid=11316026](https://www.jobnet.co.il/jobs?positionid=11316026)

5. **drushim.co.il**  
   - Website Link: [https://www.drushim.co.il](https://www.drushim.co.il)  
   - Example: [https://www.drushim.co.il/job/31189795/f36c9fd3/](https://www.drushim.co.il/job/31189795/f36c9fd3/)

6. **muvtal.co.il**  
   - Website Link: [https://www.muvtal.co.il](https://www.muvtal.co.il)  
   - Example: [https://www.muvtal.co.il/jobs/%D7%A8%D7%9B%D7%96%D7%AA_%D7%92%D7%99%D7%95%D7%A1_%D7%95%D7%94%D7%A9%D7%9E%D7%94_53030](https://www.muvtal.co.il/jobs/%D7%A8%D7%9B%D7%96%D7%AA_%D7%92%D7%99%D7%95%D7%A1_%D7%95%D7%94%D7%A9%D7%9E%D7%94_53030)

7. **il.indeed.com**  
   - Website Link: [https://il.indeed.com](https://il.indeed.com)  
   - Example: [https://il.indeed.com/viewjob?jk=7324788ef5943739&tk=1i67e0pm2iaj286q&from=serp&vjs=3](https://il.indeed.com/viewjob?jk=7324788ef5943739&tk=1i67e0pm2iaj286q&from=serp&vjs=3)

### Handling Gemini API 500 Errors
When working with the Gemini API, you may occasionally encounter **`500 Internal Server Error`** responses. This issue has been reported by other users and may occur due to temporary server-side problems.
#### Recommended Action
If you experience a **`500`** error while using the **`"gemini-1.5-flash"`** model, you can switch to a different model as a fallback.

#### Location to Update
Open the **`gemini-utils.js`** file and locate the following line:
```sh
model: "gemini-1.5-flash", //Primary choice. If it returns a 500 error, fallback to 'gemini-1.5-pro' or 'gemini-1.0-pro'
```
#### Instructions
- Replace **`"gemini-1.5-flash"`** with **`"gemini-1.5-pro"`** or **`"gemini-1.0-pro"`** if the primary model is returning errors.

This simple change should help you mitigate any issues caused by the **`500`** error.

##### Note
Keep in mind that while these fallback models can help reduce the impact of **`500`** errors, they might have slightly different performance characteristics.
We recommend testing the different models to ensure they meet your application's requirements.

## Authors and Acknowledgements
This project was developed by Sagee Kron, Tehilla Iny, Noa Dolev, and Ella Eyal.

