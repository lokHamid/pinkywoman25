// commande.js
import { submitOrder } from '../../server/api/order.js';

document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');

  // Form fields
  const fullNameInput   = document.getElementById('fullName');
  const wilayaSelect    = document.getElementById('wilaya');
  const phoneInput      = document.getElementById('phoneNumber');
  const addressInput    = document.getElementById('address');
  const notesInput      = document.getElementById('notes');

  // Error elements
  const fullNameError = document.getElementById('fullNameError');
  const wilayaError   = document.getElementById('wilayaError');
  const phoneError    = document.getElementById('phoneError');

  // ── Load order data from sessionStorage ───────────────────────
  let orderData = null;
  try {
    const stored = sessionStorage.getItem('orderData');
    if (stored) {
      orderData = JSON.parse(stored);
      fillOrderSummary(orderData);
    } else {
      showNoOrderData();
    }
  } catch (err) {
    console.error("Error parsing order data:", err);
    showNoOrderData();
  }

  function fillOrderSummary(data) {
    const nameEl     = document.getElementById('productName');
    const metaEl     = document.getElementById('productMeta');
    const skuEl      = document.getElementById('productSku');
    const priceEl    = document.getElementById('productPrice');
    const qtEl       = document.getElementById('productQuantity');
    const totalEl    = document.getElementById('orderTotal');

    nameEl.textContent = data.productName || "Produit";

    let meta = [];
    if (data.color) meta.push(`Couleur: ${data.color}`);
    if (data.size)  meta.push(`Taille: ${data.size}`);
    metaEl.textContent = meta.join(' • ') || "Variante non spécifiée";

    if (data.sku) {
      skuEl.textContent = `Réf: ${data.sku}`;
    }

    const basePrice = Number(data.price) || 0;
    const adjustment = Number(data.price_adjustment) || 0;
    const unitPrice = basePrice + adjustment;
    const qty = Number(data.quantity) || 1;
    const total = unitPrice * qty;

    priceEl.textContent = `${formatPrice(unitPrice)} D.A`;
    qtEl.textContent    = `Quantité: ${qty}`;
    totalEl.textContent = `${formatPrice(total)} D.A`;
  }

  function formatPrice(num) {
    return new Intl.NumberFormat('fr-DZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  function showNoOrderData() {
    document.getElementById('productName').textContent = "Aucune commande en cours";
    document.getElementById('productMeta').textContent = "Retournez à la page produit pour sélectionner un article.";
    document.getElementById('productPrice').textContent = "— D.A";
    document.getElementById('productQuantity').textContent = "Quantité: —";
    document.getElementById('orderTotal').textContent = "— D.A";
    submitBtn.disabled = true;
    submitBtn.textContent = "Impossible de commander";
  }

  // ── Your existing validation functions ───────────────────────
  function validatePhoneNumber(phone) {
    const clean = phone.replace(/\s/g, '');
    return /^(05|06|07)[0-9]{8}$/.test(clean);
  }

  function validateName(name) {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.split(/\s+/).length >= 2;
  }

  function showError(input, errorEl, msg) {
    input.classList.add('error');
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function hideError(input, errorEl) {
    input.classList.remove('error');
    errorEl.classList.remove('show');
  }

  // Real-time validation
  fullNameInput.addEventListener('input', () => {
    if (validateName(fullNameInput.value)) hideError(fullNameInput, fullNameError);
  });

  wilayaSelect.addEventListener('change', () => {
    if (wilayaSelect.value) hideError(wilayaSelect, wilayaError);
  });

  phoneInput.addEventListener('input', () => {
    if (validatePhoneNumber(phoneInput.value)) hideError(phoneInput, phoneError);
  });

  // Phone formatting (Algerian style)
  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    let formatted = '';
    if (val.length > 0) {
      formatted = val.slice(0, 2);
      if (val.length > 2)  formatted += ' ' + val.slice(2, 4);
      if (val.length > 4)  formatted += ' ' + val.slice(4, 6);
      if (val.length > 6)  formatted += ' ' + val.slice(6, 8);
      if (val.length > 8)  formatted += ' ' + val.slice(8, 10);
    }
    e.target.value = formatted;
  });

  // Form submit
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    if (!validateName(fullNameInput.value)) {
      showError(fullNameInput, fullNameError, 'Veuillez entrer votre nom complet (prénom et nom)');
      isValid = false;
    }

    if (!wilayaSelect.value) {
      showError(wilayaSelect, wilayaError, 'Veuillez sélectionner votre wilaya');
      isValid = false;
    }

    const phoneClean = phoneInput.value.replace(/\s/g, '');
    if (!validatePhoneNumber(phoneClean)) {
      showError(phoneInput, phoneError, 'Numéro invalide (05/06/07 + 8 chiffres)');
      isValid = false;
    }

    if (!isValid) return;

    // Prepare full order payload
    const finalOrder = {
        customer_name:  fullNameInput.value.trim(),
        wilaya:         wilayaSelect.value,
        phone_number:   phoneClean,                     // already cleaned (no spaces)
        address:        addressInput.value.trim() || null,  // optional
        notes:          notesInput.value.trim() || null,    // optional

        status:         "PENDING",
        variantId:      Number(orderData.variantId),
        quantity:       Number(orderData.quantity) || 1,
        unit_price:     Number(orderData.price) + Number(orderData.price_adjustment || 0)
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

    try {
      // Call your real API function
      const response = await submitOrder(finalOrder);

      // Success
      successMessage.classList.add('show');
      orderForm.style.display = 'none';
      sessionStorage.removeItem('orderData'); // clean up
      localStorage.removeItem('pinkyWomanOrderForm');

    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Une erreur est survenue. Veuillez réessayer ou nous contacter directement.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmer la Commande';
    }
  });

  // ── Auto-save / load (your existing logic) ───────────────────
  function autoSaveForm() {
    const data = {
      fullName: fullNameInput.value,
      wilaya: wilayaSelect.value,
      phoneNumber: phoneInput.value,
      address: addressInput.value,
      notes: notesInput.value
    };
    localStorage.setItem('pinkyWomanOrderForm', JSON.stringify(data));
  }

  function loadSavedForm() {
    const saved = localStorage.getItem('pinkyWomanOrderForm');
    if (saved) {
      const d = JSON.parse(saved);
      fullNameInput.value   = d.fullName   || '';
      wilayaSelect.value    = d.wilaya     || '';
      phoneInput.value      = d.phoneNumber|| '';
      addressInput.value    = d.address    || '';
      notesInput.value      = d.notes      || '';
    }
  }

  [fullNameInput, wilayaSelect, phoneInput, addressInput, notesInput].forEach(el => {
    el.addEventListener('input', autoSaveForm);
    el.addEventListener('change', autoSaveForm);
  });

  loadSavedForm();

  // Clear auto-save after success
  window.addEventListener('beforeunload', () => {
    if (successMessage.classList.contains('show')) {
      localStorage.removeItem('pinkyWomanOrderForm');
    }
  });
});

// Populate wilaya options dynamically
// =========================================================================
// List of all 58 Algerian wilayas (official as of 2025)
// =========================================================================
const algerianWilayas = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",          // 49 (created 2019)
  "Bordj Badji Mokhtar", // 50
  "Ouled Djellal",      // 51
  "Béni Abbès",         // 52
  "In Salah",           // 53
  "In Guezzam",         // 54
  "Touggourt",          // 55
  "Djanet",             // 56
  "El M'Ghair",         // 57
  "El Meniaa"           // 58 (sometimes written El Menia)
];

// =========================================================================
// Populate the wilaya <select> dynamically when page loads
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const wilayaSelect = document.getElementById('wilaya');
  
  if (!wilayaSelect) {
    console.warn("Wilaya select element not found");
    return;
  }

  // Sort alphabetically (optional but recommended for UX)
  algerianWilayas.sort((a, b) => a.localeCompare(b, 'fr'));

  // Add all options
  algerianWilayas.forEach(wilaya => {
    const option = document.createElement('option');
    option.value = wilaya;
    option.textContent = wilaya;
    wilayaSelect.appendChild(option);
  });

  // Optional: If you previously saved a value in localStorage, re-select it
  // (your existing loadSavedForm() should already handle this)
});