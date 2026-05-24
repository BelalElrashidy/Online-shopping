// Shared authentication helpers (logout, token handling)

(function () {
  const userIcon = document.getElementById("user-icon");

  if (!userIcon) return;

  userIcon.addEventListener("click", function (event) {
    event.preventDefault();

    // If no token, just go to login page
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "index.html";
      return;
    }

    // Clear auth-related data
    localStorage.removeItem("token");

    // Optional: clear any other user-specific storage keys you use
    // localStorage.removeItem("wishlist");
    // localStorage.removeItem("cart");

    // Redirect to login page after logout
    window.location.href = "login.html";
  });
})();
