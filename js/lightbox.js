// Image Lightbox/Slider

let currentImages = [];
let currentImageIndex = 0;

function openLightbox(images, startIndex = 0) {
    currentImages = images;
    currentImageIndex = startIndex;
    
    const modal = document.getElementById('lightbox-modal');
    const image = document.getElementById('lightbox-image');
    const current = document.getElementById('lightbox-current');
    const total = document.getElementById('lightbox-total');
    
    modal.classList.add('active');
    image.src = currentImages[currentImageIndex];
    current.textContent = currentImageIndex + 1;
    total.textContent = currentImages.length;
    
    // Hide/show navigation buttons
    updateNavigationButtons();
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal.classList.remove('active');
}

function nextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        updateLightboxImage();
    }
}

function prevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateLightboxImage();
    }
}

function updateLightboxImage() {
    const image = document.getElementById('lightbox-image');
    const current = document.getElementById('lightbox-current');
    
    // Fade out
    image.style.opacity = '0';
    
    setTimeout(() => {
        image.src = currentImages[currentImageIndex];
        current.textContent = currentImageIndex + 1;
        updateNavigationButtons();
        
        // Fade in
        image.style.opacity = '1';
    }, 200);
}

function updateNavigationButtons() {
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (currentImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        prevBtn.style.opacity = currentImageIndex === 0 ? '0.3' : '1';
        prevBtn.style.cursor = currentImageIndex === 0 ? 'not-allowed' : 'pointer';
        
        nextBtn.style.opacity = currentImageIndex === currentImages.length - 1 ? '0.3' : '1';
        nextBtn.style.cursor = currentImageIndex === currentImages.length - 1 ? 'not-allowed' : 'pointer';
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

// Click outside to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (e.target === modal) {
        closeLightbox();
    }
});

// Export functions
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;