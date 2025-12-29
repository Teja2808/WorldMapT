// Animation Controller for Airplane Route

class AnimationController {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.isAnimating = false;
        this.currentAnimation = null;
        this.statusElement = document.getElementById('animation-status');
        this.statusText = document.getElementById('status-text');
    }

    async startRouteAnimation() {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;
        const companies = window.locationData.companies;
        
        // Make route circular by adding first location at the end
        const circularRoute = [...companies, companies[0]];
        const routeCoordinates = circularRoute.map(c => c.coordinates);

        // Create airplane marker
        const airplaneElement = this.mapManager.createAirplaneMarker();

        // Fit map to show all company locations
        this.mapManager.fitBounds(companies.map(c => c.coordinates));

        // Wait for map animation to complete
        await this.wait(2000);

        // Track completed route segments
        const completedPath = [circularRoute[0].coordinates];

        // Animate through each company location (including return to start)
        for (let i = 0; i < circularRoute.length - 1; i++) {
            const currentLocation = circularRoute[i];
            const nextLocation = circularRoute[i + 1];

            // Show status
            const statusText = i === circularRoute.length - 2 
                ? `Returning to ${nextLocation.city}, ${nextLocation.country}`
                : `Flying to ${nextLocation.city}, ${nextLocation.country}`;
            this.showStatus(statusText);

            // Animate airplane and draw line progressively
            await this.animateAirplane(
                airplaneElement,
                currentLocation.coordinates,
                nextLocation.coordinates,
                completedPath,
                i
            );

            // Add completed segment to path
            completedPath.push(nextLocation.coordinates);
            
            // Update the permanent route line
            this.mapManager.updateRouteLine(completedPath);
            
            // Clear animated segment
            this.mapManager.clearAnimatedSegment();

            // Brief pause at destination
            await this.wait(800);
        }

        // Hide status
        this.hideStatus();

        // Show completion message
        setTimeout(() => {
            this.showStatus('Journey completed!');
            setTimeout(() => {
                this.hideStatus();
            }, 2000);
        }, 500);

        // Keep airplane at final position for a moment, then remove
        setTimeout(() => {
            if (this.mapManager.markers.airplane) {
                this.mapManager.markers.airplane.remove();
                this.mapManager.markers.airplane = null;
            }
            this.isAnimating = false;
        }, 3000);
    }

    async animateAirplane(element, start, end, completedPath, segmentIndex) {
        return new Promise((resolve) => {
            const duration = 3; // seconds
            const steps = 120;
            let currentStep = 0;

            // Calculate bearing for airplane rotation
            const bearing = this.calculateBearing(start, end);

            // GSAP animation
            const animation = gsap.to({}, {
                duration: duration,
                ease: "power1.inOut",
                onUpdate: () => {
                    currentStep++;
                    const progress = currentStep / steps;

                    // Interpolate position
                    const lng = start[0] + (end[0] - start[0]) * progress;
                    const lat = start[1] + (end[1] - start[1]) * progress;

                    // Update airplane position (Leaflet uses [lat, lng])
                    if (this.mapManager.markers.airplane) {
                        this.mapManager.markers.airplane.setLatLng([lat, lng]);

                        // Rotate airplane based on bearing with smooth transition
                        element.style.transform = `rotate(${bearing}deg)`;
                    }

                    // Draw animated segment from start to current position
                    this.mapManager.updateAnimatedSegment(start, [lng, lat]);

                    // Pan map to follow airplane smoothly in middle portion of journey
                    if (progress > 0.15 && progress < 0.85) {
                        this.mapManager.map.panTo([lat, lng], {
                            animate: true,
                            duration: 0.1,
                            noMoveStart: true
                        });
                    }
                },
                onComplete: () => {
                    resolve();
                }
            });

            this.currentAnimation = animation;
        });
    }

    calculateBearing(start, end) {
        const startLat = start[1] * Math.PI / 180;
        const startLng = start[0] * Math.PI / 180;
        const endLat = end[1] * Math.PI / 180;
        const endLng = end[0] * Math.PI / 180;

        const dLng = endLng - startLng;

        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                  Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;

        return bearing;
    }

    showStatus(text) {
        this.statusText.textContent = text;
        this.statusElement.classList.add('active');
    }

    hideStatus() {
        this.statusElement.classList.remove('active');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        if (this.currentAnimation) {
            this.currentAnimation.kill();
            this.currentAnimation = null;
        }
        this.hideStatus();
        this.isAnimating = false;
    }
}

// Export AnimationController
window.AnimationController = AnimationController;