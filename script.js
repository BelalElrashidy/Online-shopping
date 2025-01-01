// Function to toggle password visibility
function togglePasswordVisibility() {
  var x = document.getElementById("pass");

  if (x.type === "password") {
    x.type = "text"; // Show password
  } else {
    x.type = "password"; // Hide password
  }
}

// Function to validate the sign-up form
function validateForm() {
  var password = document.getElementsByName("psw")[0].value;
  var confirmPassword = document.getElementsByName("psw-repeat")[0].value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return false; // Prevent form submission
  }

  // Continue with form submission if passwords match
  alert("Sign up successful!"); // Display a success message

  // You can add additional logic or actions here

  return true; // Allow form submission
}

// Function to validate the login form
function validate_signup() {
  // Get input values
  var email = document.forms["loginForm"]["email"].value;
  var password = document.forms["loginForm"]["pass"].value;
  var repeatPassword = document.forms["loginForm"]["psw-repeat"].value;

  // Simple email validation (you may want to enhance this)
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return false; // Prevent form submission
  }

  // Check if the password is at least 8 characters long
  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return false; // Prevent form submission
  }

  // Check if the repeated password matches the original password
  if (password !== repeatPassword) {
    alert("Passwords do not match.");
    return false; // Prevent form submission
  }

  // You can add more specific validations here based on your needs
  
  // If all validations pass, you can proceed with form submission
  alert("Form submitted successfully!");
  return true; // Allow form submission
}
;
 