/* ==========================================
   CAMPUSSAFE - SESSION MANAGEMENT
   Protects pages and handles logout
   ========================================== */

import { supabase } from "./supabase-client.js";

// Identify the current HTML page.
const currentPage = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

// Find the logout button, if present.
const logoutBtn = document.getElementById("logoutBtn");

// Protect every page except the login page.
async function protectPage() {
    if (currentPage === "login.html") {
        return;
    }

    try {
        const { data, error } =
            await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        // Redirect logged-out visitors to login.
        if (!data.session) {
            window.location.replace("login.html");
        }

    } catch (error) {
        console.error("Session check failed:", error);

        window.location.replace("login.html");
    }
}

// Start the protection check.
protectPage();

// Handle logout once.
if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Logging out...";

        try {
            const { error } =
                await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace("login.html");

        } catch (error) {
            console.error("Logout failed:", error);

            alert("Logout failed. Please try again.");

            logoutBtn.disabled = false;
            logoutBtn.textContent = "Logout";
        }
    });
}

console.log("CampusSafe session management loaded.");