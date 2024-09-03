export function isValidString(value, minLength = 1) {
  return value && value.trim().length >= minLength;
}
//validite the date
export function isValidDate(value) {
  const date = new Date(value);
  return value && date !== 'Invalid Date';
}
//validite the email adress
export function isValidEmail(email){
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
//validite the file type of the given cv
export function isValidCvType(cv){
  return (
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ].includes(cv)
  )
};
//validite if the password and confirm password match
export function isMatchingPasswords(passwordA,passwordB) {
  return passwordA === passwordB;
}
//validite the phone number
export function isValidPhoneNumber(phoneNumber) {
  var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (regex.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
}