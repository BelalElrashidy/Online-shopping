document.addEventListener('DOMContentLoaded', function () {
    const productIdInput = document.getElementById('productId');
    const addToWishlistButton = document.getElementById('addToWishlist');
    var wishlistItemsDiv = document.getElementById('wishlist-container');
    const token = localStorage.getItem('token'); // Retrieve JWT token

    // Fetch Wishlist Items
    async function fetchWishlist() {
        try {
            const response = await fetch('http://localhost:3000/wishlist', {
                method: 'GET',
                headers: { 'Authorization': token },
            });

            if (!response.ok) {
                const errorData = await response.json();
                wishlistItemsDiv.innerHTML = `<p style="color: red;">${errorData.message || 'Failed to fetch wishlist items'}</p>`;
                return;
            }

            const wishlistItems = await response.json();

            if (wishlistItems.length === 0) {
                wishlistItemsDiv.innerHTML = '<p>Your wishlist is empty.</p>';
                return;
            }

            wishlistItems.forEach((item) => {
                console.log(item)
                wishlistItemsDiv.innerHTML += `
                <div class="wishlist-item">
                <img src="/images/h1.jpeg"/>
                      <a href="">${item.product_name}</a>
                      <h4>${item.product_price.toFixed(2)}</h4>
                      <button onclick="removeFromWishlist('${item.wishlist_id}')">Remove</button>
                  </div>
                    
                `;
                
            });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            wishlistItemsDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again later.</p>';
        }
    }

    // Add to Wishlist
    

    // Remove from Wishlist
    window.removeFromWishlist = async (wishlistId) => {
        try {
            const response = await fetch(`http://localhost:3000/wishlist/${wishlistId}`, {
                method: 'DELETE',
                headers: { 'Authorization': token },
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchWishlist();
            } else {
                alert(data.error || 'Failed to remove item from wishlist');
            }
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
        }
    };

    // Load wishlist on page load
    fetchWishlist();
});
