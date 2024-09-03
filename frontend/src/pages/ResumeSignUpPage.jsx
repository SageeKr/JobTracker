import { useState } from "react";
import SignUp from "../components/SignUp.jsx";
import UploadResume from "../components/UploadResume.jsx";

function ResumeSignUpPage() {
  const [autoFillUserData,setAutoFillUserData]=useState(null);

  return (
    <>
      {autoFillUserData ? < SignUp userData={autoFillUserData}/> : <UploadResume moveDataToSignUp={setAutoFillUserData}/>}
    </>
  );
}

export default ResumeSignUpPage;