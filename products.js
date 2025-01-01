const newarr = document.getElementById("new-arr");
const addToCartButton = document.getElementById('addToCart');
    let productId = 1; // Replace with the actual product ID
    const quantity = 1; // Default quantity

    async function addToWishlist(id) {
        productId = id?id:1;
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        if (!productId) {
            alert('Please enter a product ID');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/wishlist', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.error || 'Failed to add item to wishlist');
                window.location.href="/";
            }
        } catch (error) {
            console.error('Error adding item to wishlist:', error);
        }
    }


    async function addToCart (id) {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        productId = id?id:1;
        if (!token) {
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/cart', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId, quantity:1 }),
            });

            const data = await response.json();

            if (response.ok) {
                // messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
                console.log(response)
            } else {
                // messageDiv.innerHTML = `<p style="color: red;">${data.error || 'Failed to add item to cart'}</p>`;
                console.log(response)
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            messageDiv.innerHTML = '<p style="color: red;">An error occurred. Please try again later.</p>';
        }
    };
async function getProducts(){
    try {
        const response = await fetch('http://localhost:3000/products', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            
        });

        const data = await response.json();

        if (response.ok) {
            // message.style.color = 'green';
            // message.textContent = data.message;
            console.log(data)
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                newarr.innerHTML+=`<div class="product-item">
          <div class="overlay">
            <a href="" class="product-thumb">
              <img src="./images/${index>7?'h'+(index-7)+'.jpeg':index%2?'sh'+(index+1)+'.jpeg':'product-'+(index+1) +'.jpg'}" alt="" />
            </a>
          </div>
          <div class="product-info">
            <span>MEN'S CLOTHES</span>
            <a href="">${element.product_name}</a>
            <h4>${element.product_price} L.E </h4>
          </div>
          <ul class="icons">
            <li><i class="bx bx-heart" onclick=addToWishlist(${element.product_id})></i></li>
 
            <li><i class="bx bx-cart" onclick="addToCart(${element.product_id})"></i></li>
          </ul>
        </div>
      </div>`
                
            }
            // localStorage.setItem('token', data.token); // Store token in localStorage
            // Redirect to a protected page if necessary
            // window.location.href = '/indexx.html';
        } 
    } catch (error) {
        // message.style.color = 'red';
        // message.textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
}

getProducts()




// <div class="product-item">
//           <div class="overlay">
//             <a href="" class="product-thumb">
//               <img src="./images/IMG_2713.JPG" alt="" />
//             </a>
//           </div>
//           <div class="product-info">
//             <span>MEN'S CLOTHES</span>
//             <a href="">Mint Green  Versace Film Titles suit</a>
//             <h4>680 L.E </h4>
//           </div>
//           <ul class="icons">
//             <li><i class="bx bx-heart"></i></li>
 
//             <li><i class="bx bx-cart"></i></li>
//           </ul>
//         </div>
//       </div>