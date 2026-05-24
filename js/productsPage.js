const addToCartButton = document.getElementById("addToCart");
let productId = 1; // Replace with the actual product ID
const quantity = 1; // Default quantity

async function addToWishlist(id) {
  productId = id ? id : 1;
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  if (!productId) {
    alert("Please enter a product ID");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/wishlist", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.error || "Failed to add item to wishlist");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
  }
}

async function addToCart(id) {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  productId = id ? id : 1;
  if (!token) {
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/cart", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });

    const data = await response.json();

    if (response.ok) {
      // messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
      console.log(response);
    } else {
      // messageDiv.innerHTML = `<p style="color: red;">${data.error || 'Failed to add item to cart'}</p>`;
      console.log(response);
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    messageDiv.innerHTML =
      '<p style="color: red;">An error occurred. Please try again later.</p>';
  }
}
async function loadAllProducts() {
  const container = document.getElementById("all-products-list");
  if (!container) return;

  try {
    const response = await fetch("http://localhost:3000/products", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to load products", data);
      return;
    }

    container.innerHTML = "";

    data.forEach((product, index) => {
      const imgName =
        index > 7
          ? "h" + (index - 7) + ".jpeg"
          : index % 2
          ? "sh" + (index + 1) + ".jpeg"
          : "product-" + (index + 1) + ".jpg";

      const itemHtml = `
        <a href="productDetails.html?id=${
          product.product_id
        }" class="product-item" data-id="${
        product.product_id
      }" data-category="${
        product.category_name || "MEN'S CLOTHES"
      }" data-name="${product.product_name}" data-price="${
        product.product_price
      }">
          <div class="overlay">
            <div class="product-thumb">
              <img src="./images/${imgName}" alt="${product.product_name}" />
            </div>
          </div>
          <div class="product-info">
            <span>${product.category_name || "MEN'S CLOTHES"}</span>
            <span>${product.product_name}</span>
            <h4>${product.product_price} L.E</h4>
          </div>
          <ul class="icons">
            <li><i class="bx bx-heart" onclick="event.preventDefault(); event.stopPropagation(); addToWishlist(${
              product.product_id
            })"></i></li>
            <li><i class="bx bx-cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart(${
              product.product_id
            })"></i></li>
          </ul>
        </a>
      `;

      container.insertAdjacentHTML("beforeend", itemHtml);
    });
  } catch (error) {
    console.error("Error loading products", error);
  }
}

// Load products for the products page when ready
document.addEventListener("DOMContentLoaded", loadAllProducts);
