// ================================
// Highlight to Notes - content.js
// ================================

let selectedText = "";
let saveButton = null;
let toast = null;

// -------------------------
// Initialize
// -------------------------

createSaveButton();
createToast();

document.addEventListener("mouseup", handleSelection);

// -------------------------
// Handle text selection
// -------------------------

function handleSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
        hideButton();
        return;
    }

    const text = selection.toString().trim();

    if (text.length === 0) {
        hideButton();
        return;
    }

    selectedText = text;

    const rect = selection
        .getRangeAt(0)
        .getBoundingClientRect();

    positionButton(rect);

    saveButton.style.display = "block";

    requestAnimationFrame(() => {
        saveButton.style.opacity = "1";
        saveButton.style.transform = "scale(1)";
    });
}

// -------------------------
// Floating Button
// -------------------------

function createSaveButton() {

    saveButton = document.createElement("button");

    saveButton.textContent = "Save Point";

    Object.assign(saveButton.style, {

        position: "absolute",

        zIndex: "999999",

        padding: "10px 16px",

        background: "#ffffff",

        color: "#111827",

        border: "1px solid #d1d5db",

        borderRadius: "999px",

        fontSize: "14px",

        fontWeight: "600",

        fontFamily: "Arial, sans-serif",

        cursor: "pointer",

        boxShadow: "0 6px 18px rgba(0,0,0,.15)",

        transition: "all .2s ease",

        opacity: "0",

        transform: "scale(.9)",

        display: "none"

    });

    saveButton.addEventListener("mouseenter", () => {

        saveButton.style.background = "#2563eb";
        saveButton.style.color = "#fff";

    });

    saveButton.addEventListener("mouseleave", () => {

        saveButton.style.background = "#fff";
        saveButton.style.color = "#111827";

    });

    saveButton.addEventListener("mousedown", (e) => {

        e.preventDefault();

        saveHighlight();

    });

    document.body.appendChild(saveButton);
}

// -------------------------
// Position button
// -------------------------

function positionButton(rect) {

    const buttonWidth = 130;
    const buttonHeight = 42;

    let left = window.scrollX + rect.right + 10;
    let top = window.scrollY + rect.bottom + 10;

    if (left + buttonWidth > window.scrollX + window.innerWidth) {
        left = window.scrollX + rect.left - buttonWidth - 10;
    }

    if (top + buttonHeight > window.scrollY + window.innerHeight) {
        top = window.scrollY + rect.top - buttonHeight - 10;
    }

    saveButton.style.left = left + "px";
    saveButton.style.top = top + "px";
}

// -------------------------
// Hide button
// -------------------------

function hideButton() {

    saveButton.style.opacity = "0";
    saveButton.style.transform = "scale(.9)";

    setTimeout(() => {

        saveButton.style.display = "none";

    }, 200);

}

// -------------------------
// Save Highlight
// -------------------------

function saveHighlight() {

    const pageKey = location.href;

    chrome.storage.local.get([pageKey], (result) => {

        let notes = result[pageKey] || [];

        if (notes.includes(selectedText)) {

            showToast("Already saved");

            hideButton();

            return;
        }

        notes.push(selectedText);

        chrome.storage.local.set({

            [pageKey]: notes

        }, () => {

            showToast("Point saved");

            saveButton.textContent = "Saved";

            setTimeout(() => {

                saveButton.textContent = "Save Point";

                hideButton();

            }, 800);

        });

    });

}

// -------------------------
// Toast
// -------------------------

function createToast() {

    toast = document.createElement("div");

    Object.assign(toast.style, {

        position: "fixed",

        right: "25px",

        bottom: "25px",

        background: "#16a34a",

        color: "#fff",

        padding: "10px 16px",

        borderRadius: "8px",

        fontSize: "14px",

        fontFamily: "Arial",

        boxShadow: "0 5px 16px rgba(0,0,0,.2)",

        opacity: "0",

        transition: "opacity .3s",

        zIndex: "999999"

    });

    document.body.appendChild(toast);

}

function showToast(message) {

    toast.textContent = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 1500);

}