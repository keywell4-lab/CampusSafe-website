/* =====================================================
CAMPUS SAFETY & EMERGENCY PORTAL
VERSION 2
MAIN JAVASCRIPT FILE
   ===================================================== */

if (localStorage.getItem("theme")=== "dark"){
    document.body.classList.add("dark-mode");
}

document.addEventListener("DOMContentLoaded", function () {

    // Get the dark/light mode button
    const themeBtn = document.getElementById("themeBtn");

    // Stop if the button does not exist on the page
    if (!themeBtn) {
        console.log("Theme button was not found.");
        return;
    }


    // =================================================
    // LOAD SAVED THEME
    // =================================================

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }


    // =================================================
    // UPDATE BUTTON ICON
    // =================================================

    function updateThemeButton() {

        if (document.body.classList.contains("dark-mode")) {
            themeBtn.textContent = "☀️Light Mode";
        } else {
            themeBtn.textContent = "🌙Dark Mode";
        }

    }


    // Set the correct icon when the page opens
    updateThemeButton();


    // =================================================
    // DARK / LIGHT MODE
    // =================================================

    themeBtn.addEventListener("click", function () {

        // Switch the dark-mode class
        document.body.classList.toggle("dark-mode");


        // Check whether dark mode is now active
        const isDarkMode =
            document.body.classList.contains("dark-mode");


        // Save the user's choice
        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

        } else {

            localStorage.setItem("theme", "light");

        }


        // Change the button icon
        updateThemeButton();

    });


    console.log("CampusSafe theme system loaded successfully.");

});