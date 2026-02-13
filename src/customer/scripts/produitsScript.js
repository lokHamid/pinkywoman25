import {fetchProductByPage} from '../../server/api/product.js';
import {fetchAllCategories} from '../../server/api/category.js';
import {getAllSizes} from '../../server/api/size.js';
import {getAllColors} from '../../server/api/color.js';
const produit_details_url = 'produit-details.html';

// State management
let products = [];
let currentFilter = 'all';
let currentPage = 0;
let totalPages = 0;
let totalProducts = 0;
const limit = 20;

// Add near other state variables
let availableCategories = [];  // [{id: 1, name: "T_SHIRTS", displayName: "T-Shirts"}, ...]
let availableSizes      = [];  // [{id: 5, name: "M", ...}, ...] or just strings if no id
let availableColors     = [];  // [{id: 3, hex: "#ff3b30", name: "Red"}, ...]

let activeFilters = {
    categoryIds: [],   // [1, 4, 7]
    sizeIds:     [],   // [5, 8]
    colorIds:    [],   // [3, 9]
    minPrice:    null,
    maxPrice:    null
};

// DOM Elements
const productsGrid = document.querySelector('.products-grid');
const filterBtn = document.getElementById('filterBtn');
const filterDropdownContent = document.querySelector('.filter-drp-content');
const filterDropdownLinks = document.querySelectorAll('.filter-drp-content a');

function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (!cat) return null;
    
    // Accept both ?category=5  and  ?category=5,7,12 (comma separated)
    return cat.split(',').map(id => id.trim()).filter(id => id && !isNaN(id));
}

async function fetchProducts(page = 0) {
    try {
        currentPage = page;
        showLoadingState();

        const params = new URLSearchParams({
            page: page.toString(),
            size: limit.toString(),
        });

        if (activeFilters.categoryIds.length > 0) {
            params.append('categoryIds', activeFilters.categoryIds.join(','));
        }
        if (activeFilters.sizeIds.length > 0) {
            params.append('sizeIds', activeFilters.sizeIds.join(','));
        }
        if (activeFilters.colorIds.length > 0) {
            params.append('colorIds', activeFilters.colorIds.join(','));
        }
        if (activeFilters.minPrice !== null) {
            params.append('minPrice', activeFilters.minPrice.toString());
        }
        if (activeFilters.maxPrice !== null) {
            params.append('maxPrice', activeFilters.maxPrice.toString());
        }

        const response = await fetchProductByPage(params);
        
        if (response && response.content && Array.isArray(response.content)) {
            products = response.content;
            totalPages = response.totalPages || 0;
            totalProducts = response.totalElements || 0;
            renderProducts(products);
            renderPagination();
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        console.error('Error fetching products:', error);
        showErrorState();
    }
}

// Function to render pagination buttons
function renderPagination() {
    // Remove existing pagination if it exists
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // Don't show pagination if there's only one page or no products
    if (totalPages <= 1 || products.length === 0) return;
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    // Create pagination HTML
    let paginationHTML = `
        <div class="pagination">
            <button class="pagination-btn ${currentPage === 0 ? 'disabled' : ''}" id="prev-page">
                <i class="fas fa-chevron-left"></i> Précédent
            </button>
            <div class="page-numbers">
    `;
    
    // Show page numbers (limited to 5 pages max for simplicity)
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    // Show first page if not in range
    if (startPage > 0) {
        paginationHTML += `
            <button class="page-number ${0 === currentPage ? 'active' : ''}" data-page="0">
                1
            </button>
        `;
        if (startPage > 1) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Show page numbers in range
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i + 1}
            </button>
        `;
    }
    
    // Show last page if not in range
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        paginationHTML += `
            <button class="page-number ${totalPages - 1 === currentPage ? 'active' : ''}" data-page="${totalPages - 1}">
                ${totalPages}
            </button>
        `;
    }
    
    paginationHTML += `
            </div>
            <button class="pagination-btn ${currentPage >= totalPages - 1 ? 'disabled' : ''}" id="next-page">
                Suivant <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="page-info">
            Page ${currentPage + 1} sur ${totalPages} (${totalProducts} produits)
        </div>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Insert after products grid
    productsGrid.parentNode.insertBefore(paginationContainer, productsGrid.nextSibling);
    
    // Add event listeners
    setupPaginationEvents();
}

// Function to setup pagination event listeners
function setupPaginationEvents() {
    // Previous page button
    const prevBtn = document.getElementById('prev-page');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                fetchProducts(currentPage - 1);
            }
        });
    }
    
    // Next page button
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                fetchProducts(currentPage + 1);
            }
        });
    }
    
    // Page number buttons
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page);
            if (page !== currentPage) {
                fetchProducts(page);
            }
        });
    });
}

// Function to show loading state
function showLoadingState() {
    productsGrid.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Chargement des produits...</p>
        </div>
    `;
    
    // Remove existing pagination during loading
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }
}

// Function to show error state
function showErrorState() {
    productsGrid.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
            <h3>Erreur de chargement</h3>
            <p>Impossible de charger les produits. Veuillez réessayer.</p>
            <button id="retry-btn" class="retry-button">Réessayer</button>
        </div>
    `;
    
    document.getElementById('retry-btn')?.addEventListener('click', () => fetchProducts(currentPage));
}

// Function to render products - FIXED VERSION
function renderProducts(productsToRender) {
    // Check if productsToRender is an array
    if (!Array.isArray(productsToRender)) {
        console.error('productsToRender is not an array:', productsToRender);
        showNoProducts();
        return;
    }
    
    if (productsToRender.length === 0) {
        showNoProducts();
        return;
    }

    productsGrid.innerHTML = productsToRender.map(product => {
        // Check if product has required properties
        if (!product || typeof product !== 'object') {
            console.warn('Invalid product data:', product);
            return '';
        }
        
        return `
        <div class="product-card" data-product-id="${product.id || ''}">
            <div class="product-image-container">
                ${getProductImage(product)}
            </div>
            <div class="product-details">
                <div class="product-specs">
                    <h3 class="product-title">${escapeHtml(product.name || 'Produit sans nom')}</h3>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <p class="product-description">${truncateDescription(escapeHtml(product.description || ''))}</p>
                    <div class="product-meta">
                        ${product.category ? `<span class="product-category">${escapeHtml(formatCategoryForDisplay(product.category.name))}</span>` : ''}
                        ${product.variants?.length > 0 ? `<span class="variant-count">${product.variants.length} variantes</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Add click event listeners to all product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.getAttribute('data-product-id');
            if (productId) {
                navigateToProductDetails(productId);
            }
        });
    });
}

// Function to show no products state
function showNoProducts() {
    productsGrid.innerHTML = `
        <div class="no-products-container">
            <i class="fas fa-box-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
            <h3>Aucun produit disponible</h3>
            <p>Aucun produit ne correspond à vos critères de recherche.</p>
        </div>
    `;
}

// Helper function to get product image
function getProductImage(product) {
    if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
        return `<img 
            src="${escapeHtml(product.photos[0])}" 
            alt="${escapeHtml(product.name || 'Produit')}"
            loading="lazy"
            onerror="this.src='../../assets/cropped-pw25.jpeg'"
        >`;
    }
    
    // Fallback image
    return `<img 
        src="../../assets/cropped-pw25.jpeg" 
        alt="${escapeHtml(product.name || 'Produit')}"
        loading="lazy"
    >`;
}

// Helper function to format price
function formatPrice(price) {
    if (price === undefined || price === null || isNaN(price)) {
        return 'Prix non disponible';
    }
    
    
    return `${price} D.A`;
}

// Helper function to truncate description
function truncateDescription(description, maxLength = 100) {
    if (!description) return 'Aucune description disponible';
    
    if (description.length <= maxLength) return description;
    
    return description.substring(0, maxLength).trim() + '...';
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to navigate to product details
function navigateToProductDetails(productId) {
    window.location.href = `${produit_details_url}?id=${productId}`;
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await fetchFilterOptions();
    // initialize filters from URL
    initializeFiltersFromUrl();
    attachFilterListeners();
    fetchProducts(0);
});

function initializeFiltersFromUrl() {
    const urlCategoryIds = getCategoryFromUrl();
    
    if (urlCategoryIds && urlCategoryIds.length > 0) {
        activeFilters.categoryIds = urlCategoryIds.map(Number); // make sure they are numbers
        
        // Optional: also check the corresponding checkboxes so UI looks correct
        document.querySelectorAll('.category-checkbox').forEach(cb => {
            const val = cb.value;
            if (activeFilters.categoryIds.includes(Number(val))) {
                cb.checked = true;
            }
        });
    }
}

async function fetchFilterOptions() {
    try {
        const categories = await fetchAllCategories();
        const sizes = await getAllSizes();
        const colors = await getAllColors();
        

        availableCategories = categories || [];
        availableSizes = sizes || ["S","M","L","XL","XXL"];
        availableColors = colors
        renderFilterOptions();

    } catch (err) {
        console.error("Failed to load filter options", err);
        // Optionally show fallback UI
    }
}

function renderFilterOptions() {
    // Categories
    const catContainer = document.querySelector('.category-section .filter-options');
    if (catContainer && availableCategories.length > 0) {
        catContainer.innerHTML = availableCategories.map(cat => {
            const catIdStr = cat.id.toString();
            return `
                <div class="filter-option">
                    <input type="checkbox" id="cat-${catIdStr}"
                           value="${catIdStr}" class="category-checkbox"
                           ${activeFilters.categoryIds.includes(catIdStr) ? 'checked' : ''}>
                    <label for="cat-${catIdStr}">${cat.displayName || formatCategoryForDisplay(cat.name)}</label>
                </div>
            `;
        }).join('');
    }

    // Sizes – keep original div + .selected style
    const sizeContainer = document.querySelector('.size-section .size-options');
    if (sizeContainer && availableSizes.length > 0) {
        sizeContainer.innerHTML = availableSizes.map(size => {
            const idStr = size.id?.toString() || size.name || '??';
            const label = size.name || '??';
            const isSelected = activeFilters.sizeIds.includes(idStr);

            return `
                <div class="size-option ${isSelected ? 'selected' : ''}" 
                     data-value="${idStr}">
                    ${label}
                </div>
            `;
        }).join('');
    }

    // Colors – keep original div + .selected style
    const colorContainer = document.querySelector('.color-section .color-options');
    if (colorContainer && availableColors.length > 0) {
        colorContainer.innerHTML = availableColors.map(color => {
            const idStr = color.id.toString();
            const hex   = color.hex_code || '#cccccc';
            const title = color.name || hex;
            const isSelected = activeFilters.colorIds.includes(idStr);

            return `
                <div class="color-option ${isSelected ? 'selected' : ''}"
                     data-value="${idStr}"
                     style="background-color: ${hex};"
                     title="${title}">
                </div>
            `;
        }).join('');
    }
}

// function initFilterListeners() {
//     // Categories (IDs)
//     document.addEventListener('change', (e) => {
//         if (e.target.classList.contains('category-checkbox')) {
//             activeFilters.categoryIds = Array.from(document.querySelectorAll('.category-checkbox:checked'))
//                 .map(el => el.value);  // Now category IDs
//         }
//     });

//     // Sizes (click toggle)
//     document.addEventListener('click', (e) => {
//         if (e.target.classList.contains('size-option')) {
//             e.target.classList.toggle('selected');
//             const id = e.target.dataset.value;  // string
//             if (activeFilters.sizeIds.includes(id)) {
//                 activeFilters.sizeIds = activeFilters.sizeIds.filter(v => v !== id);
//             } else {
//                 activeFilters.sizeIds.push(id);
//             }
//         }
//     });

//     // Colors (same – already string)
//     document.addEventListener('click', (e) => {
//         if (e.target.classList.contains('color-option')) {
//             e.target.classList.toggle('selected');
//             const id = e.target.dataset.value;
//             if (activeFilters.colorIds.includes(id)) {
//                 activeFilters.colorIds = activeFilters.colorIds.filter(v => v !== id);
//             } else {
//                 activeFilters.colorIds.push(id);
//             }
//         }
//     });

//     // Price inputs (on change or on apply button)
//     const minInput = document.querySelector('.price-input-group input[placeholder*="Min"]');
//     const maxInput = document.querySelector('.price-input-group input[placeholder*="Max"]');

//     if (minInput) minInput.addEventListener('input', () => {
//         activeFilters.minPrice = minInput.value ? Number(minInput.value) : null;
//     });
//     if (maxInput) maxInput.addEventListener('input', () => {
//         activeFilters.maxPrice = maxInput.value ? Number(maxInput.value) : null;
//     });

//     // Apply button
//     document.querySelector('.apply-filters-btn')?.addEventListener('click', () => {
//         currentPage = 0;           // reset to first page
//         fetchProducts(0);
//     });
// }

function resetFilters() {
    // Clear active filters
    activeFilters = {
        categoryIds: [],
        sizeIds: [],
        colorIds: [],
        minPrice: null,
        maxPrice: null
    };

    // Reset UI elements
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    
    const minPriceInput = document.querySelector('#price-min') || 
                        document.querySelector('input[placeholder*="Min"]');
    const maxPriceInput = document.querySelector('#price-max') || 
                        document.querySelector('input[placeholder*="Max"]');
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';

    // Fetch products with no filters
    currentPage = 0;
    fetchProducts(0);
}

// Attach reset button listener
document.querySelector('.reset-filters-btn')?.addEventListener('click', resetFilters);

function attachFilterListeners() {
    // Use event delegation on document or a closer parent
    document.addEventListener('click', function(e) {
        // Size click
        let sizeEl = e.target.closest('.size-option');
        if (sizeEl) {
            const value = sizeEl.dataset.value;
            if (!value) return;

            sizeEl.classList.toggle('selected');

            if (activeFilters.sizeIds.includes(value)) {
                activeFilters.sizeIds = activeFilters.sizeIds.filter(v => v !== value);
            } else {
                activeFilters.sizeIds.push(value);
            }
            return;
        }

        // Color click
        let colorEl = e.target.closest('.color-option');
        if (colorEl) {
            const value = colorEl.dataset.value;
            if (!value) return;

            colorEl.classList.toggle('selected');

            if (activeFilters.colorIds.includes(value)) {
                activeFilters.colorIds = activeFilters.colorIds.filter(v => v !== value);
            } else {
                activeFilters.colorIds.push(value);
            }
            return;
        }
    });

    // Categories (checkboxes) – can stay direct or also delegated
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('category-checkbox')) {
            activeFilters.categoryIds = Array.from(
                document.querySelectorAll('.category-checkbox:checked')
            ).map(el => el.value);
        }
    });

    // ── Price handling ──────────────────────────────────────────────
    const minPriceInput = document.querySelector('#price-min') || 
                        document.querySelector('input[placeholder*="Min"]');
    const maxPriceInput = document.querySelector('#price-max') || 
                        document.querySelector('input[placeholder*="Max"]');

    function updatePriceFilters() {
        // Read current values every time we need them (most reliable)
        const minVal = minPriceInput?.value.trim();
        const maxVal = maxPriceInput?.value.trim();
        //free choice of price:
        activeFilters.minPrice = minVal ? Number(minVal) : null;
        activeFilters.maxPrice = maxVal ? Number(maxVal) : null;

        // Optional: visual feedback
        minPriceInput.value = activeFilters.minPrice;
        maxPriceInput.value = activeFilters.maxPrice;
    }

    // Run once on load (set defaults visually)
    updatePriceFilters();

    // Update when user types
    if (minPriceInput) {
        minPriceInput.addEventListener('input', updatePriceFilters);
    }
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', updatePriceFilters);
    }

    // Apply button – this is the most important part
    const applyBtn = document.querySelector('.apply-filters-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Make sure we have latest values
            updatePriceFilters();

            // Reset to page 1 when filters change
            currentPage = 0;

            // Actually fetch with current filters
            fetchProducts(0);

            // Optional: visual feedback
            applyBtn.textContent = "Applying...";
            setTimeout(() => {
                applyBtn.textContent = "appliquer";
            }, 800);
        });
    }
}