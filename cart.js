document.addEventListener('DOMContentLoaded', function () {
    const cartItemsDiv = document.getElementById('cartItems');
    const total = document.getElementById('total');
    
    async function fetchCartItems() {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        console.log(token)

        if (!token) {
            cartItemsDiv.innerHTML = '<p style="color: red;">You need to log in to view your cart.</p>';
            window.location.href = '/';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cart', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData)
                if(errorData.error=="Invalid token.") window.location.href="/"
                cartItemsDiv.innerHTML = `<p style="color: red;">${errorData.message || 'Failed to fetch cart items'}</p>`;
                return;
            }

            const cartItems = await response.json();

            if (cartItems.length === 0) {
                cartItemsDiv.innerHTML = '<p>No items in your cart.</p>';
                return;
            }

            // Display cart items
            let sum = 0;
            // cartItemsDiv.innerHTML = '';
            cartItems.forEach((item) => {
                sum +=item.product_price.toFixed(2)*item.quantity;
                cartItemsDiv.innerHTML += `
                    
                            <tr>
          <td>
            <div class="cart-info">
              <img src="./images/product-2.jpg" alt="" />
              <div>
                <p><strong>${item.product_name}</strong></p>
                <span>Price: $${item.product_price.toFixed(2)}</span> <br />
                <a href="#">remove</a>
              </div>
            </div>
          </td>
          <td><input type="number" value="${item.quantity}" min="1" /></td>
          <td>$${item.product_price.toFixed(2)*item.quantity}</td>
        </tr>
                `;
            });
            Number(sum).toFixed(2)
            let tax = Number(sum*.14).toFixed(2);
            let t = Number(Number(tax)+sum).toFixed(2);
            total.innerHTML=`<tr>
            <td>Subtotal</td>
            <td>$${sum}</td>
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
            console.error('Error fetching cart items:', error.data);
            cartItemsDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again later.</p>';

        }
    }

    fetchCartItems();
});
