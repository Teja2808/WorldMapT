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
    image.style.transition = 'opacity 0.2s ease';

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

// Touch/Drag support for lightbox and popup sliders
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;

    if (touchEndX < touchStartX - 50) {
        // Swiped left - show next image
        nextImage();
    } else if (touchEndX > touchStartX + 50) {
        // Swiped right - show previous image
        prevImage();
    }
}

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

// Drag support for popup sliders
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.popup-slider')) {
        const slider = e.target.closest('.popup-slider');
        let isDown = true;
        let startX = e.pageX - slider.offsetLeft;
        let scrollLeft = slider.scrollLeft;

        slider.classList.add('active');

        const mousemove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1;
            slider.scrollLeft = scrollLeft - walk;
        };

        const mouseup = () => {
            isDown = false;
            slider.classList.remove('active');
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        };

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
});

// Export functions
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;