import { fetchProductByPage } from '../../server/api/product.js';
import { fetchAllCategories } from '../../server/api/category.js';
const images = [
    "/assets/rotating-img1.jpeg",
    "/assets/rotating-img2.jpg",
    "/assets/rotating-img3.jpg"
];

let index = 0;
const rotator = document.getElementById("background-rotator");

function changeBackground() {
    rotator.style.opacity = 0;

    setTimeout(() => {
        rotator.style.backgroundImage = `url('${images[index]}')`;
        rotator.style.opacity = 1;
        index = (index + 1) % images.length;
    }, 50);
}
changeBackground();
setInterval(changeBackground, 5000);

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.product-container');
  
  // If container doesn't exist on this page, exit
  if (!container) return;

  try {
    // Ask for page 0 (first page) with size=4 → exactly 4 products
    const pageData = await fetchProductByPage(0, 4);
    const products = pageData.content;

    // Clear old static items
    container.innerHTML = '';

    products.forEach(product => {
      // Create the new vertical card structure
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      
      // Add click event to navigate to product details
      productCard.addEventListener('click', () => {
        window.location.href = `produit-details.html?id=${product.id}`;
      });

      // Image container
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('product-image-container');
      
      const img = document.createElement('img');
      img.src = product.photos && product.photos[0] 
        ? product.photos[0] 
        : '/assets/placeholder.jpg'; // Fallback image
      img.alt = product.name || 'Product';
      img.classList.add('product-image');
      imageContainer.appendChild(img);
      
      productCard.appendChild(imageContainer);

      // Product info section
      const productInfo = document.createElement('div');
      productInfo.classList.add('product-info');
      
      const productTitle = document.createElement('h3');
      productTitle.classList.add('product-title');
      productTitle.textContent = product.name || 'Unnamed Product';
      productInfo.appendChild(productTitle);
      
      const productPrice = document.createElement('p');
      productPrice.classList.add('product-price');
      productPrice.textContent = `${product.price || '0'} DA`;
      productInfo.appendChild(productPrice);
      
      productCard.appendChild(productInfo);

      container.appendChild(productCard);
    });

  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<p class="error-message">Échec du chargement des produits. Veuillez réessayer plus tard.</p>';
    
    // Add some CSS for the error message
    const style = document.createElement('style');
    style.textContent = `
      .error-message {
        color: #d32f2f;
        margin: 40px auto;
        text-align: center;
        font-size: 1.2rem;
        font-family: var(--font-family);
        grid-column: 1 / -1;
        padding: 20px;
        background-color: #ffebee;
        border-radius: 8px;
        max-width: 600px;
      }
    `;
    document.head.appendChild(style);
  }
});

// Optional: Add this function to load categories dynamically
async function loadCategories() {
  const categoryContainer = document.querySelector('.category-container');
  if (!categoryContainer) return;

  try {
    const categories = await fetchAllCategories();

    categoryContainer.innerHTML = '';

    categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.classList.add('category-item');
      
      categoryItem.addEventListener('click', () => {
        window.location.href = `produits.html?category=${category.id}`;
      });

      const img = document.createElement('img');
      img.src = category.photo;
      img.alt = category.name;
      
      categoryItem.appendChild(img);

      // Category title
      const categoryTitle = document.createElement('h3');
      categoryTitle.textContent = formatCategoryForDisplay(category.name);
      categoryItem.appendChild(categoryTitle);

      categoryContainer.appendChild(categoryItem);
    });

  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Call it after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Your existing product loading code...
  
  // Load categories if needed
  loadCategories();
});

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