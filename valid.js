function myfunction(){
    var x =document.getElementById("pass");

    if(x.type === "password"){
        x.type = "text";
    }
    else{
        x.type = "password";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    // const message = document.getElementById('message');
    const email = document.getElementById('email');
    const password = document.getElementById('pass');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const data = {email:email.value,password:password.value}
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email:email.value, password:password.value }),
                });

                const data = await response.json();

                if (response.ok) {
                    // message.style.color = 'green';
                    // message.textContent = data.message;
                    localStorage.setItem('token', data.token); // Store token in localStorage
                    // Redirect to a protected page if necessary
                    window.location.href = '/indexx.html';
                } 
            } catch (error) {
                // message.style.color = 'red';
                // message.textContent = 'An error occurred. Please try again.';
                console.error('Error:', error);
            }
        });
    } else {
        console.error("The login form element is missing in the DOM.");
    }
});

