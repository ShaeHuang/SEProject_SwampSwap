export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

export function validatePhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber.trim()) {
    return "Phone number is required";
  }
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 10) {
    return null;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return null;
  }
  return "Please enter a valid US phone number";
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
}
