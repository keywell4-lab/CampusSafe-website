
/* =====================================================
   CAMPUS SAFETY & EMERGENCY PORTAL
   VERSION 2
   INCIDENT REPORT JAVASCRIPT
   ===================================================== */

import { supabase } from "./supabase-client.js";


/* =====================================================
   1. WAIT FOR THE PAGE TO LOAD
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const reportForm = document.getElementById("reportForm");
    const formMessage = document.getElementById("formMessage");


    /* =================================================
       2. HANDLE INCIDENT REPORT SUBMISSION
       ================================================= */

    if (!reportForm || !formMessage) {
        console.error("Report form or form message element not found.");
        return;
    }

    reportForm.addEventListener("submit", async function (event) {

        // Prevent the browser from refreshing the page.
        event.preventDefault();


        /* =============================================
           3. GET THE FORM VALUES
           ============================================= */

        const fullName =
            document.getElementById("fullName").value.trim();

        const regNumber =
            document.getElementById("regNumber").value.trim();

        const incidentType =
            document.getElementById("incidentType").value;

        const location =
            document.getElementById("location").value.trim();

        const incidentDate =
            document.getElementById("incidentDate").value;

        const incidentTime =
            document.getElementById("incidentTime").value;

        const description =
            document.getElementById("description").value.trim();

        const anonymous =
            document.getElementById("anonymous").checked;


        /* =============================================
           4. VALIDATE REQUIRED FIELDS
           ============================================= */

        if (
            (!anonymous && (!fullName || !regNumber)) ||
            !incidentType ||
            !location ||
            !incidentDate ||
            !incidentTime ||
            !description
        ) {

            formMessage.textContent =
                "Please complete all required fields.";

            formMessage.className =
                "form-message error-message";

            return;
        }


        const { data: { user }, error: userError } =
    await supabase.auth.getUser();

if (userError) {
    console.error("Could not check current user:", userError);
    throw userError;
}


        /* =============================================
           5. PREPARE THE REPORT FOR SUPABASE
           ============================================= */

        const report = {
            user_id: user ? user.id : null,

            // Do not store personal details for anonymous reports.
            full_name: anonymous ? null : fullName,

            registration_number:
                anonymous ? null : regNumber,

            incident_type: incidentType,

            location: location,

            incident_date: incidentDate,

            incident_time: incidentTime,

            description: description,

            anonymous: anonymous,

            status: "pending",

            submitted_at: new Date().toISOString()

        };


        /* =============================================
           6. SUBMIT THE REPORT TO SUPABASE
           ============================================= */

        const submitButton =
            reportForm.querySelector('[type="submit"]');

        try {

            // Prevent repeated clicks while the report is saving.
            if (submitButton) {
                submitButton.disabled = true;
            }

            formMessage.textContent =
                "Submitting your report...";

            formMessage.className = "form-message";


            const { error } = await supabase
                .from("incident_reports")
                .insert([report]);


            if (error) {
                throw error;
            }


            /* =============================================
               7. DISPLAY SUCCESS MESSAGE
               ============================================= */

            formMessage.textContent =
                "Your incident report has been submitted successfully.";

            formMessage.className =
                "form-message success-message";


            /* =============================================
               8. CLEAR THE FORM
               ============================================= */

            reportForm.reset();


            // Automatically remove the message after four seconds.
            setTimeout(function () {

                formMessage.textContent = "";

                formMessage.className = "form-message";

            }, 4000);


            console.log("Incident report submitted successfully.");


        } catch (error) {

            // Log the detailed error for troubleshooting.
            console.error(
                "Incident report submission failed:",
                error
            );

            formMessage.textContent =
                "We couldn't submit your report. Please try again.";

            formMessage.className =
                "form-message error-message";


        } finally {

            // Allow the user to submit another report.
            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    });


    /* =================================================
       9. CONFIRM THAT THE SCRIPT LOADED
       ================================================= */

    console.log("CampusSafe incident reporting system loaded.");

    
/* =====================================================
   LOAD RECENTLY REPORTED INCIDENTS
   ===================================================== */

async function loadRecentIncidents() {

    console.log("CampusSafe: incident loader started");
    const reportsList = document.getElementById("reportsList");

    if (!reportsList) {
        console.error("Reports list element not found.");
        return;
    }

    reportsList.textContent = "Loading recent incidents...";

 
const { data, error } = await supabase
    .from("public_incident_feed_v2")
    .select("incident_type, location, incident_date,incident_time,description, status, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(10);


    if (error) {
        console.error("Could not load recent incidents:", error);
        reportsList.textContent = "Unable to load recent incidents.";

        console.log("Loading recent incidents function is running.");
        return;
    }

    if (!data || data.length === 0) {
        reportsList.textContent = "No incidents have been reported yet.";
        return;
    }

    reportsList.replaceChildren();

    data.forEach(function (report) {
        const card = document.createElement("article");
        card.className = "card";

        const heading = document.createElement("h3");
        heading.textContent = report.incident_type || "Incident";

        const location = document.createElement("p");
        location.textContent = "Location: " + (report.location || "Not provided");

        const date = document.createElement("p");
        date.textContent = "Date: " + (report.incident_date || "Not provided");

        const status = document.createElement("p");
        status.textContent = "Status: " + (report.status || "pending");

        const description = document.createElement("p");
        description.textContent = report.description || "No description provided.";

        card.append(heading, location, date, status, description);
        reportsList.appendChild(card);
    });
}

console.log("CampusSafe: calling incident loader");
loadRecentIncidents();


});