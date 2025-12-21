export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return "Aadhaar number is required";
  if (aadhaar.length !== 12) return "Aadhaar must be 12 digits";
  if (!/^\d+$/.test(aadhaar)) return "Aadhaar must contain only numbers";
  return "";
};

export const validatePAN = (pan) => {
  if (!pan) return "";
  if (pan.length !== 10) return "PAN must be 10 characters";
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) return "Invalid PAN format";
  return "";
};

export const validateMobile = (mobile) => {
  if (!mobile) return "Mobile number is required";
  if (mobile.length !== 10) return "Mobile must be 10 digits";
  if (!/^\d+$/.test(mobile)) return "Mobile must contain only numbers";
  return "";
};

export const validateEmail = (email) => {
  if (!email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return "";
};

export const validatePincode = (pincode) => {
  if (!pincode) return "Pincode is required";
  if (pincode.length !== 6) return "Pincode must be 6 digits";
  if (!/^\d+$/.test(pincode)) return "Pincode must contain only numbers";
  return "";
};