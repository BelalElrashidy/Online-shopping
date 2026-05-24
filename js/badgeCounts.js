document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  const cartCountEls = document.querySelectorAll(".cart-count");
  const wishlistCountEls = document.querySelectorAll(".wishlist-count");

  if (!token) {
    // Not logged in: leave counts at 0
    return;
  }

  async function updateCartCount() {
    try {
      const res = await fetch("http://localhost:3000/cart/count", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      console.log("Cart count response:", res);
      if (!res.ok) return;
      const data = await res.json();
      console.log("Cart count:", data);

      const count = data.count || 0;
      cartCountEls.forEach((el) => (el.textContent = count));
    } catch (e) {
      console.error("Failed to update cart count", e);
    }
  }

  async function updateWishlistCountFromServer() {
    try {
      const res = await fetch("http://localhost:3000/wishlist/count", {
        headers: {
          Authorization: token,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const count = data.count || 0;
      wishlistCountEls.forEach((el) => (el.textContent = count));
    } catch (e) {
      console.error("Failed to update wishlist count", e);
    }
  }

  // expose globally so other scripts (e.g. add-to-cart) can refresh counts
  window.updateCartCount = updateCartCount;
  window.updateWishlistCountFromServer = updateWishlistCountFromServer;

  updateCartCount();
  updateWishlistCountFromServer();
});
