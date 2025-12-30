import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const errorEl = document.getElementById("error");
const successEl = document.getElementById("success");
const addedByEl = document.getElementById("addedBy");

let currentUser = null;

// ---------- AUTH ----------
auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  addedByEl.textContent = user.email;
});

// ---------- ADD PRODUCT ----------
window.addProduct = async function () {
  errorEl.classList.add("hidden");
  successEl.classList.add("hidden");

  if (!currentUser) {
    return showError("User not authenticated. Please reload.");
  }

  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const stock = Number(document.getElementById("stock").value);
  const minStock = Number(document.getElementById("minStock").value);

  if (!name || price <= 0 || stock < 0 || minStock < 0) {
    return showError("Please fill all fields correctly");
  }

  try {
    // CREATE PRODUCT
    const productRef = await addDoc(collection(db, "products"), {
      name,
      price,
      stock,
      minStock,
      currency: "GHS",
      createdBy: currentUser.email,
      createdAt: serverTimestamp()
    });

    // LOG STOCK IN
    await addDoc(collection(db, "stock_logs"), {
      productId: productRef.id,
      qty: stock,
      type: "IN",
      note: "Initial stock",
      userEmail: currentUser.email,
      createdAt: serverTimestamp()
    });

    successEl.textContent = "Product added successfully";
    successEl.classList.remove("hidden");

    resetForm();

  } catch (err) {
    showError(err.message || "Failed to add product");
  }
};

// ---------- RESET ----------
function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("minStock").value = "";
}

// ---------- ERROR ----------
function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

