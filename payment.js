async function getCartTotal() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/cart/total', {
            method: 'GET',
            headers: {
                Authorization: token,
            },
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`Cart Total: $${data.total_price.toFixed(2)}`);
            return data.total_price;
        } else {
            console.error(data.error || 'Failed to fetch cart total');
            return 0;
        }
    } catch (error) {
        console.error('Error fetching cart total:', error);
        return 0;
    }
}
async function checkout() {
    const token = localStorage.getItem('token');
    const paymentDetails = {
        payment_method: 'CreditCard', // Replace with user input
        address: 'E-Just UNI', // Replace with user input
        city: 'Alexanderia', // Replace with user input
        postal_code: '50200', // Replace with user input
        phone_number: '01114456151', // Replace with user input
    };

    try {
        const response = await fetch('http://localhost:3000/checkout', {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentDetails),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Checkout successful:', data.message);
        } else {
            console.error(data.error || 'Failed to checkout');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
    }
}
