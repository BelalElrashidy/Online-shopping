async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in to add items to your cart.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add item to cart");
      return;
    }

    if (typeof window.updateCartCount === "function") {
      window.updateCartCount();
    }

    alert("Item added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("An error occurred while adding to cart.");
  }
}
