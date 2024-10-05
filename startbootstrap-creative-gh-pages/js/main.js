// Google Sign-In callback function
function onSignIn(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    $("#name").text(responsePayload.name);
    $("#email").text(responsePayload.email);
    $("#image").attr('src', responsePayload.picture);
    
    // Show user data and hide sign-in button
    $(".data").css("display", "block");
    $(".g_id_signin").css("display", "none");
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
