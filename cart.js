document.addEventListener("DOMContentLoaded", function () {
  const cartItemsDiv = document.getElementById("cartItems");
  const total = document.getElementById("total");

  async function fetchCartItems() {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    if (!token) {
      cartItemsDiv.innerHTML =
        '<p style="color: red;">You need to log in to view your cart.</p>';
      window.location.href = "/";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/cart", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        if (errorData.error == "Invalid token.") window.location.href = "/";
        cartItemsDiv.innerHTML = `<p style="color: red;">${
          errorData.message || "Failed to fetch cart items"
        }</p>`;
        return;
      }

      const cartItems = await response.json();

      // Display cart items
      let sum = 0;
      // Clear previous rows except the header
      cartItemsDiv.innerHTML = `
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Subtotal</th>
        </tr>`;

      if (cartItems.length === 0) {
        cartItemsDiv.innerHTML +=
          '<tr><td colspan="3">No items in your cart.</td></tr>';
      } else {
        cartItems.forEach((item) => {
          const lineTotal = Number(item.product_price) * item.quantity;
          sum += lineTotal;
          cartItemsDiv.innerHTML += `
                            <tr>
          <td>
            <div class="cart-info">
              <img src="./images/product-2.jpg" alt="" />
              <div>
                <p><strong>${item.product_name}</strong></p>
                <span>Price: $${Number(item.product_price).toFixed(
                  2
                )}</span> <br />
                <a href="#">remove</a>
              </div>
            </div>
          </td>
          <td><input type="number" value="${item.quantity}" min="1" /></td>
          <td>$${lineTotal.toFixed(2)}</td>
        </tr>
                `;
        });
      }

      const subtotal = Number(sum).toFixed(2);
      const tax = Number(sum * 0.14).toFixed(2);
      const t = Number(Number(tax) + Number(sum)).toFixed(2);
      total.innerHTML = `<tr>
            <td>Subtotal</td>
            <td>$${subtotal}</td>
          </tr>
          <tr>
            <td>Tax</td>
            <td>$${tax}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>$${t}</td>
          </tr>`;
    } catch (error) {
      console.error("Error fetching cart items:", error.data);
      cartItemsDiv.innerHTML =
        '<p style="color: red;">An error occurred. Please try again later.</p>';
    }
  }

  fetchCartItems();
});
