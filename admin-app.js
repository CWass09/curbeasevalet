// Admin App JS
const VALID_TOKEN = "curbease-ok-2425";
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv";

window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const badge = document.getElementById("statusBadge");

  if (!token) {
    badge.innerText = "Missing token";
    badge.style.color = "red";
    return;
  }
  if (token !== VALID_TOKEN) {
    badge.innerText = "Invalid token";
    badge.style.color = "red";
    return;
  }

  badge.innerText = "Authorized";
  badge.style.color = "green";

  fetchCSV();
};

function fetchCSV() {
  const badge = document.getElementById("statusBadge");
  fetch(CSV_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error("Fetch error " + res.status);
      }
      return res.text();
    })
    .then(data => {
      badge.innerText = "CSV Loaded";
      badge.style.color = "green";
      console.log("CSV Data:", data.slice(0,200)); // Log first 200 chars
      document.getElementById("table").innerText = data.split("\n").slice(0,5).join("\n");
    })
    .catch(err => {
      badge.innerText = err.message;
      badge.style.color = "red";
      console.error("CSV fetch failed:", err);
    });
}

function reloadData() {
  fetchCSV();
}

function openCSV() {
  window.open(CSV_URL, "_blank");
}
