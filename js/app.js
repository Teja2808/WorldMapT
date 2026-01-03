// Main Application Logic - Multi-View Native Selector Version

class App {
    constructor() {
        this.mapManager = null;
        this.animationController = null;
        this.loadingScreen = document.getElementById('loading-screen');
        this.legendPanel = document.getElementById('legend-panel');
        this.isLegendVisible = true;

        window.appInstance = this;
        this.init();
    }

    async init() {
        this.showLoading();
        
        // Load data from DB first
        await window.loadLocationData();
        
        // Ensure counts are updated after data is definitely loaded
        const updateHeaderCounts = () => {
            const officeEl = document.getElementById('header-office-count');
            const clientEl = document.getElementById('header-client-count');
            
            if (officeEl) officeEl.textContent = window.locationData.companies.length;
            if (clientEl) clientEl.textContent = window.locationData.clients.length;
        };

        // Try updating immediately and also after a short delay to be safe
        updateHeaderCounts();
        setTimeout(updateHeaderCounts, 500);

        await this.waitForResources();

        this.mapManager = new MapManager();
        this.mapManager.initialize();

        this.animationController = new AnimationController(this.mapManager);

        this.hideLoading();
        this.setupEventListeners();
        this.setupViewSelector();

        // Silent auto-resume fullscreen on first user interaction
        if (sessionStorage.getItem('shouldBeFullscreen') === 'true') {
            const silentResume = () => {
                if (sessionStorage.getItem('shouldBeFullscreen') === 'true') {
                    window.toggleFullscreen();
                    sessionStorage.removeItem('shouldBeFullscreen');
                }
                document.removeEventListener('click', silentResume);
                document.removeEventListener('keydown', silentResume);
            };
            document.addEventListener('click', silentResume);
            document.addEventListener('keydown', silentResume);
        }
    }

    setupViewSelector() {
        const select = document.getElementById('map-view-select');
        if (select) {
            select.addEventListener('change', (e) => {
                const view = e.target.value;
                if (view === 'globe') {
                    this.mapManager.toggleGlobe();
                } else {
                    this.mapManager.switchView(view);
                }
            });
        }
    }

    setupEventListeners() {
        const legendButton = document.getElementById('toggle-legend');
        if (legendButton) legendButton.addEventListener('click', () => this.toggleLegend());

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 't') this.animationController.triggerAnimation();
            if (e.key.toLowerCase() === 'l') this.toggleLegend();
        });
    }

    toggleLegend() {
        this.isLegendVisible = !this.isLegendVisible;
        this.legendPanel.classList.toggle('hidden', !this.isLegendVisible);
    }

    showLoading() { if (this.loadingScreen) this.loadingScreen.classList.remove('hidden'); }
    hideLoading() { setTimeout(() => { if (this.loadingScreen) this.loadingScreen.classList.add('hidden'); }, 500); }

    async waitForResources() {
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        if (document.fonts) await document.fonts.ready;
        await new Promise(r => setTimeout(r, 800));
    }
}

// GLOBAL HELPERS
window.closeInfoPanel = () => {
    const panel = document.getElementById('info-panel');
    if (!panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        // Always zoom out when panel is explicitly closed
        window.appInstance?.mapManager.goHome();
    }
};

window.goHome = () => {
    // Close panel first if open
    const panel = document.getElementById('info-panel');
    if (!panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
    }
    // Then zoom out
    window.appInstance?.mapManager.goHome();
};

window.reloadPage = () => {
    if (document.fullscreenElement) {
        sessionStorage.setItem('shouldBeFullscreen', 'true');
    }
    window.location.reload();
};

window.toggleFullscreen = () => {
    const el = document.getElementById('app');
    const icon = document.getElementById('fullscreen-icon');
    if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        if (icon) icon.className = 'ti ti-minimize';
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        if (icon) icon.className = 'ti ti-maximize';
    }
};

document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('fullscreen-icon');
    if (icon) icon.className = document.fullscreenElement ? 'ti ti-minimize' : 'ti ti-maximize';
});

window.toggleMarkers = (type, isVisible) => window.appInstance?.mapManager.toggleMarkers(type, isVisible);

new App();