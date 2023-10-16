export const validateName = (name: string) => {
  if (!name) {
    return 'Enter Your Name';
  }
  if (name.length < 5) {
    return 'Name should be at least 5 characters';
  } else {
    return '';
  }
};

export const validateEmail = (email: string) => {
  if (!email) {
    return 'Enter Your Email';
  }
  const validEmailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!validEmailPattern.test(email.trim())) {
    return 'Invalid email';
  } else {
    return '';
  }
};

export const validatePassword = (password: string) => {
  if (!password) {
    return 'Enter Your Password';
  }
  if (password.length < 5) {
    return 'Password must be at least 5 characters';
  } else {
    return '';
  }
};
