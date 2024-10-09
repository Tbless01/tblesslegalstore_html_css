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

    const customerRequest = {
        email: responsePayload.email,
        firstName: firstName,
        lastName: lastName
        // Optionally include other user info if needed
    };

    // Save the selected package code
    localStorage.setItem('selectedPackageCode', packageCode);

    // Authenticate the customer
    authenticateGoogleCustomer(customerRequest);
    window.location.href = 'customers-list.html'; // Redirect after login
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
    $(".g_id_signin").css("display", "block");
    $(".data").css("display", "none");

    alert('User signed out successfully.');
}



async function authenticateGoogleCustomer(customerRequest) {
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
        // Handle successful authentication (e.g., redirect or show a success message)
    } catch (error) {
        console.error('Error authenticating Google customer:', error);
    }
}
