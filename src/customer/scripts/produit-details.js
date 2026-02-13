import {fetchProductById} from '../../server/api/product.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.error('No product ID provided in URL');
        window.location.href = 'produits.html';
        return;
    }
    
    // ========== LIGHTBOX ELEMENTS ==========
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    let currentImages = []; // Array to hold all product images
    let currentLightboxIndex = 0;
    
    // ========== LIGHTBOX FUNCTIONS ==========
    function openLightbox(index) {
        if (currentImages.length === 0) return;
        
        currentLightboxIndex = index;
        updateLightboxImage();
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleLightboxKeyboard);
    }
    
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleLightboxKeyboard);
    }
    
    function updateLightboxImage() {
        if (currentImages[currentLightboxIndex]) {
            lightboxImage.src = currentImages[currentLightboxIndex];
            lightboxCaption.textContent = `Image ${currentLightboxIndex + 1}`;
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentImages.length}`;
            
            // Add loading state
            lightboxImage.style.opacity = '0';
            setTimeout(() => {
                lightboxImage.style.opacity = '1';
            }, 50);
        }
    }
    
    function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + currentImages.length) % currentImages.length;
        updateLightboxImage();
    }
    
    function handleLightboxKeyboard(e) {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    }
    
    // Initialize lightbox event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }
    
    // Close lightbox when clicking outside the image
    if (lightboxModal) {
        lightboxModal.addEventListener('click', function(e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    try {
        // Fetch product data using the imported function
        const product = await fetchProductById(productId);
        
        // Populate product details
        populateProductDetails(product);
        
        // Initialize gallery with product photos if available
        if (product.photos && product.photos.length > 0) {
            // Store images for lightbox
            currentImages = product.photos;
            initializeGallery(product.photos);
        } else {
            // Use default gallery functionality if no product photos
            // Get images from existing thumbnails for lightbox
            const thumbnails = document.querySelectorAll('.thumbnail');
            currentImages = Array.from(thumbnails).map(thumb => thumb.getAttribute('data-image'));
            initializeDefaultGallery();
        }
        
        // Setup size and color selection based on variants
        setupProductVariants(product.variants);

        // ========== MAKE IMAGE CLICKABLE ==========
        const currentImage = document.getElementById('currentImage');
        if (currentImage && currentImages.length > 0) {
            currentImage.addEventListener('click', () => openLightbox(0));
            currentImage.style.cursor = 'pointer';
        }
        
    } catch (error) {
        console.error('Error loading product:', error);
        // Display error message to user
        showErrorMessage('Unable to load product details. Please try again.');
    }
    
    function populateProductDetails(product) {
        // Update product information
        document.title = `${product.name} - Product Details`;
        
        const titleElement = document.querySelector('.title');
        const priceElement = document.querySelector('.price');
        const descriptionElement = document.querySelector('.description');
        
        if (titleElement) titleElement.textContent = product.name;
        if (priceElement) {
            const formattedPrice = new Intl.NumberFormat('fr-DZ', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(product.price);
            priceElement.textContent = `${formattedPrice} D.A`;
        }
        if (descriptionElement) descriptionElement.textContent = product.description;
        
        const quantityElement = document.querySelector('.qt');
        if (quantityElement && product.variants) {
            const totalQuantity = product.variants.reduce((sum, variant) =>
                sum + (variant.stock_quantity || 0), 0);

            if (totalQuantity > 0) {
                // Hide completely when there's stock
                quantityElement.style.display = 'none';
            } else {
                // Only show when fully out of stock
                quantityElement.textContent = 'Épuisée';
                quantityElement.style.color = '#c53030';
                quantityElement.style.fontWeight = '600';
            }
        }
                
        // Update categories
        const categoryContainer = document.querySelector('.category-cards-container');
        if (categoryContainer && product.category) {
            categoryContainer.innerHTML = `<p>${formatCategoryForDisplay(product.category.name)}</p>`;
        }
        
        // Store product globally for later use
        window.currentProduct = product;
        
        // Update commander button to pass product info
        const commanderBtn = document.querySelector('.btn-primary');
        commanderBtn.addEventListener('click', () => {
            const activeVariantEl = document.querySelector('.variant-option.active');
            if (!activeVariantEl) {
                alert("Veuillez sélectionner une variante");
                return;
            }

            const index = parseInt(activeVariantEl.dataset.variantIndex);
            const selectedVariant = window.currentProduct.variants[index];

            if (!selectedVariant || selectedVariant.quantity <= 0) {
                alert("Cette variante n'est plus disponible");
                return;
            }

            const orderData = {
                productId: product.id,
                productName: product.name,
                variantId: selectedVariant.id || selectedVariant.sku || index, // use whatever identifies the variant
                sku: selectedVariant.sku || '',
                size: selectedVariant.size || '',
                color: selectedVariant.color || '',
                price: product.price,           // or variant.price if you have per-variant pricing
                quantity: parseInt(document.querySelector('.quantity-sect input')?.value) || 1
            };

            sessionStorage.setItem('orderData', JSON.stringify(orderData));
            window.location.href = 'commande.html';
        });
    }
    
    function initializeGallery(photos) {
        const currentImage = document.getElementById('currentImage');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const thumbnailContainer = document.querySelector('.thumbnail-container');
        
        let currentIndex = 0;
        
        // Clear existing thumbnails
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = '';
        }
        
        // Create thumbnails from product photos
        photos.forEach((photo, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = photo;
            thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
            thumbnail.alt = `Thumbnail ${index + 1}`;
            thumbnail.dataset.index = index;
            thumbnail.style.cursor = 'pointer';
            
            // Click to update main image AND open lightbox
            thumbnail.addEventListener('click', () => {
                updateImage(index);
                openLightbox(index);
            });
            
            if (thumbnailContainer) {
                thumbnailContainer.appendChild(thumbnail);
            }
        });
        
        // Update main image
        if (currentImage && photos.length > 0) {
            currentImage.src = photos[0];
            currentImage.style.cursor = 'pointer';
        }
        
        // Navigation buttons
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + photos.length) % photos.length;
                updateImage(currentIndex);
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % photos.length;
                updateImage(currentIndex);
            });
        }
        
        function updateImage(index) {
            currentIndex = index;
            if (currentImage) {
                currentImage.src = photos[currentIndex];
            }
            
            // Update active thumbnail
            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach((thumb, thumbIndex) => {
                const wasActive = thumb.classList.contains('active');
                thumb.classList.toggle('active', thumbIndex === currentIndex);
                
                // Add transition effect
                if (wasActive && !thumb.classList.contains('active')) {
                    thumb.style.transform = 'scale(1)';
                } else if (!wasActive && thumb.classList.contains('active')) {
                    thumb.style.transform = 'translateY(-2px) scale(1.05)';
                }
            });
            
            // Add fade effect to main image
            if (currentImage) {
                currentImage.style.opacity = '0.7';
                setTimeout(() => {
                    currentImage.style.opacity = '1';
                }, 150);
            }
        }
        
        // Keyboard navigation for gallery
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && leftBtn) {
                leftBtn.click();
            } else if (e.key === 'ArrowRight' && rightBtn) {
                rightBtn.click();
            }
        });
    }
    
    function initializeDefaultGallery() {
        const currentImage = document.getElementById('currentImage');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        let currentIndex = 0;
        const images = Array.from(thumbnails).map(thumb => thumb.getAttribute('data-image'));
        
        // Thumbnail click functionality - UPDATED for lightbox
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.style.cursor = 'pointer';
            thumbnail.addEventListener('click', function() {
                updateImage(index);
                openLightbox(index); // Open lightbox when thumbnail clicked
            });
        });
        
        // Navigation buttons
        if (leftBtn) {
            leftBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateImage(currentIndex);
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % images.length;
                updateImage(currentIndex);
            });
        }
        
        function updateImage(index) {
            currentIndex = index;
            if (currentImage) {
                currentImage.src = images[currentIndex];
            }
            
            // Update active thumbnail with smooth transition
            thumbnails.forEach((thumb, thumbIndex) => {
                const wasActive = thumb.classList.contains('active');
                thumb.classList.toggle('active', thumbIndex === currentIndex);
                
                // Add transition effect
                if (wasActive && !thumb.classList.contains('active')) {
                    thumb.style.transform = 'scale(1)';
                } else if (!wasActive && thumb.classList.contains('active')) {
                    thumb.style.transform = 'translateY(-2px) scale(1.05)';
                }
            });
            
            // Add fade effect to main image
            if (currentImage) {
                currentImage.style.opacity = '0.7';
                setTimeout(() => {
                    currentImage.style.opacity = '1';
                }, 150);
            }
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && leftBtn) {
                leftBtn.click();
            } else if (e.key === 'ArrowRight' && rightBtn) {
                rightBtn.click();
            }
        });

        // Make main image clickable for lightbox
        if (currentImage && images.length > 0) {
            currentImage.style.cursor = 'pointer';
            currentImage.addEventListener('click', () => openLightbox(currentIndex));
        }
    }
    
    function setupProductVariants(variants) {
        if (!variants || variants.length === 0) {
            console.warn("No variants available for this product");
            return;
        }

        const variantContainer = document.querySelector('.variant-options');
        if (!variantContainer) {
            console.error("Variant container not found in DOM");
            return;
        }

        variantContainer.innerHTML = '';

        variants.forEach((variant, index) => {
            const option = document.createElement('div');
            option.className = 'variant-option' + (index === 0 ? ' active' : '');
            option.dataset.variantIndex = index;

            // Build the display text using .name from the nested objects
            const displayText = `
                <div class="variant-header">
                    ${variant.sku ? `Réf: ${variant.sku}` : `Variante ${index + 1}`}
                </div>
                <div class="variant-meta" style="display: flex; align-items: center; gap: 10px;">
                    ${variant.color?.hex_code ? `
                        <span style="
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background-color: ${variant.color.hex_code};
                            border: 1px solid #ddd;
                            vertical-align: middle;
                        "></span>
                    ` : ''}
                    <span>
                        ${variant.color?.name ? `Couleur: ${variant.color.name}` : 'Sans couleur'}
                        ${variant.color?.name && variant.size?.name ? ' • ' : ''}
                        ${variant.size?.name ? `Taille: ${variant.size.name}` : 'Sans taille'}
                    </span>
                </div>
                <div class="stock">
                    ${variant.stock_quantity > 0 
                        ? `<strong>${variant.stock_quantity}</strong> en stock` 
                        : '<strong style="color:#c53030">Rupture de stock</strong>'}
                </div>
            `;

            option.innerHTML = displayText.trim();

            // Disable if out of stock
            if (variant.stock_quantity <= 0) {
                option.classList.add('disabled');
            }

            option.addEventListener('click', () => {
                if (variant.stock_quantity <= 0) return;

                // Remove active class from all
                document.querySelectorAll('.variant-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                // Add active to clicked one
                option.classList.add('active');

                // Update displayed stock quantity
                const quantityElement = document.querySelector('.qt');
                if (quantityElement) {
                    if (variant.stock_quantity > 0) {
                        quantityElement.style.display = 'none';
                    } else {
                        quantityElement.textContent = 'Épuisée';
                        quantityElement.style.color = '#c53030';
                        quantityElement.style.fontWeight = '600';
                        quantityElement.style.display = 'block'; // make sure it's visible
                    }
                }

                // Update max allowed quantity in input
                const quantityInput = document.querySelector('.quantity-sect input');
                if (quantityInput) {
                    quantityInput.max = variant.stock_quantity || 1000;
                    // Don't let user select more than available
                    if (parseInt(quantityInput.value) > variant.stock_quantity) {
                        quantityInput.value = variant.stock_quantity;
                    }
                }

                // Optional: store selected variant globally
                window.selectedVariant = variant;
                window.selectedVariantIndex = index;

                updateCommanderButton();
            });

            variantContainer.appendChild(option);
        });

        // Initialize with first variant
        if (variants.length > 0) {
            const firstVariant = variants[0];
            const quantityElement = document.querySelector('.qt');
            if (quantityElement) {
                if (firstVariant.stock_quantity > 0) {
                    quantityElement.style.display = 'none';
                } else {
                    quantityElement.textContent = 'Épuisée';
                    quantityElement.style.color = '#c53030';
                    quantityElement.style.fontWeight = '600';
                    quantityElement.style.display = 'block';
                }
            }

            const quantityInput = document.querySelector('.quantity-sect input');
            if (quantityInput) {
                quantityInput.max = firstVariant.stock_quantity || 1000;
            }
            updateCommanderButton();
        }
    }
    
    function showErrorMessage(message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            padding: 20px;
            background: #ffebee;
            color: #c62828;
            border-radius: 8px;
            margin: 20px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        // Add retry button
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry';
        retryBtn.style.cssText = `
            margin-top: 10px;
            padding: 8px 16px;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        retryBtn.addEventListener('click', () => location.reload());
        errorDiv.appendChild(retryBtn);
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(errorDiv, mainContent.firstChild);
        } else {
            document.body.appendChild(errorDiv);
        }
    }
    
    // Setup quantity input validation
    const quantityInput = document.querySelector('.quantity-sect input');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const maxQuantity = parseInt(document.querySelector('.qt')?.textContent?.match(/\d+/)?.[0]) || 1000;
            let value = parseInt(this.value);
            
            if (isNaN(value) || value < 1) {
                value = 1;
            } else if (value > maxQuantity) {
                value = maxQuantity;
            }
            
            this.value = value;
        });
    }
});

function formatCategoryForDisplay(category) {
    if (!category) return '';
    return category
        // Replace underscores with spaces
        .replace(/_/g, ' ')
        // Capitalize first letter of each word
        .replace(/\b\w/g, char => char.toUpperCase())
        // Remove any extra spaces
        .replace(/\s+/g, ' ')
        .trim();
}

// Update commander button logic
const commanderBtn = document.querySelector('.btn-primary');

function updateCommanderButton() {
    const activeVariantEl = document.querySelector('.variant-option.active');
    if (!activeVariantEl) {
        commanderBtn.disabled = true;
        commanderBtn.textContent = "Sélectionnez une variante";
        return;
    }

    const index = parseInt(activeVariantEl.dataset.variantIndex);
    const selectedVariant = window.currentProduct.variants[index];

    if (!selectedVariant || selectedVariant.stock_quantity <= 0) {
        commanderBtn.disabled = true;
        commanderBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Rupture de stock';
        commanderBtn.classList.add('disabled');
    } else {
        commanderBtn.disabled = false;
        commanderBtn.innerHTML = '<i class="fa-solid fa-dollar-sign"></i> Commander Maintenant';
        commanderBtn.classList.remove('disabled');
    }
}

// Initial setup + update on variant change
commanderBtn.addEventListener('click', () => {
    if (commanderBtn.disabled) return; // safety

    const activeVariantEl = document.querySelector('.variant-option.active');
    const index = parseInt(activeVariantEl.dataset.variantIndex);
    const selectedVariant = window.currentProduct.variants[index];

    const qtyInput = document.querySelector('.quantity-sect input');
    const qty = parseInt(qtyInput?.value) || 1;

    if (qty > selectedVariant.stock_quantity) {
        alert(`Stock insuffisant ! Maximum disponible : ${selectedVariant.stock_quantity}`);
        return;
    }

    const orderData = {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant.id || selectedVariant.sku || index,
        sku: selectedVariant.sku || '',
        size: selectedVariant.size?.name || '',
        color: selectedVariant.color?.name || '',
        price: product.price,
        price_adjustment: selectedVariant.price_adjustment || 0,
        quantity: qty
    };

    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    window.location.href = 'commande.html';
});
