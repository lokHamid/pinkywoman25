
        // Sample data matching your database schema
        const sampleProducts = [
            {
                id: 1,
                name: "Pyjama en Soie Manche Longue",
                description: "Pyjama en soie luxueux pour un confort optimal",
                price: 4500.00,
                category: "pyjamas_manche_longue",
                created_at: "2024-01-15",
                colors: ["Rouge", "Noir", "Blanc"],
                sizes: ["S", "M", "L", "XL"],
                variants: [
                    { color: "Rouge", size: "S", stock: 10, sku: "PW-S-RED" },
                    { color: "Rouge", size: "M", stock: 15, sku: "PW-M-RED" }
                ]
            },
            {
                id: 2,
                name: "Robe d'Été en Coton",
                description: "Robe légère pour les journées chaudes",
                price: 3200.00,
                category: "robe_maison",
                created_at: "2024-01-20",
                colors: ["Bleu", "Blanc"],
                sizes: ["M", "L"],
                variants: [
                    { color: "Bleu", size: "M", stock: 5, sku: "RB-M-BLUE" },
                    { color: "Bleu", size: "L", stock: 8, sku: "RB-L-BLUE" }
                ]
            },
            {
                id: 3,
                name: "Pyjama Court d'Été",
                description: "Pyjama léger pour les nuits d'été",
                price: 2800.00,
                category: "pyjamas_ete",
                created_at: "2024-01-25",
                colors: ["Vert", "Rose"],
                sizes: ["S", "M", "L"],
                variants: [
                    { color: "Vert", size: "S", stock: 20, sku: "PS-S-GRN" },
                    { color: "Rose", size: "M", stock: 12, sku: "PS-M-PINK" }
                ]
            }
        ];

        const sampleOrders = [
            {
                id_commande: 1,
                customer_name: "Fatima Zohra",
                phone: "0555123456",
                wilaya: "Alger",
                total_amount: 8500.00,
                status: "pending",
                created_at: "2024-01-28"
            },
            {
                id_commande: 2,
                customer_name: "Nadia Bensaid",
                phone: "0777890123",
                wilaya: "Oran",
                total_amount: 3200.00,
                status: "confirmed",
                created_at: "2024-01-27"
            }
        ];

        // Available colors and sizes from database
        const availableColors = [
            { id: 1, name: "Rouge", hex_code: "#FF0000" },
            { id: 2, name: "Noir", hex_code: "#000000" },
            { id: 3, name: "Blanc", hex_code: "#FFFFFF" },
            { id: 4, name: "Bleu", hex_code: "#0000FF" },
            { id: 5, name: "Vert", hex_code: "#00FF00" },
            { id: 6, name: "Rose", hex_code: "#FFC0CB" }
        ];

        const availableSizes = [
            { id: 1, name: "S", category: "unified" },
            { id: 2, name: "M", category: "unified" },
            { id: 3, name: "L", category: "unified" },
            { id: 4, name: "XL", category: "unified" },
            { id: 5, name: "XXL", category: "unified" }
        ];

        document.addEventListener('DOMContentLoaded', function() {
            renderProductsTable();
            renderOrdersTable();
            updateStats();
            setupEventListeners();
            loadColorSizeOptions();
        });

        function renderProductsTable() {
            const tbody = document.getElementById('productsTableBody');
            tbody.innerHTML = '';

            sampleProducts.forEach(product => {
                // Calculate total stock from variants
                const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                
                // Format date
                const date = new Date(product.created_at);
                const formattedDate = date.toLocaleDateString('fr-FR');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="id-cell">${product.id}</td>
                    <td class="name-cell">
                        <strong>${product.name}</strong>
                        <small>${product.description}</small>
                    </td>
                    <td class="category-cell">
                        <span class="category-badge">${formatCategory(product.category)}</span>
                    </td>
                    <td class="price-cell">${product.price.toFixed(2)} DZD</td>
                    <td class="stock-cell ${totalStock === 0 ? 'out-of-stock' : ''}">
                        ${totalStock}
                    </td>
                    <td class="colors-cell">
                        ${product.colors.map(color => `
                            <span class="color-dot" style="background: ${getColorHex(color)}" title="${color}"></span>
                        `).join('')}
                    </td>
                    <td class="sizes-cell">
                        ${product.sizes.join(', ')}
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
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function renderOrdersTable() {
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '';

            sampleOrders.forEach(order => {
                const date = new Date(order.created_at);
                const formattedDate = date.toLocaleDateString('fr-FR');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.id_commande}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.phone}</td>
                    <td>${order.wilaya}</td>
                    <td>${order.total_amount.toFixed(2)} DZD</td>
                    <td>
                        <span class="order-status ${order.status}">${formatStatus(order.status)}</span>
                    </td>
                    <td>${formattedDate}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function updateStats() {
            document.getElementById('totalProducts').textContent = sampleProducts.length;
            const pendingOrders = sampleOrders.filter(order => order.status === 'pending').length;
            document.getElementById('pendingOrders').textContent = pendingOrders;
        }

        function formatCategory(category) {
            const categories = {
                'pyjamas_manche_longue': 'Pyjamas ML',
                'pyjamas_ete': 'Pyjamas Été',
                'robe_maison': 'Robe Maison'
            };
            return categories[category] || category;
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

        function getColorHex(colorName) {
            const color = availableColors.find(c => c.name === colorName);
            return color ? color.hex_code : '#CCCCCC';
        }

        function loadColorSizeOptions() {
            const colorsContainer = document.getElementById('colorsContainer');
            const sizesContainer = document.getElementById('sizesContainer');

            // Load colors
            colorsContainer.innerHTML = availableColors.map(color => `
                <label class="checkbox-label">
                    <input type="checkbox" name="colors" value="${color.id}">
                    <span class="color-preview" style="background: ${color.hex_code}"></span>
                    ${color.name}
                </label>
            `).join('');

            // Load sizes
            sizesContainer.innerHTML = availableSizes.map(size => `
                <label class="checkbox-label">
                    <input type="checkbox" name="sizes" value="${size.id}">
                    ${size.name}
                </label>
            `).join('');
        }

        function setupEventListeners() {
            // Add Product Button
            document.getElementById('addProductBtn').addEventListener('click', openProductModal);

            // Search functionality
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
                    document.getElementById('productModal').style.display = 'none';
                });
            });

            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                const modal = document.getElementById('productModal');
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Product form submission
            document.getElementById('productForm').addEventListener('submit', function(e) {
                e.preventDefault();
                // Here you would send data to your backend
                alert('Produit enregistré!');
                document.getElementById('productModal').style.display = 'none';
                // In real app, you would reload the products table
            });

            // Action buttons delegation
            document.getElementById('productsTableBody').addEventListener('click', function(e) {
                const btn = e.target.closest('.btn-action');
                if (!btn) return;

                const productId = btn.dataset.id;
                
                if (btn.classList.contains('edit-btn')) {
                    editProduct(productId);
                } else if (btn.classList.contains('delete-btn')) {
                    deleteProduct(productId);
                } else if (btn.classList.contains('view-btn')) {
                    viewProduct(productId);
                }
            });
        }

        function openProductModal() {
            document.getElementById('productModal').style.display = 'flex';
        }

        function editProduct(id) {
            const product = sampleProducts.find(p => p.id == id);
            if (product) {
                // Fill form with product data
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productCategory').value = product.category;
                
                // Update modal title
                document.querySelector('.modal-header h3').innerHTML = 
                    `<i class="fas fa-edit"></i> Modifier Produit: ${product.name}`;
                
                openProductModal();
            }
        }

        function deleteProduct(id) {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                // Here you would make DELETE request to your API
                console.log('Deleting product:', id);
                alert('Produit supprimé!');
            }
        }

        function viewProduct(id) {
            const product = sampleProducts.find(p => p.id == id);
            if (product) {
                // Navigate to product details page or open detailed view
                window.location.href = `/src/customer/pages/produit-details.html?id=${id}`;
            }
        }
    