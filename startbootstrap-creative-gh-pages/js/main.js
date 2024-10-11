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
    
    // Show user data and hide sign-in button
    // $(".data").css("display", "block");
    // $(".g_id_signin").css("display", "none");

    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
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
    window.location.href = 'google-customer-transaction-form.html'; 
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



// function signOut() {
//     // Display the modal to confirm logout
//     let logoutModal = new bootstrap.Modal(document.getElementById('confirmLogoutModal'), {
//         backdrop: 'static',
//         keyboard: false
//     });
//     logoutModal.show();
// }

// function confirmSignOut() {
//     google.accounts.id.disableAutoSelect(); // Disable auto sign-in
//     localStorage.removeItem('token');
//     localStorage.clear();
//     window.location.href = 'home.html';
//     alert('User signed out successfully.');
// }





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

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log('Authentication successful:', responseData);

        const selectedPackageCode = localStorage.getItem('selectedPackageCode');
        if (selectedPackageCode) {
            window.location.href = 'customer-select-package.html';
        }
        // Check if the response data contains the expected fields
        if (responseData.status === 200 && responseData.token && responseData.data) {
            localStorage.removeItem('token');
            // Save the token and email in localStorage
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('email', responseData.data.email);
            localStorage.setItem('customerCode', responseData.data.customerCode) // Make sure 'email' is accessible

            // Redirect or perform an action after successful authentication
            window.location.href = 'google-customer-transaction-form.html'; // Change to your desired page
        } else {
            console.error('Authentication failed:', responseData.message);
            // Optionally handle error responses here
        }
    } catch (error) {
        console.error('Error authenticating Google customer:', error);
    }
}
