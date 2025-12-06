const produit_details_url = 'produit-details.html';

function handleRightFilter(selectedValue) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        switch(selectedValue) {
            case 'featured':
                // Your logic for featured items
                // card.style.display = card.dataset.featured ? 'flex' : 'none';
                break;
            case 'popular':
                // Your logic for popular items
                // card.style.display = card.dataset.popular ? 'flex' : 'none';
                break;
            case 'new':
                // Your logic for new arrivals
                // card.style.display = card.dataset.new ? 'flex' : 'none';
                break;
            default: // 'all'
                card.style.display = 'flex';
                break;
        }
    });
    
    // Update the title based on selection
    const titleElement = document.querySelector('.filtered-text-title');
    if (titleElement) {
        const titles = {
            'all': 'Tous Les Produits',
            'featured': 'Produits en Vedette',
            'popular': 'Produits Populaires', 
            'new': 'Nouveaux Produits'
        };
        titleElement.textContent = titles[selectedValue] || 'Tous Les Produits';
    }
}

// Get the correct elements for the filter dropdown
const filterBtn = document.getElementById('filterBtn');
const filterDropdownContent = document.querySelector('.filter-drp-content');
const filterDropdownLinks = document.querySelectorAll('.filter-drp-content a');

// Toggle filter dropdown when the button is clicked
filterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    filterDropdownContent.classList.toggle('show');
});

// Close filter dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.matches('.dropbtn') && !e.target.closest('.filter-drp-content')) {
        filterDropdownContent.classList.remove('show');
    }
});

// Handle filter option selection
filterDropdownLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the selected value and text
        const selectedValue = this.getAttribute('data-value');
        const selectedText = this.textContent;
        
        // Update dropdown button text with selected filter
        filterBtn.textContent = `${selectedText} ▼`;
        
        // Remove 'selected' class from all links
        filterDropdownLinks.forEach(link => link.classList.remove('selected'));
        
        // Add 'selected' class to clicked link
        this.classList.add('selected');
        
        // Close dropdown after selection
        filterDropdownContent.classList.remove('show');
        
        // Call your filter function
        handleRightFilter(selectedValue);
        
        // Optional: Save to localStorage
        localStorage.setItem('selectedFilter', selectedValue);
    });
});

// Load saved filter when page loads
document.addEventListener('DOMContentLoaded', function() {
    const savedFilter = localStorage.getItem('selectedFilter');
    if (savedFilter) {
        const correspondingLink = document.querySelector(`.filter-drp-content a[data-value="${savedFilter}"]`);
        if (correspondingLink) {
            const selectedText = correspondingLink.textContent;
            filterBtn.textContent = `${selectedText} ▼`;
            correspondingLink.classList.add('selected');
        }
    }
});

// Navigation dropdown functionality (separate from filter dropdown)
const moreBtn = document.getElementById('moreBtn');
const navDropdown = document.getElementById('dropdownmenu');

if (moreBtn && navDropdown) {
    moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navDropdown.classList.toggle('show');
    });

    // Close navigation dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.matches('#moreBtn') && !e.target.closest('.dropdown-content')) {
            navDropdown.classList.remove('show');
        }
    });
}

const productCard = document.querySelectorAll('.product-card');

productCard.forEach(card =>{
    card.addEventListener('click', () => {
        window.location.href = produit_details_url;
    })
})