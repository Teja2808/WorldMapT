// Main Application Logic - Updated for 3D Arcs

class App {
    constructor() {
        this.mapManager = null;
        this.animationController = null;
        this.loadingScreen = document.getElementById('loading-screen');
        this.legendPanel = document.getElementById('legend-panel');
        this.isLegendVisible = true;

        window.appInstance = this; // Store instance for global access
        this.init();
    }

    async init() {
        this.showLoading();

        // Load data from localStorage
        await window.loadLocationData();

        await this.waitForResources();

        // Initialize map
        this.mapManager = new MapManager();
        this.mapManager.initialize();

        // Initialize 3D arc animation controller
        this.animationController = new AnimationController(this.mapManager);

        this.hideLoading();
        this.setupEventListeners();
        
        console.log('App initialized. 3D Arcs will appear after 15s of idle time.');
    }

    setupEventListeners() {
        // Toggle legend button
        const legendButton = document.getElementById('toggle-legend');
        if (legendButton) {
            legendButton.addEventListener('click', () => {
                this.toggleLegend();
            });
        }

        // Manual trigger button
        const triggerButton = document.getElementById('trigger-animation');
        if (triggerButton) {
            triggerButton.addEventListener('click', () => {
                this.animationController.triggerAnimation();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 't') {
                this.animationController.triggerAnimation();
            }
            if (e.key.toLowerCase() === 'l') {
                this.toggleLegend();
            }
        });
    }

    toggleLegend() {
        this.isLegendVisible = !this.isLegendVisible;
        if (this.isLegendVisible) {
            this.legendPanel.classList.remove('hidden');
        } else {
            this.legendPanel.classList.add('hidden');
        }
    }

    showLoading() {
        if (this.loadingScreen) this.loadingScreen.classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
        }, 500);
    }

    async waitForResources() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        if (document.fonts) await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

// Global helper for closing panel
window.closeInfoPanel = () => {
    document.getElementById('info-panel').classList.add('hidden');
};

// Map Control Helpers
window.goHome = () => {
    if (window.appInstance && window.appInstance.mapManager) {
        window.appInstance.mapManager.goHome();
    }
};

window.reloadPage = () => {
    window.location.reload();
};

window.toggleFullscreen = () => {
    const mapElement = document.getElementById('map');
    if (!document.fullscreenElement) {
        mapElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
};

window.toggleMarkers = (type, isVisible) => {
    if (window.appInstance && window.appInstance.mapManager) {
        window.appInstance.mapManager.toggleMarkers(type, isVisible);
    }
};

// Start app
new App();