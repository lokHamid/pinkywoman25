// navbar-categories.js
// Using MutationObserver to wait until the navbar (and dropdownmenu) is actually in the DOM

import { fetchAllCategories } from '../../server/api/category.js';

function initializeDropdown() {
    const dropdownMenu = document.getElementById('dropdownmenu');
    
    if (!dropdownMenu) {
        return false;
    }

    (async () => {
        try {
            const categoriesData = await fetchAllCategories();

            const categories = Array.isArray(categoriesData)
                ? categoriesData
                : [categoriesData];

            const formatted = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '_') || 'no-slug'
            }));

            dropdownMenu.innerHTML = '';

            formatted.forEach(category => {
                const link = document.createElement('a');
                link.href = `produits.html?category=${category.id}`;
                link.textContent = formatCategoryForDisplay(category.name);
                dropdownMenu.appendChild(link);
            });

            if (formatted.length === 0) {
                dropdownMenu.innerHTML = '<a href="#">Aucune catégorie disponible</a>';
            }

        } catch (err) {
            console.error("Failed to load categories:", err);
            dropdownMenu.innerHTML = '<a href="#">Erreur de chargement des catégories</a>';
        }
    })();

    return true; // success → we can stop observing
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

// ────────────────────────────────────────────────
// Start observing for when the dropdown appears
const observer = new MutationObserver((mutations, obs) => {
    // Check if our target element now exists
    if (document.getElementById('dropdownmenu')) {
        if (initializeDropdown()) {
            obs.disconnect(); // Important: stop observing once we succeeded
        }
    }
});

// Start observing the body (or a closer parent if you know it)
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Optional: also try immediately in case it's already there
if (document.getElementById('dropdownmenu')) {
    initializeDropdown();
}