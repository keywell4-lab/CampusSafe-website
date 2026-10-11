/* ==========================================
   CAMPUSSAFE - STUDENT AUTHENTICATION
   Handles registration and login
   ========================================== */

// Import our Supabase connection.
import { supabase } from "./supabase-client.js";


// Find the login and registration forms.
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");


// Find the sections containing each form.
const loginSection = document.getElementById("loginSection");
const signupSection = document.getElementById("signupSection");


// Find the buttons used to switch forms.
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");


// Find the message area.
const authMessage = document.getElementById("authMessage");


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function displayMessage(message, isError = false) {
    authMessage.textContent = message;

    authMessage.style.color = isError
        ? "#dc2626"
        : "#15803d";
}


// ==========================================
// SWITCH BETWEEN LOGIN AND REGISTRATION
// ==========================================

showSignup.addEventListener("click", function () {
    loginSection.hidden = true;
    signupSection.hidden = false;

    authMessage.textContent = "";
});



const navSignup = document.getElementById("navSignup");

if (navSignup) {
    navSignup.addEventListener("click", function (event) {
        event.preventDefault();

        loginSection.hidden = true;
        signupSection.hidden = false;

        authMessage.textContent = "";
    });
}



showLogin.addEventListener("click", function () {
    signupSection.hidden = true;
    loginSection.hidden = false;

    authMessage.textContent = "";
});


// ==========================================
// STUDENT REGISTRATION
// ==========================================

signupForm.addEventListener("submit", async function (event) {

    // Prevent the page from refreshing.
    event.preventDefault();

    // Read the student's information.
    const fullName =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    // Check that the student's name is not empty.
    if (!fullName) {
        displayMessage(
            "Please enter your full name.",
            true
        );

        return;
    }

    // Prevent repeated submissions while processing.
    const submitButton =
        signupForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    displayMessage("Creating your account...");

    try {

        // Ask Supabase to create the account.
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,

            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: "https://keywell4-lab.github.io/CampusSafe-website/html/login.html"
            }
        });

        // Display any error returned by Supabase.
        if (error) {
            throw error;
        }

        // Supabase may require email confirmation.
        if (data.user && !data.session) {

            displayMessage(
                "Account created! Check your email for a confirmation link before logging in."
            );

        } else {

            displayMessage(
                "Account created successfully! You can now use CampusSafe."
            );

            signupForm.reset();

            // Switch to the login form.
            signupSection.hidden = true;
            loginSection.hidden = false;
        }

    } catch (error) {

        console.error("Registration error:", error);

        displayMessage(
            error.message || "Registration failed. Please try again.",
            true
        );

    } finally {

        // Allow the button to be used again.
        submitButton.disabled = false;
    }

});


// ==========================================
// STUDENT LOGIN
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    // Prevent the page from refreshing.
    event.preventDefault();

    // Read the login details.
    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    // Disable the button during login.
    const submitButton =
        loginForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    displayMessage("Logging in...");

    try {

        // Authenticate the student with Supabase.
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

        // Stop if authentication fails.
        if (error) {
            throw error;
        }

        // Confirm that Supabase returned a session.
        if (!data.session) {
            throw new Error(
                "Login did not complete. Please try again."
            );
        }

        displayMessage(
            "Login successful! Opening CampusSafe..."
        );

        // Open the home page after a short delay.
        setTimeout(function () {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {

        console.error("Login error:", error);

        displayMessage(
            error.message || "Login failed. Check your details.",
            true
        );

    } finally {

        submitButton.disabled = false;
    }

});


// ==========================================
// AUTHENTICATION INITIALIZATION
// ==========================================

console.log("CampusSafe authentication system loaded.");



// ==========================================
// FORGOT PASSWORD
// ==========================================

// Find the Forgot Password button.
const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

// Run this only if the button exists on the page.
if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener("click", async function () {

        // Read the email from the login form.
        const email =
            document.getElementById("loginEmail").value.trim();

        // The student must enter their email first.
        if (!email) {
            displayMessage(
                "Enter your email address above, then click Forgot Password.",
                true
            );

            document.getElementById("loginEmail").focus();

            return;
        }

        // Prevent repeated clicks while sending the email.
        forgotPasswordBtn.disabled = true;

        displayMessage("Sending password reset instructions...");

        try {

            // Ask Supabase to send the password reset email.
            const { error } =
                await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo:
                        "https://keywell4-lab.github.io/CampusSafe-website/html/reset-password.html"
                });

            // Display any error returned by Supabase.
            if (error) {
                throw error;
            }

            // Show a general message for privacy.
            displayMessage(
                "If an account exists for that email, password reset instructions will be sent. Check your inbox and spam folder."
            );

        } catch (error) {

            console.error("Password reset request error:", error);

            displayMessage(
                error.message ||
                "Could not send the reset email. Please try again.",
                true
            );

        } finally {

            // Allow another attempt.
            forgotPasswordBtn.disabled = false;
        }

    });

}
