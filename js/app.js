// Main Application Logic

class App {
    constructor() {
        this.mapManager = null;
        this.animationController = null;
        this.loadingScreen = document.getElementById('loading-screen');
        this.legendPanel = document.getElementById('legend-panel');
        this.isLegendVisible = true;

        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoading();

        // Wait for fonts and resources to load
        await this.waitForResources();

        // Initialize map
        this.mapManager = new MapManager();
        this.mapManager.initialize();

        // Initialize animation controller
        this.animationController = new AnimationController(this.mapManager);

        // Hide loading screen
        this.hideLoading();

        // Setup event listeners
        this.setupEventListeners();

        // Start initial animation after map is ready
        setTimeout(() => {
            this.animationController.startRouteAnimation();
        }, 1500);
    }

    setupEventListeners() {
        // Replay animation button
        const replayButton = document.getElementById('replay-animation');
        replayButton.addEventListener('click', () => {
            this.animationController.stop();
            setTimeout(() => {
                this.animationController.startRouteAnimation();
            }, 500);
        });

        // Toggle legend button
        const legendButton = document.getElementById('toggle-legend');
        legendButton.addEventListener('click', () => {
            this.toggleLegend();
        });

        // Add keyboard shortcut for replay (R key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.animationController.stop();
                setTimeout(() => {
                    this.animationController.startRouteAnimation();
                }, 500);
            }
        });

        // Add keyboard shortcut for legend toggle (L key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'l' || e.key === 'L') {
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
        this.loadingScreen.classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
        }, 500);
    }

    async waitForResources() {
        // Wait for document to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Wait for fonts to load (if using web fonts)
        if (document.fonts) {
            await document.fonts.ready;
        }

        // Minimum loading time for smooth transition
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}