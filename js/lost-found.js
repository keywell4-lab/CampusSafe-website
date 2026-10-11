
import { supabase } from "./supabase-client.js";

// Get the elements from lost-found.html.
const lostItemForm = document.getElementById("lostItemForm");
const foundItemForm = document.getElementById("foundItemForm");
const lostFoundList = document.getElementById("lostFoundList");

const lostFormMessage = document.getElementById("lostFormMessage");
const foundFormMessage = document.getElementById("foundFormMessage");

let currentUserId = null;
let isAdmin = false;

// Escape user-provided text before displaying it as HTML.
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

// Show a message and clear it after four seconds.
function showMessage(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;

    // Make the message visible with the correct style.
    element.classList.remove("success-message", "error-message");
    element.classList.add(isError ? "error-message" : "success-message");

    if (element.messageTimer) {
        clearTimeout(element.messageTimer);
    }

   element.messageTimer = setTimeout(() => {
    element.textContent = "";

    // Hide the empty message box.
    element.classList.remove("success-message", "error-message");
}, 4000);
}

// Load the logged-in student's account.

async function loadCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        console.error("Could not get logged-in user:", error);
        currentUserId = null;
        isAdmin = false;
        return false;
    }

    currentUserId = data.user.id;

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUserId)
        .single();

    if (profileError) {
        console.error("Could not load user role:", profileError);
        isAdmin = false;
    } else {
        isAdmin = profile.role === "admin";
    }

    return true;
}


// Load all listings that the logged-in student is allowed to see.
async function loadItems() {
    if (!lostFoundList) return;

    lostFoundList.innerHTML = "<p>Loading listings...</p>";

    const { data, error } = await supabase
        .from("lost_found_items")
        .select(
            "id, user_id, item_type, item_name, category, location, item_date, description, contact, submitted_at"
        )
        .order("submitted_at", { ascending: false });

    if (error) {
        console.error("Could not load listings:", error);

        lostFoundList.innerHTML =
            "<p>Could not load listings. Please refresh the page and try again.</p>";

        return;
    }

    displayItems(data || []);
}

// Display the listings on the page.
function displayItems(items) {
    if (!lostFoundList) return;

    if (items.length === 0) {
        lostFoundList.innerHTML =
            "<p>No lost or found items have been reported yet.</p>";
        return;
    }

    lostFoundList.innerHTML = items.map((item) => {
        const isLost = item.item_type === "lost";
        const itemType = isLost ? "Lost Item" : "Found Item";

        // Only the owner sees the Remove Listing button.
        const deleteButton = isAdmin || item.user_id === currentUserId
            ? `<button type="button" class="delete-item" data-id="${escapeHTML(item.id)}">Remove Listing</button>`
            : "";

        return `
            <div class="item-card">
                <h3>${escapeHTML(item.item_name)}</h3>

                <p><strong>Type:</strong> ${itemType}</p>
                <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
                <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
                <p><strong>Date:</strong> ${escapeHTML(item.item_date)}</p>
                <p><strong>Description:</strong> ${escapeHTML(item.description)}</p>
                <p><strong>Contact:</strong> ${escapeHTML(item.contact)}</p>

                ${deleteButton}
            </div>
        `;
    }).join("");
}

// Submit a lost or found item to Supabase.
async function submitItem(form, type, messageElement) {
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        // Make sure the student is logged in.
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData.user) {
            showMessage(
                messageElement,
                "Your session may have expired. Please log in again.",
                true
            );
            return;
        }

        // Read the form fields.
        const prefix = type === "lost" ? "lost" : "found";

        const itemName = document
            .getElementById(`${prefix}ItemName`).value.trim();

        const category = document
            .getElementById(`${prefix}Category`).value;

        const location = document
            .getElementById(`${prefix}Location`).value.trim();

        const date = document
            .getElementById(`${prefix}Date`).value;

        const description = document
            .getElementById(`${prefix}Description`).value.trim();

        const contact = document
            .getElementById(`${prefix}Contact`).value.trim();

        if (
            !itemName ||
            !category ||
            !location ||
            !date ||
            !description ||
            !contact
        ) {
            showMessage(
                messageElement,
                "Please complete all fields.",
                true
            );
            return;
        }

        // Insert the listing into the Supabase table.
        const { error } = await supabase
            .from("lost_found_items")
            .insert({
                user_id: userData.user.id,
                item_type: type,
                item_name: itemName,
                category: category,
                location: location,
                item_date: date,
                description: description,
                contact: contact
            });

        if (error) {
            console.error("Listing submission failed:", error);

            showMessage(
                messageElement,
                "Could not submit your listing. Please try again.",
                true
            );
            return;
        }

        
showMessage(
    messageElement,
    type === "lost"
        ? "Your lost item has been reported successfully!"
        : "Your found item has been reported successfully!"
);

form.reset();

// Refresh the listings from Supabase.
await loadItems();

// Keep the success message visible while the page scrolls.
messageElement?.scrollIntoView({
    behavior: "smooth",
    block: "center"
});

// Then show the updated listings.
setTimeout(() => {
    if (messageElement) {
        messageElement.textContent = "";
    }   
}, 1500);

    } catch (error) {
        console.error("Unexpected listing error:", error);

        showMessage(
            messageElement,
            "Something went wrong. Please try again.",
            true
        );
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

// Handle the Lost Item form.
if (lostItemForm) {
    lostItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        await submitItem(
            lostItemForm,
            "lost",
            lostFormMessage
        );
    });
}

// Handle the Found Item form.
if (foundItemForm) {
    foundItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        await submitItem(
            foundItemForm,
            "found",
            foundFormMessage
        );
    });
}

// Handle removal of a student's own listing.
if (lostFoundList) {
    lostFoundList.addEventListener("click", async (event) => {
        const button = event.target.closest(".delete-item");

        if (!button) return;

        const itemId = button.dataset.id;

        if (!confirm("Are you sure you want to remove this listing?")) {
            return;
        }

        button.disabled = true;

        const { error } = await supabase
            .from("lost_found_items")
            .delete()
            .eq("id", itemId);

if (error) {
    console.error("Could not load listings:", error);

    lostFoundList.innerHTML =
        `<p>Database error: ${escapeHTML(error.message)}</p>`;

    return;
}


        await loadItems();
    });
}

// Start the page.
async function initializePage() {
    const loggedIn = await loadCurrentUser();

    if (!loggedIn) {
        if (lostFoundList) {
            lostFoundList.innerHTML =
                "<p>Please log in to view listings.</p>";
        }

        return;
    }

    await loadItems();
}

initializePage();
