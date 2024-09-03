import { redirect } from "react-router-dom";
export const loadJobDescriptions = async () => {
  const response = await fetch("http://localhost:8080/get-all-job-descriptions", {
    credentials: "include"
  });

  if (response.status === 401) {
    const res = await fetch("http://localhost:8080/logout", {
      credentials: "include",
    });

    if (res.ok) return redirect("/login");
  }

  if (!response.ok) {
    throw new Response("Failed to fetch job descriptions", { status: 500 });
  }

  const data = await response.json();

  const parsedPositions = data.map(job => {
    const jobDescriptionData = JSON.parse(job.jobDescriptionData);
    return {
      id: job._id,
      appliedDate: jobDescriptionData.date,
      company: jobDescriptionData.company,
      position: jobDescriptionData.title,
      url: jobDescriptionData.url,
      status: jobDescriptionData.status,
    };
  });

  return parsedPositions;
};
