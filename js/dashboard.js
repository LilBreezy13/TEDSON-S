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

const price = Number(p.price || 0);
const stock = Number(p.stock || 0);
const totalValue = price * stock;

productsList.innerHTML += `
  <div class="p-4 flex justify-between items-center gap-3">

    <!-- LEFT -->
    <div class="flex-1 min-w-0">
      <p class="font-semibold">${p.name}</p>
      <p class="text-xs text-gray-500">
        ₵${price} × ${stock} in stock
      </p>
    </div>

    <!-- RIGHT -->
    <div class="text-right">
      <p class="text-sm font-bold text-green-600">
        ₵${totalValue.toLocaleString()}
      </p>
      <p class="text-[10px] text-gray-400">Total Value</p>

      <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full
        ${stock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
        ${stock <= p.minStock ? 'Low' : 'OK'}
      </span>
    </div>

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

  const productsList = document.getElementById("productsList");
  productsList.innerHTML = "";

  let inventoryGrandTotal = 0;
  let lowStock = 0;

  snap.forEach(docSnap => {
    const p = docSnap.data();

    const price = Number(p.price || 0);
    const stock = Number(p.stock || 0);
    const totalValue = price * stock;

    inventoryGrandTotal += totalValue;

    if (stock <= p.minStock) lowStock++;

    productsList.innerHTML += `
      <div class="p-4 flex justify-between items-center gap-3">

        <!-- LEFT -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm truncate">${p.name}</p>

          <p class="text-xs text-gray-500 mt-1">
            ₵${price.toLocaleString()} × ${stock} units
          </p>
        </div>

        <!-- RIGHT (THIS IS WHAT YOU WANT) -->
        <div class="text-right">
          <p class="text-sm font-bold text-green-600">
            ₵${totalValue.toLocaleString()}
          </p>
          <p class="text-[10px] text-gray-400">
            Total Value
          </p>
        </div>

      </div>
    `;
  });

  // Optional KPIs
  document.getElementById("lowStock").textContent = lowStock;

  // If you have a grand total element
  const inv = document.getElementById("inventoryValue");
  if (inv) {
    inv.textContent = `₵${inventoryGrandTotal.toLocaleString()}`;
  }
}

lucide.createIcons();


