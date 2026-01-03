// Image Lightbox/Slider

let currentImages = [];
let currentImageIndex = 0;

// Split View Mode Variables
let isSplitViewActive = false;
let splitViewImages = [];
let splitViewIndex = 0;

function openSplitView(images, startIndex = 0) {
    isSplitViewActive = true;
    splitViewImages = images;
    splitViewIndex = startIndex;

    const panel = document.getElementById('info-panel');
    const viewer = document.getElementById('image-viewer-panel');
    const image = document.getElementById('viewer-image');
    const current = document.getElementById('viewer-current');
    const total = document.getElementById('viewer-total');
    const popupSlider = document.getElementById('viewer-popup-input');

    // Add split-mode class to info panel
    panel.classList.add('split-mode');

    // Display image viewer panel
    viewer.classList.add('active');
    image.src = splitViewImages[splitViewIndex];
    current.textContent = splitViewIndex + 1;
    total.textContent = splitViewImages.length;

    // Update popup slider
    if (popupSlider) {
        popupSlider.max = Math.max(0, splitViewImages.length - 1);
        popupSlider.value = splitViewIndex;
        updatePopupSliderPosition();
    }

    // Update button states
    updateSplitViewNavigationButtons();
}

function closeSplitView() {
    isSplitViewActive = false;

    const panel = document.getElementById('info-panel');
    const viewer = document.getElementById('image-viewer-panel');

    // Remove split-mode class from info panel
    panel.classList.remove('split-mode');

    // Hide image viewer panel
    viewer.classList.remove('active');

    // Reset state
    splitViewImages = [];
    splitViewIndex = 0;
}

function nextSplitImage() {
    if (splitViewIndex < splitViewImages.length - 1) {
        splitViewIndex++;
        updateSplitViewImage();
    }
}

function prevSplitImage() {
    if (splitViewIndex > 0) {
        splitViewIndex--;
        updateSplitViewImage();
    }
}

function updateSplitViewImage() {
    const image = document.getElementById('viewer-image');
    const current = document.getElementById('viewer-current');

    // Fade out
    image.style.opacity = '0';
    image.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
        image.src = splitViewImages[splitViewIndex];
        current.textContent = splitViewIndex + 1;
        updateSplitViewNavigationButtons();
        updatePopupSliderPosition();

        // Fade in
        image.style.opacity = '1';
    }, 200);
}

function updateSplitViewNavigationButtons() {
    const prevBtn = document.querySelector('.viewer-prev');
    const nextBtn = document.querySelector('.viewer-next');

    if (splitViewImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';

        const isFirstImage = splitViewIndex === 0;
        const isLastImage = splitViewIndex === splitViewImages.length - 1;

        prevBtn.disabled = isFirstImage;
        prevBtn.style.opacity = isFirstImage ? '0.3' : '1';
        prevBtn.style.cursor = isFirstImage ? 'not-allowed' : 'pointer';
        prevBtn.style.pointerEvents = isFirstImage ? 'none' : 'auto';

        nextBtn.disabled = isLastImage;
        nextBtn.style.opacity = isLastImage ? '0.3' : '1';
        nextBtn.style.cursor = isLastImage ? 'not-allowed' : 'pointer';
        nextBtn.style.pointerEvents = isLastImage ? 'none' : 'auto';
    }
}

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

        const isFirstImage = currentImageIndex === 0;
        const isLastImage = currentImageIndex === currentImages.length - 1;

        prevBtn.style.opacity = isFirstImage ? '0.3' : '1';
        prevBtn.style.cursor = isFirstImage ? 'not-allowed' : 'pointer';
        prevBtn.style.pointerEvents = isFirstImage ? 'none' : 'auto';

        nextBtn.style.opacity = isLastImage ? '0.3' : '1';
        nextBtn.style.cursor = isLastImage ? 'not-allowed' : 'pointer';
        nextBtn.style.pointerEvents = isLastImage ? 'none' : 'auto';
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    const viewer = document.getElementById('image-viewer-panel');

    // Handle lightbox keyboard navigation
    if (modal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    }

    // Handle split view keyboard navigation
    if (viewer.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeSplitView();
        } else if (e.key === 'ArrowLeft') {
            prevSplitImage();
        } else if (e.key === 'ArrowRight') {
            nextSplitImage();
        }
    }
});

// Click outside to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (e.target === modal) {
        closeLightbox();
    }

    // Handle popup image clicks
    if (e.target.classList.contains('popup-image')) {
        const container = e.target.closest('[data-images]');
        if (container) {
            const images = JSON.parse(container.getAttribute('data-images'));
            const index = parseInt(e.target.getAttribute('data-index'), 10);

            // Check if click is from within the info panel
            const isFromInfoPanel = e.target.closest('#info-panel') !== null;

            if (isFromInfoPanel) {
                // Open split view if clicked from popup
                openSplitView(images, index);
            } else {
                // Open full-screen lightbox otherwise
                openLightbox(images, index);
            }
            e.stopPropagation();
        }
    }
});

// Touch/Drag support for lightbox and popup sliders
let touchStartX = 0;
let touchEndX = 0;
let touchStartTime = 0;

function handleSwipe() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;

    const swipeThreshold = 30; // Minimum swipe distance in pixels
    const timeTolerance = 300; // Maximum time for a swipe in milliseconds
    const distance = Math.abs(touchEndX - touchStartX);
    const time = Date.now() - touchStartTime;

    // Only register as swipe if distance is large enough and time is quick enough
    if (distance > swipeThreshold && time < timeTolerance) {
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left - show next image
            nextImage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right - show previous image
            prevImage();
        }
    }
}

document.addEventListener('touchstart', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;

    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = Date.now();
}, false);

document.addEventListener('touchend', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (!modal.classList.contains('active')) return;

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

function updateSplitViewFromSlider(value) {
    splitViewIndex = parseInt(value, 10);
    updateSplitViewImage();
}

function updatePopupSliderPosition() {
    const popupSlider = document.getElementById('viewer-popup-input');
    if (popupSlider) {
        popupSlider.value = splitViewIndex;
        const percentage = splitViewImages.length > 1 ? (splitViewIndex / (splitViewImages.length - 1)) * 100 : 0;
        popupSlider.style.setProperty('--slider-percentage', percentage + '%');
    }
}

// Swipe/Drag support for split view image viewer
let splitViewTouchStartX = 0;
let splitViewTouchEndX = 0;
let splitViewTouchStartTime = 0;
let splitViewDragStartX = 0;
let splitViewIsDragging = false;

function handleSplitViewSwipe() {
    const swipeThreshold = 30; // Minimum swipe distance in pixels
    const timeTolerance = 300; // Maximum time for a swipe in milliseconds
    const distance = Math.abs(splitViewTouchEndX - splitViewTouchStartX);
    const time = Date.now() - splitViewTouchStartTime;

    // Only register as swipe if distance is large enough and time is quick enough
    if (distance > swipeThreshold && time < timeTolerance) {
        if (splitViewTouchEndX < splitViewTouchStartX - swipeThreshold) {
            // Swiped left - show next image
            nextSplitImage();
        } else if (splitViewTouchEndX > splitViewTouchStartX + swipeThreshold) {
            // Swiped right - show previous image
            prevSplitImage();
        }
    }
}

// Setup swipe listeners for split view
document.addEventListener('touchstart', (e) => {
    const container = document.getElementById('viewer-image-container');
    if (!container || !container.closest('#image-viewer-panel')) return;

    splitViewTouchStartX = e.changedTouches[0].screenX;
    splitViewTouchStartTime = Date.now();
}, false);

document.addEventListener('touchend', (e) => {
    const container = document.getElementById('viewer-image-container');
    if (!container || !container.closest('#image-viewer-panel')) return;

    splitViewTouchEndX = e.changedTouches[0].screenX;
    handleSplitViewSwipe();
}, false);

// Drag support for split view
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#viewer-image-container')) return;

    splitViewIsDragging = true;
    splitViewDragStartX = e.pageX;

    const mousemove = () => {
        if (!splitViewIsDragging) return;
        // Could add visual feedback here
    };

    const mouseup = (e) => {
        if (!splitViewIsDragging) return;
        splitViewIsDragging = false;

        const dragDistance = e.pageX - splitViewDragStartX;
        const dragThreshold = 50;

        if (dragDistance > dragThreshold) {
            // Dragged right - show previous
            prevSplitImage();
        } else if (dragDistance < -dragThreshold) {
            // Dragged left - show next
            nextSplitImage();
        }

        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
});

// Popup slider visibility control
let popupSliderHideTimeout;

document.addEventListener('mousemove', () => {
    const viewer = document.getElementById('image-viewer-panel');
    const popupSlider = document.getElementById('viewer-popup-slider');

    if (!viewer || !viewer.classList.contains('active')) return;

    // Show popup slider on mouse move
    popupSlider.classList.add('visible');

    // Clear existing timeout
    clearTimeout(popupSliderHideTimeout);

    // Hide after 3 seconds of inactivity
    popupSliderHideTimeout = setTimeout(() => {
        popupSlider.classList.remove('visible');
    }, 3000);
});

// Keep slider visible when hovering over it
document.addEventListener('mouseenter', (e) => {
    if (e.target.closest('.viewer-popup-slider')) {
        clearTimeout(popupSliderHideTimeout);
    }
}, true);

// Export functions
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;
window.openSplitView = openSplitView;
window.closeSplitView = closeSplitView;
window.nextSplitImage = nextSplitImage;
window.prevSplitImage = prevSplitImage;
window.updateSplitViewFromSlider = updateSplitViewFromSlider;