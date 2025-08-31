
// admin-app.js

// Published Google Sheets CSV URL
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv";

// Elements for status + data
const statusEl = document.getElementById("status") || document.getElementById("admin-status");
const containerEl = document.getElementById("csv-container") || (() => {
    const div = document.createElement("div");
    div.id = "csv-container";
    document.body.appendChild(div);
    return div;
})();

function setStatus(msg) {
    if (statusEl) {
        statusEl.textContent = msg;
    } else {
        console.log(msg);
    }
}

// Simple CSV parser
function parseCSV(text) {
    const rows = text.split(/\r?\n/).filter(r => r.trim().length > 0);
    return rows.map(row => {
        // Handles quoted values with commas
        const values = [];
        let current = "";
        let insideQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
                values.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        values.push(current);
        return values;
    });
}

// Render table
function renderTable(data) {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";

    data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const el = rowIndex === 0 ? document.createElement("th") : document.createElement("td");
            el.textContent = cell;
            el.style.border = "1px solid #ddd";
            el.style.padding = "8px";
            tr.appendChild(el);
        });
        table.appendChild(tr);
    });

    containerEl.innerHTML = "";
    containerEl.appendChild(table);
}

// Token check
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (token !== "curbease-ok-2425") {
    document.body.innerHTML = "<h2>Unauthorized</h2>";
    throw new Error("Invalid token");
}

// Fetch + render
async function loadCSV() {
    try {
        setStatus("Loading CSV...");
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("CSV fetch failed: " + response.status);
        const text = await response.text();
        const data = parseCSV(text);
        renderTable(data);
        setStatus("Data loaded.");
    } catch (err) {
        setStatus(err.message);
        console.error(err);
    }
}

loadCSV();
