import { createCategory,fetchAllCategories } from '../../server/api/category.js';
import { createVariant, updateVariantStock, } from '../../server/api/variant.js';
import { createColor,getAllColors } from '../../server/api/color.js';
import { getAllSizes,temp_auth_check } from '../../server/api/size.js';
import { createProduct,fetchAllProducts,updateProduct,deleteProduct } from '../../server/api/product.js';
import { fetchOrders,deleteOrder,updateOrder } from '../../server/api/order.js';
const loginUrl = '/src/shared/login.html';
let currentEditingOrder = null;

let products = [];
let categories = [];
let colors = [];
let sizes = [];
let orders = [];
async function loadProducts() {
    products = await fetchAllProducts();
}

async function loadCategories() {
    categories = await fetchAllCategories();
}

async function loadColors() {
    colors = await getAllColors();
}

async function loadSizes() {
    sizes = await getAllSizes();
}

async function loadOrders() {
    orders = await fetchOrders();
}

let editingProductId = null;

        // Fetch initial data
        async function loadInitialData() {
            try {
                await Promise.all([
                    loadProducts(),
                    loadCategories(),
                    loadColors(),
                    loadSizes(),
                    loadOrders()
                ]);
            } catch (error) {
                alert('Error loading initial data:', error);
            }
        }

        document.addEventListener('DOMContentLoaded',async function() {
            try {
                await loadInitialData();
            } catch (error) {
                alert('Erreur lors du chargement des données');
                console.error(error);
                return;
            }
            renderProductsTable();
            renderOrdersTable();
            updateStats();
            setupEventListeners();
            populateAllSelectOptions();
        });

        function renderProductsTable() {
            const tbody = document.getElementById('productsTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!Array.isArray(products) || products.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="10" style="text-align:center; padding:20px; color:#999;">Aucun produit trouvé</td>`;
                tbody.appendChild(row);
                return;
            }

            products.forEach(product => {
                // Safely calculate total stock
                const variants = Array.isArray(product.variants) ? product.variants : [];
                const totalStock = variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0);

                // Safely get category display name
                let categoryDisplay = 'Sans catégorie';
                if (product.category && product.category.name) {
                    categoryDisplay = formatCategoryForDisplay(product.category.name);
                }

                // Safely handle colors (using hex_code from Color entity)
                const colors = variants
                    .map(variant => variant.color)
                    .filter(color => color && color.name && color.hex_code);
                const colorDots = colors.length > 0
                    ? colors.map(color => {
                        const hex = color.hex_code || '#CCCCCC';
                        const name = color.name || 'Inconnue';
                        return `<span class="color-dot" style="background:${hex}" title="${name}"></span>`;
                    }).join('')
                    : '<span style="color:#999; font-size:12px;">Aucune</span>';

                // Safely handle sizes
                const sizes = variants
                    .map(variant => variant.size)
                    .filter(size => size && size.name)
                    .map(size => size.name);
                const sizesText = sizes.length > 0 ? sizes.join(', ') : 'Aucune';

                // Format date safely
                const date = product.created_at ? new Date(product.created_at) : new Date();
                const formattedDate = isNaN(date.getTime()) ? 'Inconnue' : date.toLocaleDateString('fr-FR');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="id-cell">${product.id || 'N/A'}</td>
                    <td class="image-cell">
                        ${product.photos && product.photos.length > 0 
                            ? `<img src="${product.photos[0]}" alt="${product.name}" style="max-width:50px; height:auto; border-radius:4px;">`
                            : '<span style="color:#999;">Aucune</span>'}
                    </td>
                    <td class="name-cell">
                        <strong>${product.name || 'Sans nom'}</strong>
                        <small>${product.description || 'Aucune description'}</small>
                    </td>
                    <td class="category-cell">
                        <span class="category-badge">${categoryDisplay}</span>
                    </td>
                    <td class="price-cell">${(product.price || 0)} D.A</td>
                    <td class="stock-cell ${totalStock === 0 ? 'out-of-stock' : ''}">
                        ${totalStock}
                    </td>
                    <td class="colors-cell">
                        ${colorDots}
                    </td>
                    <td class="sizes-cell">
                        ${sizesText}
                    </td>
                    <td class="date-cell">${formattedDate}</td>
                    <td class="actions-cell">
                        <button class="btn-action edit-btn" data-id="${product.id}" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action delete-btn" data-id="${product.id}" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action view-btn" data-id="${product.id}" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action variants-btn" data-id="${product.id}" title="Voir variantes">
                            <i class="fas fa-layer-group"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function renderOrdersTable() {
            const tbody = document.getElementById('ordersTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!Array.isArray(orders) || orders.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="8" style="text-align:center; padding:40px; color:#999;">Aucune commande trouvée</td>`;
                tbody.appendChild(row);
                return;
            }

            orders.forEach(order => {
                const date = new Date(order.created_at);
                const formattedDate = date.toLocaleDateString('fr-FR');

                const row = document.createElement('tr');
                row.style.cursor = 'pointer'; // Visual feedback
                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.customerName || 'Anonyme'}</td>
                    <td>${order.phone || '-'}</td>
                    <td>${order.wilaya || '-'}</td>
                    <td>${(order.total_amount || order.total || 0)} D.A</td>
                    <td>
                        <span class="order-status ${order.status?.toLowerCase()}">
                            ${formatStatus(order.status)}
                        </span>
                    </td>
                    <td>${formattedDate}</td>
                    <td class="actions-cell">
                        <button class="btn-action delete-btn" data-id="${order.id}" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action edit-order-btn" data-order-id="${order.id}" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
        }

        function openOrderDetailsModal(order) {
            currentEditingOrder = order;

            document.getElementById('modalOrderId').textContent = order.id || order.id_commande;
            document.querySelector('.btn-save-order').addEventListener('click', saveOrderChanges);
            document.querySelector('.btn-cancel-order').addEventListener('click', closeOrderDetailsModal);
            // Editable fields
            document.getElementById('editCustomerName').value = order.customerName || order.customer_name || '';
            document.getElementById('editPhone').value = order.phone || '';
            document.getElementById('editWilaya').value = order.wilaya || '';
            document.getElementById('editAddress').value = order.address || '';
            document.getElementById('editQuantity').value = order.quantity || 1;
            document.getElementById('editUnitPrice').value = (order.unit_price || 0);

            document.getElementById('editStatus').value = order.status || 'pending';

            // Notes
            const notes = order.notes || '';
            document.getElementById('editNotes').value = notes.trim() !== '' ? notes.trim() : '';

            // Date (read-only)
            const date = new Date(order.created_at);
            document.getElementById('modalDate').textContent = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Populate variant dropdown
            const variantSelect = document.getElementById('editVariant');
            variantSelect.innerHTML = '<option value="">-- Choisir une variante --</option>';

            // Flatten all variants from all products
            products.forEach(product => {
                if (Array.isArray(product.variants)) {
                    product.variants.forEach(variant => {
                        const colorName = variant.color?.name || '';
                        const sizeName = variant.size?.name || '';
                        const displayText = `${product.name}${colorName ? ' - ' + colorName : ''}${sizeName ? ' (' + sizeName + ')' : ''}`;
                        
                        const option = document.createElement('option');
                        option.value = JSON.stringify({
                            variantId: variant.id,
                            productName: product.name,
                            colorName,
                            sizeName,
                            unitPrice: variant.price || product.price // fallback to product price
                        });
                        option.textContent = displayText;
                        
                        // Pre-select current variant if matches
                        if (order.product && variant.id === order.product.id) {
                            option.selected = true;
                        }
                        
                        variantSelect.appendChild(option);
                    });
                }
            });

            // If no variant selected but we have data, fallback to current display
            if (!variantSelect.selectedIndex && order.product) {
                const fallbackOption = document.createElement('option');
                const color = order.product.color?.name || '';
                const size = order.product.size?.name || '';
                const productName = order.product.product?.name || 'Produit inconnu';
                fallbackOption.textContent = `${productName}${color ? ' - ' + color : ''}${size ? ' (' + size + ')' : ''}`;
                fallbackOption.value = JSON.stringify({
                    variantId: null,
                    productName,
                    colorName: color,
                    sizeName: size,
                    unitPrice: order.unit_price || 0
                });
                fallbackOption.selected = true;
                variantSelect.appendChild(fallbackOption);
            }

            // Auto-calculate total on quantity/price/variant change
            const updateTotal = () => {
                const qty = parseInt(document.getElementById('editQuantity').value) || 1;
                const price = parseFloat(document.getElementById('editUnitPrice').value) || 0;
                const total = (qty * price);
                document.getElementById('modalTotalDisplay').textContent = total;
            };

            // Attach listeners
            document.getElementById('editQuantity').addEventListener('input', updateTotal);
            document.getElementById('editUnitPrice').addEventListener('input', updateTotal);
            document.getElementById('editVariant').addEventListener('change', (e) => {
                if (e.target.selectedOptions[0]) {
                    const data = JSON.parse(e.target.selectedOptions[0].value || '{}');
                    if (data.unitPrice !== undefined) {
                        document.getElementById('editUnitPrice').value = parseFloat(data.unitPrice);
                        updateTotal();
                    }
                }
            });

            // Initial total
            updateTotal();

            // Show modal
            document.getElementById('orderDetailsModal').style.display = 'flex';
        }

        function openVariantsModal(product) {
            const modal = document.getElementById('variantsModal');
            if (!modal) return;

            // Fill header
            document.getElementById('modalProductName').textContent = product.name || 'Produit sans nom';

            const tbody = document.getElementById('variantsTableBody');
            tbody.innerHTML = '';

            const variants = Array.isArray(product.variants) ? product.variants : [];

            if (variants.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#9ca3af;">
                    Aucune variante définie pour ce produit
                </td></tr>`;
            } else {
                variants.forEach(variant => {
                    const colorName = variant.color?.name || '—';
                    const colorHex  = variant.color?.hex_code || '#cccccc';
                    const sizeName  = variant.size?.name  || '—';
                    const priceAdj  = variant.price_adjustment || 0;
                    const stock     = variant.stock_quantity || 0;
                    const sku       = variant.sku || '';           // ← crucial line

                    const finalPrice = (product.price || 0) + priceAdj;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="color-preview">
                                <span class="color-swatch" style="background:${colorHex}"></span>
                                ${colorName}
                            </div>
                        </td>
                        <td>${sizeName}</td>
                        <td class="price-display">${finalPrice} D.A</td>
                        <td>
                            <input type="number" class="stock-input"
                                value="${stock}" min="0"
                                data-sku="${sku}"
                                data-variant-id="${variant.id || ''}">
                        </td>
                        <td class="action-cell">
                            <button class="btn-save-variant" 
                                    data-sku="${sku}" 
                                    data-variant-id="${variant.id || ''}" 
                                    disabled>Enregistrer</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }

            // Update total stock
            const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
            document.getElementById('modalTotalStock').textContent = totalStock;

            modal.style.display = 'flex'; // or 'block' — depends on your modal CSS
        }
        // New: Save changes (placeholder for API call)
        
        async function saveOrderChanges() {
            if (!currentEditingOrder) return;
            const id = currentEditingOrder.id || currentEditingOrder.id_commande;

            const updatedOrder = {
                customer_name: document.getElementById('editCustomerName').value.trim(),
                phone_number: document.getElementById('editPhone').value.trim(),
                wilaya: document.getElementById('editWilaya').value.trim(),
                address: document.getElementById('editAddress').value.trim(),
                created_at: currentEditingOrder.created_at, // keep original date
                updated_at: new Date().toISOString(), // set updated date
                variantId: null, // to be set below
                quantity: parseInt(document.getElementById('editQuantity').value) || 1,
                unit_price: parseFloat(document.getElementById('editUnitPrice').value) || 0,
                status: document.getElementById('editStatus').value,
                notes: document.getElementById('editNotes').value.trim(),
            };

            // Variant handling
            const variantSelect = document.getElementById('editVariant');
            if (variantSelect.selectedOptions[0]) {
                try {
                    const variantData = JSON.parse(variantSelect.selectedOptions[0].value || '{}');
                    updatedOrder.variantId = variantData.variantId || null;
                } catch (e) {
                    // ignore
                }
            }

            try{
                await updateOrder(id,updatedOrder);
                alert('Modifications enregistrées!');
            }catch(e){
                console.error('Error updating order:', e);
                alert(e.message);
            }

            await loadOrders();
            renderOrdersTable();
            
            closeOrderDetailsModal();
        }


        function closeOrderDetailsModal() {
            document.getElementById('orderDetailsModal').style.display = 'none';
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('orderDetailsModal');
            if (e.target === modal) {
                closeOrderDetailsModal();
            }
        });

        function updateStats() {
            document.getElementById('totalProducts').textContent = products.length;
            const pendingOrders = orders.filter(order => order.status === 'pending').length;
            document.getElementById('pendingOrders').textContent = pendingOrders;
        }
        function formatStatus(status) {
            const statusMap = {
                'pending': 'En attente',
                'confirmed': 'Confirmée',
                'shipped': 'Expédiée',
                'delivered': 'Livrée',
                'cancelled': 'Annulée'
            };
            return statusMap[status] || status;
        }

        // function getColorHex(colorName) {
        //     if (!colorName) return '#CCCCCC';
        //     const color = colors.find(c => c.name === colorName);
        //     return color?.hex_code || '#CCCCCC';
        // }

        function setupEventListeners() {
            document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
            document.getElementById('addCategoryBtn').addEventListener('click', openCategoryModal);
            document.getElementById('addColorBtn').addEventListener('click', openColorModal);
            document.getElementById('addVariantBtn').addEventListener('click', openVariantModal);
            document.getElementById('productSearch').addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#productsTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
            // Modal close
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', function() {
                    Array.from(document.getElementsByClassName('modal')).forEach(modal => {
                        modal.style.display = 'none';
                    });
                });
            });

            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                const modal = document.getElementsByClassName('modal');
                Array.from(modal).forEach(m => {
                    if (e.target === m) {
                        m.style.display = 'none';
                    }
                });
            });

            document.getElementById('productForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                // Basic validation
                const name = document.getElementById('productName').value.trim();
                const description = document.getElementById('productDescription').value.trim();
                const price = parseFloat(document.getElementById('productPrice').value);
                const selectedCategoryName = document.getElementById('productCategory').value;

                if (!name || isNaN(price) || !selectedCategoryName) {
                    alert('Veuillez remplir tous les champs obligatoires.');
                    return;
                }

                const category = getCategoryByName(selectedCategoryName);
                if (!category) {
                    alert('Catégorie invalide.');
                    return;
                }

                const formData = new FormData();

                const productData = {
                    name,
                    description,
                    price,
                    categoryId: category.id
                };

                formData.append('data', new Blob([JSON.stringify(productData)], {
                    type: 'application/json'
                }));

                const fileInput = document.getElementById('productImages');
                if (fileInput?.files) {
                    Array.from(fileInput.files).forEach(file => {
                        formData.append('photos', file);
                    });
                }

                const submitBtn = this.querySelector('.btn-save');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = editingProductId ? 'Mise à jour...' : 'Enregistrement...';

                try {
                    let result;

                    if (editingProductId) {
                        result = await updateProduct(formData, editingProductId);
                    } else {
                        result = await createProduct(formData);
                    }

                    alert(
                        editingProductId
                            ? 'Produit mis à jour avec succès !'
                            : 'Produit enregistré avec succès !'
                    );

                    document.getElementById('productModal').style.display = 'none';
                    this.reset();

                    if (fileInput) fileInput.value = '';
                    document.getElementById('imagePreview').innerHTML = '';

                    await loadInitialData();
                    renderProductsTable();
                    updateStats();
                    populateAllSelectOptions();

                } catch (error) {
                    console.error('Error saving product:', error);
                    alert('Erreur lors de la sauvegarde : ' + userMessage);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
            // Category form submission
            document.getElementById('categoryForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                const nameInput = document.getElementById('categoryName');
                const rawName = nameInput.value.trim();

                if (!rawName) {
                    alert('Le nom de la catégorie est obligatoire.');
                    return;
                }

                const formattedName = formatCategory(rawName);

                // Prepare FormData
                const formData = new FormData();

                // JSON part named "data"
                const categoryData = { name: formattedName };
                formData.append('data', new Blob([JSON.stringify(categoryData)], {
                    type: 'application/json'
                }));

                // Single photo (named "photo" – matches your backend)
                const photoInput = document.getElementById('categoryPhoto');
                if (photoInput?.files?.[0]) {
                    formData.append('photo', photoInput.files[0]);
                }

                // Optional: disable button during request
                const submitBtn = this.querySelector('.btn-save');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enregistrement...';

                try {
                    // Assuming you have a createCategory function that accepts FormData
                    // If not → replace with direct fetch
                    await createCategory(formData);   // ← update this function if needed (see below)

                    alert('Catégorie enregistrée avec succès !');

                    // Reset & close
                    this.reset();
                    photoInput.value = '';
                    document.getElementById('categoryPreview').innerHTML = '';
                    document.getElementById('categoryModal').style.display = 'none';

                    // Refresh
                    await loadInitialData();
                    renderProductsTable();
                    updateStats();
                    populateAllSelectOptions();

                } catch (error) {
                    console.error('Erreur création catégorie:', error);
                    alert('Erreur lors de la création de la catégorie : ' + (error.message || 'Erreur inconnue'));
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
            // Color Form submission
            document.getElementById('colorForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                try{
                    await createColor({
                        name:document.getElementById('colorName').value,
                        hex_code:document.getElementById('colorHex').value
                    });
                    alert('Couleur enregistrée!');
                }catch(error){
                    alert('Error creating color:', error);
                }
                document.getElementById('colorModal').style.display = 'none';
                await loadInitialData();
                renderProductsTable();
                updateStats();
                populateAllSelectOptions();
            });

            // Variant Form submission
            document.getElementById('variantForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const stockQuantityInput = document.getElementById('variantStock').value.trim();
                const stockQuantity = stockQuantityInput === '' ? 0 : parseInt(stockQuantityInput, 10);
                try{
                    const associatedProductNameElement = document.getElementById('associatedProduct');
                    const associatedSizeElement = document.getElementById('variantSize');
                    const associatedColorElement = document.getElementById('variantColor');

                    const associatedProductName = associatedProductNameElement.options[associatedProductNameElement.selectedIndex].text;
                    const associatedSize = associatedSizeElement.options[associatedSizeElement.selectedIndex].text;
                    const associatedColor = associatedColorElement.options[associatedColorElement.selectedIndex].text;
                    
                    const sku = generateVariantSKU({
                        productName: associatedProductName,
                        size: associatedSize,
                        color: associatedColor
                    });
                    const variantData = {
                        productId:document.getElementById('associatedProduct').value,
                        colorId:document.getElementById('variantColor').value,
                        sizeId:document.getElementById('variantSize').value,
                        priceAdjustment:parseFloat(document.getElementById('variantPriceAdjustment').value) || 0,
                        stockQuantity:stockQuantity,
                        sku:sku,
                    };
                    console.log('Creating variant with data:', variantData);
                    await createVariant(variantData);
                    
                    alert('Variante enregistrée!');
                }catch(error){
                    alert('Error creating variant:', error);
                    console.log(error);
                }
                document.getElementById('variantModal').style.display = 'none';
                await loadInitialData();
                renderProductsTable();
                updateStats();
                populateAllSelectOptions();
            });

            // Action buttons delegation
            document.getElementById('productsTableBody').addEventListener('click', function(e) {
                const btn = e.target.closest('.btn-action');
                if (!btn) return;

                const productId = btn.dataset.id;
                
                if (btn.classList.contains('edit-btn')) {
                    editProduct(productId);
                } else if (btn.classList.contains('delete-btn')) {
                    deleteProductFromList(productId);
                } else if (btn.classList.contains('view-btn')) {
                    viewProduct(productId);
                }
            });
        }

        function openProductModal(product = null) {
            editingProductId = product ? product.id : null;

            const modalTitle = document.querySelector('#productModal .modal-header h3');
            const submitBtn = document.querySelector('#productForm button[type="submit"]');

            if (product) {
                // EDIT MODE
                document.getElementById('productName').value = product.name || '';
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPrice').value = product.price || '';

                // Fix category selection
                let categoryName = '';
                if (product.category) {
                    categoryName = typeof product.category === 'object' 
                        ? product.category.name 
                        : product.category;
                }
                document.getElementById('productCategory').value = categoryName;

                modalTitle.innerHTML = `<i class="fas fa-edit"></i> Modifier Produit: ${product.name}`;
                submitBtn.textContent = 'Mettre à jour';
            } else {
                // CREATE MODE
                document.getElementById('productForm').reset();
                document.getElementById('productCategory').value = '';

                modalTitle.innerHTML = `<i class="fas fa-box"></i> Nouveau Produit`;
                submitBtn.textContent = 'Enregistrer';
            }

            document.getElementById('productModal').style.display = 'flex';
        }
        function openCategoryModal() {
            document.getElementById('categoryModal').style.display = 'flex';
        }
        function openColorModal() {
            document.getElementById('colorModal').style.display = 'flex';
        }
        function openVariantModal() {
            document.getElementById('variantModal').style.display = 'flex';
        }
        function editProduct(id) {
            const product = products.find(p => p.id == id);
            if (product) {
                openProductModal(product);  // Pass the full product object
            }
        }

        async function deleteProductFromList(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                try{
                    await deleteProduct(id);
                    alert('Produit supprimé!');
                    // Refresh data and UI
                    await loadInitialData();
                    renderProductsTable();
                    updateStats();
                    populateAllSelectOptions();
                }catch(error){
                    alert('Error deleting product:', error);
                }
            }
        }

        async function deleteOrderFromList(orderId) {
            if (!orderId) return;

            try {
                await deleteOrder(orderId);
                alert('Commande supprimée!');

                await loadInitialData();
                renderOrdersTable();
                updateStats();
            } catch (error) {
                console.error('Erreur suppression commande:', error);
                alert('Erreur lors de la suppression de la commande');
            }
        }

        function viewProduct(id) {
            const product = products.find(p => p.id == id);
            if (product) {
                // Navigate to product details page or open detailed view
                window.location.href = `/src/customer/pages/produit-details.html?id=${id}`;
            }
        }

        function formatCategory(category) {
        // Trim whitespace, convert to lowercase, replace spaces with underscores
            return category
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_');
        }

        function formatCategoryForDisplay(category) {
            return category
                // Replace underscores with spaces
                .replace(/_/g, ' ')
                // Capitalize first letter of each word
                .replace(/\b\w/g, char => char.toUpperCase())
                // Remove any extra spaces
                .replace(/\s+/g, ' ')
                .trim();
        }

        function getCategoryByName(name) {
            name = formatCategory(name);
            console.log('Getting category by name:', name);
            return categories.find(cat => cat.name === name);
        }
        function populateAllSelectOptions() {
            const categorySelect = document.getElementById('productCategory');
            const variantColorSelect = document.getElementById('variantColor');
            const variantSizeSelect = document.getElementById('variantSize');
            const variantProductSelect = document.getElementById('associatedProduct');
            // Clear existing options
            categorySelect.innerHTML = '';
            variantColorSelect.innerHTML = '';
            variantSizeSelect.innerHTML = '';
            variantProductSelect.innerHTML = '';
            // Populate options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = formatCategoryForDisplay(category.name);
                categorySelect.appendChild(option);
            });
            colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color.id;
                option.textContent = color.name;
                variantColorSelect.appendChild(option);
            });
            sizes.forEach(size => {
               const option = document.createElement('option');
                option.value = size.id;
                option.textContent = size.name;
                variantSizeSelect.appendChild(option);
            });
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                variantProductSelect.appendChild(option);
            });
        }
        
        function generateVariantSKU(options = {}) {
            const {
                productName,
                size,
                color,
                delimiter = '-',
                maxProductChars = 6,
                maxSizeChars = 3,
                maxColorChars = 3,
            } = options;

            // Validate required inputs
            if (!productName || !size || !color) {
                throw new Error('productName, size, and color are required');
            }

            // Helper to create consistent codes
            const createCode = (str, maxLength) => {
                return str
                .toString()
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, maxLength);
            };

            const productCode = createCode(productName, maxProductChars);
            const sizeCode = createCode(size, maxSizeChars);
            const colorCode = createCode(color, maxColorChars);

            // Build SKU
            let sku = `${productCode}${delimiter}${sizeCode}${delimiter}${colorCode}`;

            return sku;
        }

(async function checkAuthOnLoad() {
    const token = localStorage.getItem('jwt');

    if (!token) {
        redirectToLogin();
        alert('No JWT found, redirecting to login.');
        return;
    }

    try {
        await temp_auth_check();
        return;
    } catch (err) {
        console.log('Auth check failed:', err);
        localStorage.removeItem('jwt');
        redirectToLogin();
    }
})();

function redirectToLogin(error) {
    alert('Your session has expired. Please log in again.' + (error ? ' Error: ' + error : ''));
    window.location.href = loginUrl;
}

window.closeOrderDetailsModal = closeOrderDetailsModal;
window.saveOrderChanges = saveOrderChanges;
window.openOrderDetailsModal = openOrderDetailsModal;


document.addEventListener('DOMContentLoaded', () => {

    //product image preview handler:
    const fileInput = document.getElementById('productImages');
    const previewContainer = document.getElementById('imagePreview');

    fileInput.addEventListener('change', handleImagePreview);

    function handleImagePreview(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Optional: limit number of files
        if (files.length > 7) {
            alert('Maximum 7 images autorisées');
            fileInput.value = '';
            previewContainer.innerHTML = '';
            return;
        }

        previewContainer.innerHTML = ''; // clear previous

        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const div = document.createElement('div');
                div.className = 'preview-item';

                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = file.name;

                const removeBtn = document.createElement('button');
                removeBtn.className = 'preview-remove';
                removeBtn.textContent = '×';
                removeBtn.type = 'button';
                removeBtn.onclick = () => {
                    div.remove();
                };

                div.appendChild(img);
                div.appendChild(removeBtn);
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });

        //category image preview handler:
        // ── Category Photo Preview & Clear ────────────────────────────────
        const categoryFileInput = document.getElementById('categoryPhoto');
        const categoryPreviewContainer = document.getElementById('categoryPreview');

        if (categoryFileInput && categoryPreviewContainer) {
            categoryFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                
                // Clear previous preview
                categoryPreviewContainer.innerHTML = '';

                if (!file) return;

                if (!file.type.startsWith('image/')) {
                    alert('Veuillez sélectionner une image valide.');
                    categoryFileInput.value = '';
                    return;
                }

                // Optional: size check (e.g. < 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('L\'image est trop volumineuse (max 5 Mo recommandé).');
                    categoryFileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const div = document.createElement('div');
                    div.className = 'preview-item category-preview-item';

                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.alt = 'Prévisualisation catégorie';

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'preview-remove';
                    removeBtn.textContent = '×';
                    removeBtn.type = 'button';
                    removeBtn.onclick = function() {
                        div.remove();
                        categoryFileInput.value = '';
                    };

                    div.appendChild(img);
                    div.appendChild(removeBtn);
                    categoryPreviewContainer.appendChild(div);
                };
                reader.readAsDataURL(file);
            });

            // Clear preview when modal is closed/cancelled
            document.querySelectorAll('#categoryModal .close-modal, #categoryModal .btn-cancel').forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryFileInput.value = '';
                    categoryPreviewContainer.innerHTML = '';
                });
            });
        }
    }

    document.querySelector('.btn-cancel')?.addEventListener('click', () => {
        fileInput.value = '';
        previewContainer.innerHTML = '';
    });

    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.variants-btn');
        if (!btn) return;

        const productId = btn.dataset.id;
        const product = products.find(p => p.id == productId); // == because id can be string/number
        if (!product) return;

        openVariantsModal(product);
    });

    document.addEventListener('input', function(e) {
        if (!e.target.classList.contains('stock-input')) return;

        const btn = e.target.closest('tr')?.querySelector('.btn-save-variant');
        if (btn) btn.disabled = false;
    });
    
    document.addEventListener('click', function(e) {
    // Find the button – works for both existing and newly created elements
    const btn = e.target.closest('.btn-action');
    if (!btn) return;

    // Use consistent data attribute name (you have both data-id and data-order-id → pick one)
    // Let's standardize on data-order-id
    const orderId = btn.dataset.orderId || btn.dataset.id;
    if (!orderId) return;

    const order = orders.find(o => String(o.id) === String(orderId));
    if (!order) return;

    if (btn.classList.contains('edit-order-btn')) {
        e.preventDefault();
        e.stopPropagation();
        openOrderDetailsModal(order);
        return;
    }

    if (btn.classList.contains('delete-btn')) {
        e.preventDefault();
        e.stopPropagation();

        if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
            deleteOrderFromList(orderId);
        }
        return;
    }
});

    document.addEventListener('click', async function(e) {
        const btn = e.target.closest('.btn-save-variant');
        if (!btn) return;

        const sku = btn.dataset.sku;                      // ← read it from the button
        // const sku = btn.closest('tr').querySelector('.stock-input').dataset.sku;  // alternative

        if (!sku) {
            alert("Erreur : SKU manquant pour cette variante.");
            return;
        }

        const input = btn.closest('tr')?.querySelector('.stock-input');
        if (!input) return;

        const newStock = parseInt(input.value, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert("Veuillez entrer un stock valide (≥ 0).");
            return;
        }

        try {
            await updateVariantStock(sku, newStock);

            btn.disabled = true;
            btn.textContent = "Enregistré ✓";
            setTimeout(() => { btn.textContent = "Enregistrer"; }, 2000);

            // Update total stock display
            const allInputs = document.querySelectorAll('#variantsTableBody .stock-input');
            let sum = 0;
            allInputs.forEach(inp => sum += parseInt(inp.value, 10) || 0);
            document.getElementById('modalTotalStock').textContent = sum;

            await loadProducts(); // Refresh products data
            renderProductsTable();
        } catch (err) {
            console.error(err);
            alert("Échec de la mise à jour du stock. Vérifiez votre connexion.");
            btn.disabled = false;
        }
    });
});






    