// 3D Arc Animation Controller with Idle Detection and Infinite Loop

class AnimationController {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.isAnimating = false;
        this.idleTimer = null;
        this.idleDelay = 5000; // 15 seconds
        this.currentPhase = 'offices'; // 'offices' or 'clients'
        this.activeArcs = [];
        this.canvas = null;
        this.ctx = null;
        
        this.setupCanvas();
        this.setupIdleDetection();
    }

    setupCanvas() {
        const mapContainer = document.getElementById('map');
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'arc-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '400';
        mapContainer.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.mapManager.map.on('move moveend zoom zoomend', () => this.updateArcs());
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupIdleDetection() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetIdleTimer());
        });
        this.resetIdleTimer();
    }

    resetIdleTimer() {
        if (this.isAnimating) {
            this.stopAnimation();
        }
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        this.idleTimer = setTimeout(() => {
            this.startIdleAnimation();
        }, this.idleDelay);
    }

    async startIdleAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Close any open info panels (popups)
        if (window.closeInfoPanel) {
            window.closeInfoPanel();
        }

        // Reset map view to initial state before starting
        if (window.goHome) {
            window.goHome();
            await this.wait(1500); // Wait for smooth transition
        }
        
        while (this.isAnimating) {
            // Office Phase - Sorted by Country
            const officesEnabled = document.getElementById('filter-offices').checked;
            if (officesEnabled) {
                this.currentPhase = 'offices';
                const sortedOffices = [...window.locationData.companies].sort((a, b) => 
                    a.country.localeCompare(b.country) || a.city.localeCompare(b.city)
                );
                await this.animateLocations(sortedOffices, '#00D9FF');
                if (!this.isAnimating) break;
                this.activeArcs = [];
            }

            // Client Phase - Sorted by Country
            const clientsEnabled = document.getElementById('filter-clients').checked;
            if (clientsEnabled) {
                this.currentPhase = 'clients';
                const sortedClients = [...window.locationData.clients].sort((a, b) =>
                    a.country.localeCompare(b.country) || a.city.localeCompare(b.city)
                );
                await this.animateLocations(sortedClients, '#FF6B9D');
                if (!this.isAnimating) break;
                this.activeArcs = [];
            }

            // If both are disabled, just wait and loop
            if (!officesEnabled && !clientsEnabled) {
                await this.wait(2000);
            }
        }
    }

    async animateLocations(locations, color) {
        if (locations.length < 2) return;
        
        // Stop at the last location, don't loop back to start
        for (let i = 0; i < locations.length - 1; i++) {
            if (!this.isAnimating) break;
            
            const start = locations[i];
            const end = locations[i + 1];
            
            await this.draw3DArc(start.coordinates, end.coordinates, color);
            await this.wait(400); 
        }
        await this.wait(2500);
    }

    async draw3DArc(startCoords, endCoords, color) {
        return new Promise((resolve) => {
            // Leaflet uses [lat, lng]
            const startLatLng = L.latLng(startCoords[1], startCoords[0]);
            const endLatLng = L.latLng(endCoords[1], endCoords[0]);
            
            const arc = {
                start: startLatLng,
                end: endLatLng,
                color: color,
                progress: 0,
                duration: 1000
            };
            
            this.activeArcs.push(arc);
            
            const startTime = Date.now();
            const animate = () => {
                if (!this.isAnimating) return;
                
                const elapsed = Date.now() - startTime;
                arc.progress = Math.min(1, elapsed / arc.duration);
                
                if (arc.progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
                this.render();
            };
            requestAnimationFrame(animate);
        });
    }

    updateArcs() {
        if (this.isAnimating) this.render();
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.activeArcs.forEach(arc => {
            let startPoint = this.mapManager.map.latLngToContainerPoint(arc.start);
            let endPoint = this.mapManager.map.latLngToContainerPoint(arc.end);
            
            // Adjust points to start/end from the center of the markers
            // Since our markers are 40x40 with [20,20] anchor, we don't need heavy offset
            // But we ensure they are precisely calculated
            const midX = (startPoint.x + endPoint.x) / 2;
            const midY = (startPoint.y + endPoint.y) / 2;
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const height = dist * 0.4;
            const cpX = midX;
            const cpY = midY - height;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = arc.color;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = arc.color;
            
            this.ctx.moveTo(startPoint.x, startPoint.y);
            for (let i = 0; i <= arc.progress; i += 0.01) {
                const p = this.getBezierPoint(startPoint.x, startPoint.y, cpX, cpY, endPoint.x, endPoint.y, i);
                this.ctx.lineTo(p.x, p.y);
            }
            this.ctx.stroke();
            
            if (arc.progress > 0) {
                const tip = this.getBezierPoint(startPoint.x, startPoint.y, cpX, cpY, endPoint.x, endPoint.y, arc.progress);
                this.ctx.beginPath();
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    getBezierPoint(x0, y0, x1, y1, x2, y2, t) {
        return {
            x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2,
            y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2
        };
    }

    stopAnimation() {
        this.isAnimating = false;
        this.activeArcs = [];
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    triggerAnimation() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.startIdleAnimation();
    }
}

window.AnimationController = AnimationController;