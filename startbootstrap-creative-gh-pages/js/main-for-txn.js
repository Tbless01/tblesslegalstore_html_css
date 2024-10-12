// Google Sign-In callback function
function onSignIn(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    var fullName = responsePayload.name;  // Full name
    var nameParts = fullName.split(' ');  // Split the name by spaces
    
    var firstName = nameParts[0];  // First name
    var lastName = nameParts[1];   // Last name (or surname)
    
    $("#firstname").text(firstName);
    $("#lastname").text(lastName);
    // $("#name").text(responsePayload.name);
    $("#email").text(responsePayload.email);
    $("#image").attr('src', responsePayload.picture);
    
    console.log('Name: ' + firstName);
    console.log('Image URL: ' + lastName);
    console.log('Email: ' + responsePayload.email);

    const customerRequest = {
        email: responsePayload.email,
        firstName: firstName,
        lastName: lastName
        // Optionally include other user info if needed
    };

    // Save the selected package code
    // localStorage.setItem('selectedPackageCode', packageCode);

    // Authenticate the customer
    authenticateGoogleCustomer(customerRequest);
    // window.location.href = 'google-customer-transaction-form.html'; 
}

// Decode JWT token returned by Google
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Sign out function
function signOut() {
    google.accounts.id.disableAutoSelect(); // Disable auto sign-in
    // $(".g_id_signin").css("display", "block");
    // $(".data").css("display", "none");
    localStorage.removeItem('token');
    localStorage.clear()
    window.location.href = 'home.html';
    alert('User signed out successfully.');
}

async function authenticateGoogleCustomer(customerRequest) {
    const BASE_URL = 'https://drab-rozamond-tbless01-2ae1501e.koyeb.app/tblesslegalstore/v1/api';
    try {
        const response = await fetch(`${BASE_URL}/authentication/google-customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerRequest)
        });

        // Parse the response data once
        const responseData = await response.json();

        if (!response.ok) {
            // Handle the error response
            console.error('Authentication failed:', responseData.message);
            // Optionally handle error responses here (e.g., display error message to the user)
            return; // Early return to prevent further processing
        }

        console.log('Authentication successful:', responseData);

        // Ensure the response contains the expected fields
        if (responseData.token && responseData.data) {
            // Remove any previous token
            localStorage.removeItem('token');

            // Save the token and other relevant information to localStorage
            localStorage.setItem('token', responseData.token); // Save the JWT token
            localStorage.setItem('email', responseData.data.email); // Extract email from data
            localStorage.setItem('customerCode', responseData.data.customerCode); // Extract customerCode from data

            // Redirect to payment page
            window.location.href = 'customer-transaction-details.html'; // Adjust according to your desired redirection
        } else {
            console.error('Invalid response structure:', responseData);
        }
    } catch (error) {
        console.error('Error authenticating Google customer:', error);
    }
}
