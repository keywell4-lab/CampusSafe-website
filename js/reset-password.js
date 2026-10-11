
// ==========================================
// CAMPUSSAFE - PASSWORD RESET
// Allows students to create a new password.
// ==========================================

// Import the existing Supabase connection.
import { supabase } from "./supabase-client.js";

// Find the password reset form and message area.
const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const resetMessage =
    document.getElementById("resetMessage");


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function displayResetMessage(message, isError = false) {

    resetMessage.textContent = message;

    resetMessage.style.color = isError
        ? "#dc2626"
        : "#15803d";
}


// ==========================================
// CHECK THE PASSWORD RESET SESSION
// ==========================================

async function checkResetSession() {

    try {

        // Read the current authentication session.
        const { data, error } =
            await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        // A valid recovery link should establish a session.
        if (!data.session) {

            resetPasswordForm.hidden = true;

            displayResetMessage(
                "This password reset link is invalid or has expired. Return to the login page and request another reset link.",
                true
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error("Reset session error:", error);

        resetPasswordForm.hidden = true;

        displayResetMessage(
            "We could not verify your reset link. Please request a new one.",
            true
        );

        return false;
    }
}


// ==========================================
// UPDATE THE PASSWORD
// ==========================================

resetPasswordForm.addEventListener(
    "submit",
    async function (event) {

        // Stop the browser from refreshing the page.
        event.preventDefault();

        // Read both password fields.
        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // Check that the passwords match.
        if (newPassword !== confirmPassword) {

            displayResetMessage(
                "The passwords do not match. Please try again.",
                true
            );

            return;
        }

        // Require at least eight characters.
        if (newPassword.length < 8) {

            displayResetMessage(
                "Your password must contain at least 8 characters.",
                true
            );

            return;
        }

        // Disable the button while updating.
        const submitButton =
            resetPasswordForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.disabled = true;

        displayResetMessage("Updating your password...");

        try {

            // Verify that the reset session is still available.
            const sessionIsValid = await checkResetSession();

            if (!sessionIsValid) {
                return;
            }

            // Save the new password through Supabase.
            const { error } =
                await supabase.auth.updateUser({
                    password: newPassword
                });

            if (error) {
                throw error;
            }

            // Clear the password fields after success.
            resetPasswordForm.reset();

            resetPasswordForm.hidden = true;

            displayResetMessage(
                "Your password has been updated successfully. You can now log in with your new password."
            );

            // Return the student to the login page.
            setTimeout(function () {
                window.location.href = "login.html";
            }, 2500);

        } catch (error) {

            console.error("Password update error:", error);

            displayResetMessage(
                error.message ||
                "We could not update your password. Please try again.",
                true
            );

        } finally {

            submitButton.disabled = false;
        }

    }
);


// ==========================================
// INITIALIZE THE RESET PAGE
// ==========================================

checkResetSession();

console.log("CampusSafe password reset system loaded.");
