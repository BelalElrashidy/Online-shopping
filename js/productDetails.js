function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", function () {
  const idParam = getQueryParam("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;
  if (!id) {
    const details = document.querySelector(".product-detail .details");
    if (details) {
      details.innerHTML = "<p>Product not found.</p>";
    }
    return;
  }

  fetch(`http://localhost:3000/products/${id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load product");
      }
      return res.json();
    })
    .then((product) => {
      // Update image
      const mainImg = document.querySelector(
        ".product-detail .image-container img#zoom"
      );
      if (mainImg) {
        // If your DB stores only filename, adjust path accordingly
        mainImg.src =
          product.image || `./images/product-${product.product_id}.jpg`;
        mainImg.alt = product.product_name;
      }

      // Update breadcrumb/category text
      const breadcrumb = document.querySelector(".product-detail .right span");
      if (breadcrumb) {
        breadcrumb.textContent = `Home/${product.category_name}`;
      }

      // Update title and price
      const titleEl = document.querySelector(".product-detail .right h1");
      if (titleEl) {
        titleEl.textContent = product.product_name;
      }

      const priceEl = document.querySelector(".product-detail .right .price");
      if (priceEl) {
        priceEl.textContent = `$${product.product_price}`;
      }

      // Update description
      const descEl = document.querySelector(".product-detail .right p");
      if (descEl) {
        descEl.textContent = product.product_description || "";
      }
    })
    .catch((err) => {
      console.error(err);
      const details = document.querySelector(".product-detail .details");
      if (details) {
        details.innerHTML = "<p>Failed to load product details.</p>";
      }
    });
});
