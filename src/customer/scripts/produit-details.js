// produit-details.js - Enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    // Image Gallery Functionality
    const currentImage = document.getElementById('currentImage');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const sizeOptions = document.querySelectorAll('.size-option');
    const colorOptions = document.querySelectorAll('.color-option');
    
    let currentIndex = 0;
    const images = Array.from(thumbnails).map(thumb => thumb.getAttribute('data-image'));
    
    // Thumbnail click functionality
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            updateImage(index);
        });
    });
    
    // Navigation buttons
    leftBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage(currentIndex);
    });
    
    rightBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage(currentIndex);
    });
    
    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    function updateImage(index) {
        currentIndex = index;
        currentImage.src = images[currentIndex];
        
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
        currentImage.style.opacity = '0.7';
        setTimeout(() => {
            currentImage.style.opacity = '1';
        }, 150);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            leftBtn.click();
        } else if (e.key === 'ArrowRight') {
            rightBtn.click();
        }
    });

    const commanderBtn = document.querySelector('.btn-primary');
    commanderBtn.addEventListener('click',() => window.location.href='commande.html') // have to tweak this later to pass product info .
});