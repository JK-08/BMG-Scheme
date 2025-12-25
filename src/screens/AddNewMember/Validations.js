// utils/Validations.js
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return "Aadhaar number is required";
  
  // Clean the input - remove spaces and dashes
  const cleanAadhaar = aadhaar.replace(/\s|-/g, '');
  
  // Check length
  if (cleanAadhaar.length !== 12) return "Aadhaar must be 12 digits";
  
  // Check if all digits
  if (!/^\d+$/.test(cleanAadhaar)) return "Aadhaar must contain only numbers";
  
  // Verhoeff Algorithm for Aadhaar validation
  if (!isValidAadhaar(cleanAadhaar)) return "Invalid Aadhaar number";
  
  return "";
};

// Verhoeff Algorithm Implementation for Aadhaar validation
const isValidAadhaar = (aadhaar) => {
  // Verhoeff multiplication table d
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  // Verhoeff permutation table p
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  // Verhoeff inverse table inv
  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
  
  let c = 0;
  const reversedArray = aadhaar.split('').reverse();
  
  for (let i = 0; i < reversedArray.length; i++) {
    c = d[c][p[i % 8][parseInt(reversedArray[i], 10)]];
  }
  
  return c === 0;
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
  
  // Additional validation for mobile number starting digits
  const firstDigit = mobile.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return "Mobile number must start with 6, 7, 8, or 9";
  }
  
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
  
  // First digit cannot be 0
  if (pincode.charAt(0) === '0') {
    return "Pincode cannot start with 0";
  }
  
  return "";
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 100) return "Name is too long";
  
  // Allow letters, spaces, dots, and hyphens
  if (!/^[a-zA-Z\s\.\-']+$/.test(name)) {
    return "Name can only contain letters, spaces, dots, and hyphens";
  }
  
  return "";
};

export const validateDOB = (dob) => {
  if (!dob) return "Date of Birth is required";
  
  const dobDate = new Date(dob);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(dobDate.getTime())) return "Invalid date";
  
  // Check if date is in the past
  if (dobDate > today) return "Date of Birth cannot be in the future";
  
  // Calculate age
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  
  if (age < 18) return "You must be at least 18 years old";
  if (age > 120) return "Please enter a valid Date of Birth";
  
  return "";
};

export const validateNomineeName = (name) => {
  if (!name) return "Nominee name is required";
  if (name.trim().length < 2) return "Nominee name must be at least 2 characters";
  return "";
};

export const validateAddressField = (field, fieldName) => {
  if (!field) return `${fieldName} is required`;
  if (field.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  return "";
};