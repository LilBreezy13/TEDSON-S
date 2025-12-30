import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "./firebase.js";

// ELEMENTS
const productsList = document.getElementById("productsList");
const salesList = document.getElementById("salesList");
const restockSelect = document.getElementById("restockProduct");

let products = {};

// LOAD PRODUCTS
const productSnap = await getDocs(collection(db, "products"));
let lowStockCount = 0;

productSnap.forEach(docSnap => {
  const p = docSnap.data();
  products[docSnap.id] = p;

  if (p.stock <= p.minStock) lowStockCount++;

productsList.innerHTML += `
  <div class="p-4 flex justify-between items-center">
    <div>
      <p class="font-semibold">${p.name}</p>
      <p class="text-xs text-gray-500">
        ₵${p.price} • Stock: ${p.stock}
      </p>
    </div>

    <span class="text-xs px-2 py-1 rounded-full
      ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
      ${p.stock <= p.minStock ? 'Low' : 'OK'}
    </span>
  </div>
`;


  restockSelect.innerHTML += `
    <option value="${docSnap.id}">${p.name}</option>
  `;
});

document.getElementById("productCount").textContent = productSnap.size;
document.getElementById("lowStock").textContent = lowStockCount;

// LOAD SALES
const salesSnap = await getDocs(collection(db, "sales"));
let revenue = 0;
let todayRevenue = 0;
const today = new Date().toDateString();

salesSnap.forEach(docSnap => {
  const s = docSnap.data();
  revenue += s.total;

  if (s.createdAt?.toDate().toDateString() === today) {
    todayRevenue += s.total;
  }

  salesList.innerHTML += `
    <div class="p-3 text-sm">
      <p class="font-medium">
        ₵${s.total} — ${products[s.productId]?.name || ""}
      </p>
      <p class="text-xs text-gray-500">
        ${s.userEmail}
      </p>
    </div>
  `;
});

document.getElementById("revenue").textContent = `₵${revenue}`;
document.getElementById("todaySales").textContent = `₵${todayRevenue}`;

// RESTOCK
window.restock = async function () {
  const id = restockSelect.value;
  const qty = Number(document.getElementById("restockQty").value);

  if (qty <= 0) return alert("Enter quantity");

  const ref = doc(db, "products", id);

  await updateDoc(ref, {
    stock: products[id].stock + qty
  });

  await addDoc(collection(db, "stock_logs"), {
    productId: id,
    qty,
    type: "IN",
    userEmail: auth.currentUser.email,
    createdAt: serverTimestamp()
  });

showAlert("Stock updated successfully");

  location.reload();
};


// ---------------- PLATFORM MODAL ----------------
window.showAlert = function (message) {
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isiOS) {
    document.getElementById("iosModalText").textContent = message;
    document.getElementById("iosModal").classList.remove("hidden");
    document.getElementById("iosModal").classList.add("flex");
  }
  else if (isAndroid) {
    document.getElementById("androidModalText").textContent = message;
    document.getElementById("androidModal").classList.remove("hidden");
    document.getElementById("androidModal").classList.add("flex");
  }
  else {
    // Desktop fallback
    alert(message);
  }
};

window.closeModal = function () {
  document.getElementById("iosModal")?.classList.add("hidden");
  document.getElementById("androidModal")?.classList.add("hidden");
};


let productsCache = [];
let inventoryGrandTotal = 0;

// ---------------- LOAD PRODUCTS ----------------
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));

  productsCache = [];
  inventoryGrandTotal = 0;

  let lowStock = 0;

  snap.forEach(d => {
    const p = d.data();
    const totalValue = p.costPrice * p.stock;

    inventoryGrandTotal += totalValue;
    productsCache.push({
      name: p.name,
      totalValue
    });

    if (p.stock <= p.minStock) lowStock++;
  });

  document.getElementById("inventoryValue").textContent =
    `₵${inventoryGrandTotal.toLocaleString()}`;

  document.getElementById("productCount").textContent =
    productsCache.length;

  document.getElementById("lowStock").textContent =
    lowStock;
}

lucide.createIcons();


