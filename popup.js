// ===============================
// Highlight to Notes
// popup.js
// ===============================

const pageTitle = document.getElementById("pageTitle");
const count = document.getElementById("count");
const notesContainer = document.getElementById("notes");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const clearAfterCopy = document.getElementById("clearAfterCopy");

let currentTab = null;
let currentNotes = [];

// --------------------
// Initialize
// --------------------

init();

async function init() {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    currentTab = tab;

    pageTitle.textContent = tab.title;

    loadNotes();

}

// --------------------
// Load Notes
// --------------------

function loadNotes() {

    chrome.storage.local.get([currentTab.url], (result) => {

        currentNotes = result[currentTab.url] || [];

        renderNotes();

    });

}

// --------------------
// Render Notes
// --------------------

function renderNotes() {

    notesContainer.innerHTML = "";

    count.textContent =
        `${currentNotes.length} Saved Point${currentNotes.length !== 1 ? "s" : ""}`;

    if (currentNotes.length === 0) {

        notesContainer.innerHTML = `
            <div class="empty">
                No saved highlights yet.
            </div>
        `;

        return;
    }

    currentNotes.forEach((note, index) => {

        const card = document.createElement("div");

        card.className = "note";

        card.innerHTML = `

            <div class="note-text">
                ${escapeHTML(note)}
            </div>

            <div class="actions">

                <button
                    class="icon-btn edit-btn"
                    title="Edit">

                    ✏️

                </button>

                <button
                    class="icon-btn delete-btn"
                    title="Delete">

                    🗑

                </button>

            </div>

        `;

        card.querySelector(".edit-btn")
            .addEventListener("click", () => editNote(index));

        card.querySelector(".delete-btn")
            .addEventListener("click", () => deleteNote(index));

        notesContainer.appendChild(card);

    });

}

// --------------------
// Delete
// --------------------

function deleteNote(index) {

    currentNotes.splice(index, 1);

    saveNotes();

}

// --------------------
// Edit
// --------------------

function editNote(index) {

    const updated = prompt(
        "Edit highlight",
        currentNotes[index]
    );

    if (updated === null)
        return;

    const value = updated.trim();

    if (!value)
        return;

    currentNotes[index] = value;

    saveNotes();

}

// --------------------
// Save Notes
// --------------------

function saveNotes() {

    chrome.storage.local.set({

        [currentTab.url]: currentNotes

    }, () => {

        renderNotes();

    });

}

// --------------------
// Copy
// --------------------

copyBtn.addEventListener("click", async () => {

    if (currentNotes.length === 0)
        return;

    const format =
        document.querySelector(
            'input[name="format"]:checked'
        ).value;

    let output = "";

    output += currentTab.title + "\n\n";

    output += currentTab.url + "\n\n";

    currentNotes.forEach((note, index) => {

        if (format === "bullet") {

            output += `• ${note}\n`;

        } else {

            output += `${index + 1}. ${note}\n`;

        }

    });

    await navigator.clipboard.writeText(output);

    copyBtn.textContent = "Copied!";

    if (clearAfterCopy.checked) {

        chrome.storage.local.remove(currentTab.url, () => {

            currentNotes = [];

            renderNotes();

        });

    }

    setTimeout(() => {

        copyBtn.textContent = "Copy Notes";

    }, 1500);

});

// --------------------
// Clear All
// --------------------

clearBtn.addEventListener("click", () => {

    if (!confirm("Delete all highlights?"))
        return;

    chrome.storage.local.remove(currentTab.url, () => {

        currentNotes = [];

        renderNotes();

    });

});

// --------------------
// Escape HTML
// --------------------

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}