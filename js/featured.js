async function loadFeatured() {
  const featured = document.getElementById("featured");
  if (!featured) return;

  try {
    const response = await fetch("http://localhost:3000/products", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to load featured products", data);
      return;
    }

    // Choose up to 4 featured products (you can change this rule)
    const items = data.slice(0, 4);

    featured.innerHTML = "";

    items.forEach((product, index) => {
      const imgName =
        index > 7
          ? "h" + (index - 7) + ".jpeg"
          : index % 2
          ? "sh" + (index + 1) + ".jpeg"
          : "product-" + (index + 1) + ".jpg";

      const itemHtml = `
        <a href="productDetails.html?id=${
          product.product_id
        }" class="product-item">
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
            <li><i class="bx bx-heart" onclick="event.preventDefault(); event.stopPropagation(); addToWishlist(${product.product_id})"></i></li>
            <li><i class="bx bx-cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart(${product.product_id})"></i></li>
          </ul>
        </a>
      `;

      featured.insertAdjacentHTML("beforeend", itemHtml);
    });
  } catch (error) {
    console.error("Error loading featured products", error);
  }
}

// Load featured products when the page is ready
document.addEventListener("DOMContentLoaded", loadFeatured);
