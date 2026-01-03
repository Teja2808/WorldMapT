// Map Initialization and Configuration using Leaflet.js - MongoDB Version (Hybrid Wrapping Version)

class MapManager {
    constructor() {
        this.map = null;
        this.markers = {
            companies: [],
            clients: []
        };
        this.baseLayers = {};
        this.currentLayer = null;
        this.previousLayer = null;
        this.rotationInterval = null;
        this.isRotating = false;
        this.worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
    }

    initialize() {
        // Initialize Leaflet map
        this.map = L.map('map', {
            minZoom: 1,
            maxZoom: 18,
            zoomControl: false,
            worldCopyJump: true,
            center: [35, 0],
            zoom: 3
        });

        const wrapOptions = {
            noWrap: false,
            continuousWorld: true
        };

        const singleWorldOptions = {
            noWrap: true,
            bounds: this.worldBounds
        };

        // Define Base Layers
        this.baseLayers = {
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                ...wrapOptions,
                attribution: '© CartoDB'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                ...wrapOptions,
                attribution: '© Esri'
            }),
            green: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
                ...wrapOptions,
                attribution: '© Esri'
            }),
            light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                ...wrapOptions,
                attribution: '© CartoDB'
            }),
            streets: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                ...wrapOptions,
                attribution: '© CartoDB'
            }),
            vector: L.layerGroup()
        };

        // Setup Vector Layer (Primary & Single)
        this.svgVectorLayer = L.geoJSON(null, {
            style: {
                color: '#4FA3C7', 
                weight: 1.5,
                opacity: 1,
                fillColor: '#0F1726', 
                fillOpacity: 1
            }
        });
        this.baseLayers.vector.addLayer(this.svgVectorLayer);
        this.labelLayer = L.layerGroup();
        this.baseLayers.vector.addLayer(this.labelLayer);
        this.loadSVGData();

        // Default to Vector (Primary)
        this.switchView('vector');

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        this.addMarkers();

        window.addEventListener('resize', () => this.map.invalidateSize());
        setTimeout(() => this.map.invalidateSize(), 100);
    }

    loadSVGData() {
        const cleanLightCountries = [
            "United States", "Canada", "Mexico", "Brazil", "Argentina", "United Kingdom",
            "France", "Germany", "Spain", "Italy", "Norway", "Sweden", "Russia",
            "China", "India", "Japan", "South Korea", "Australia", "New Zealand",
            "South Africa", "Egypt", "Saudi Arabia", "Turkey", "Kazakhstan",
            "Algeria", "Greenland", "Indonesia", "Thailand", "Iran", "Pakistan", "Libya", "Sudan", "Mali", "Nigeria", "Ethiopia"
        ];

        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
            .then(res => res.json())
            .then(data => {
                this.svgVectorLayer.clearLayers();
                this.labelLayer.clearLayers();
                this.svgVectorLayer.addData(data);
                this.svgVectorLayer.setStyle({
                    color: '#4FA3C7',
                    weight: 1.5,
                    opacity: 1,
                    fillColor: '#0F1726',
                    fillOpacity: 1
                });

                data.features.forEach(feature => {
                    const name = feature.properties.name;
                    if (cleanLightCountries.includes(name)) {
                        try {
                            const bounds = L.geoJSON(feature).getBounds();
                            const center = bounds.getCenter();
                            
                            const labelIcon = L.divIcon({
                                className: 'country-label',
                                html: `<span>${name}</span>`,
                                iconSize: [120, 20],
                                iconAnchor: [60, 10]
                            });

                            L.marker(center, { 
                                icon: labelIcon, 
                                interactive: false 
                            }).addTo(this.labelLayer);
                        } catch (e) {}
                    }
                });
            });
    }

    switchView(viewKey) {
        this.stopRotation();

        if (viewKey === 'rotate') {
            this.startRotation();
            return;
        }

        if (this.currentLayer) this.map.removeLayer(this.currentLayer);
        this.currentLayer = this.baseLayers[viewKey];
        this.currentLayer.addTo(this.map);
        
        if (viewKey === 'vector') {
            this.map.setMaxBounds(this.worldBounds);
        } else {
            this.map.setMaxBounds(null);
        }

        document.body.className = `map-theme-${viewKey}`;
        const app = document.getElementById('app');
        if (app) app.className = `app-container map-theme-${viewKey}`;
    }

    startRotation() {
        if (this.isRotating) return;
        this.isRotating = true;
        this.map.setView([20, 0], 2);
        
        let lng = 0;
        this.rotationInterval = setInterval(() => {
            lng = (lng + 0.2) % 360;
            const currentCenter = this.map.getCenter();
            this.map.panTo([currentCenter.lat, lng], { animate: false });
        }, 30);

        this.map.once('mousedown dragstart zoomstart', () => this.stopRotation());
    }

    stopRotation() {
        this.isRotating = false;
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    addMarkers() {
        console.log('Adding markers - companies:', window.locationData.companies.length, 'clients:', window.locationData.clients.length);
        window.locationData.companies.forEach(loc => this.addCompanyMarker(loc));
        window.locationData.clients.forEach(loc => this.addClientMarker(loc));
        console.log('All markers added');
    }

    addCompanyMarker(location) {
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker company pulse"><i class="ti ti-building"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        const marker = L.marker(L.latLng(location.coordinates[1], location.coordinates[0]), { icon }).addTo(this.map);

        const self = this;
        marker.on('click', async function() {
            // First, switch to satellite view if currently on vector map BEFORE flying
            if (self.currentLayer === self.baseLayers.vector) {
                self.previousLayer = self.baseLayers.vector;
                self.switchView('satellite');
                await new Promise(r => setTimeout(r, 200));
            }

            self.map.flyTo([location.coordinates[1], location.coordinates[0]], 18, { duration: 1.5 });
            self.map.once('moveend', async () => {
                const content = await self.createPopupContent(location, 'company');
                const pos = self.map.latLngToContainerPoint(marker.getLatLng());
                self.showInSidePanel(content, { clientX: pos.x, clientY: pos.y });
            });
        });
        this.markers.companies.push({ marker, location });
    }

    addClientMarker(location) {
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker client"><i class="ti ti-users"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        const marker = L.marker(L.latLng(location.coordinates[1], location.coordinates[0]), { icon }).addTo(this.map);

        const self = this;
        marker.on('click', async function() {
            // First, switch to satellite view if currently on vector map BEFORE flying
            if (self.currentLayer === self.baseLayers.vector) {
                self.previousLayer = self.baseLayers.vector;
                self.switchView('satellite');
                await new Promise(r => setTimeout(r, 200));
            }

            self.map.flyTo([location.coordinates[1], location.coordinates[0]], 18, { duration: 1.5 });
            self.map.once('moveend', async () => {
                const content = await self.createPopupContent(location, 'client');
                const pos = self.map.latLngToContainerPoint(marker.getLatLng());
                self.showInSidePanel(content, { clientX: pos.x, clientY: pos.y });
            });
        });
        this.markers.clients.push({ marker, location });
    }

    showInSidePanel(content, event) {
        const panel = document.getElementById('info-panel');
        const contentArea = document.getElementById('info-panel-content');
        contentArea.innerHTML = content;
        panel.scrollTop = 0;

        // Position panel on left side, spanning full height
        const left = 20;
        const top = 80;

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.maxHeight = `calc(100vh - ${top + 20}px)`;
        panel.classList.remove('hidden');
    }

    async createPopupContent(location, type) {
        const isCompany = type === 'company';
        const icon = isCompany ? 'ti-building' : 'ti-users';
        const iconClass = isCompany ? 'company' : 'client';
        let details = '';
        let relatedData = '';

        console.log('createPopupContent called for:', location.name, 'Type:', type, 'Images:', location.images);

        // Build basic details from location object
        if (isCompany) {
            details = `
                <div class="popup-info"><i class="ti ti-map-pin"></i><span>${location.city}, ${location.country}</span></div>
                ${location.employees ? `<div class="popup-info"><i class="ti ti-users"></i><span>${location.employees} employees</span></div>` : ''}
                ${location.established ? `<div class="popup-info"><i class="ti ti-calendar"></i><span>Est. ${location.established}</span></div>` : ''}
            `;
        } else {
            details = `
                <div class="popup-info"><i class="ti ti-map-pin"></i><span>${location.city}, ${location.country}</span></div>
                ${location.industry ? `<div class="popup-info"><i class="ti ti-briefcase"></i><span>${location.industry}</span></div>` : ''}
                ${location.partnership_since ? `<div class="popup-info"><i class="ti ti-calendar"></i><span>Partner since ${location.partnership_since}</span></div>` : ''}
            `;
        }

        // Try to fetch additional data asynchronously (won't block popup display)
        try {
            const response = await fetch(`http://localhost:3000/api/${isCompany ? 'offices' : 'clients'}/${location.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.visits?.length) {
                    if (isCompany) {
                        relatedData = `
                            <div class="popup-section-title"><i class="ti ti-calendar-event"></i> Recent Visits</div>
                            <div class="popup-visits-list">
                                ${data.visits.map(v => `
                                    <div class="visit-card">
                                        <div class="visit-header">
                                            <strong>${v.client?.name || 'Unknown'}</strong>
                                            <span class="visit-date">${new Date(v.visitDate).toLocaleDateString()}</span>
                                        </div>
                                        ${v.images?.length ? `
                                            <div class="popup-slider-container" data-images='${JSON.stringify(v.images)}'>
                                                <div class="popup-slider">
                                                    ${v.images.map((img, idx) => `<div class="popup-slider-item mini"><img src="${img}" style="cursor: pointer;" data-index="${idx}" class="popup-image"></div>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    } else {
                        relatedData = `
                            <div class="popup-section-title"><i class="ti ti-building"></i> Visited Offices</div>
                            <div class="popup-visits-list">
                                ${data.visits.map(v => `
                                    <div class="visit-card">
                                        <div class="visit-header">
                                            <strong>${v.office?.name || 'Unknown'}</strong>
                                            <span class="visit-date">${new Date(v.visitDate).toLocaleDateString()}</span>
                                        </div>
                                        ${v.images?.length ? `
                                            <div class="popup-slider-container" data-images='${JSON.stringify(v.images)}'>
                                                <div class="popup-slider">
                                                    ${v.images.map((img, idx) => `<div class="popup-slider-item mini"><img src="${img}" style="cursor: pointer;" data-index="${idx}" class="popup-image"></div>`).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }
                }
            }
        } catch (e) {
            console.log('Could not load additional visit data, showing basic popup');
        }

        const imagesHTML = location.images?.length ? `
            <div class="popup-slider-container main" data-images='${JSON.stringify(location.images)}'>
                <div class="popup-slider">
                    ${location.images.map((img, idx) => `<div class="popup-slider-item"><img src="${img}" style="cursor: pointer;" data-index="${idx}" class="popup-image"></div>`).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="popup-header">
                <div class="popup-icon ${iconClass}"><i class="ti ${icon}"></i></div>
                <div class="popup-title-section">
                    <div class="popup-title">${location.name}</div>
                    <div class="popup-type">${isCompany ? 'OFFICE' : 'CLIENT'}</div>
                </div>
            </div>
            <div class="popup-body">
                ${details}
                <div class="popup-divider"></div>
                <div class="popup-description-title">${location.name}</div>
                ${imagesHTML}
                ${relatedData}
            </div>
        `;
    }

    goHome() { this.stopRotation(); this.map.flyTo([35, 0], 3, { duration: 1.5 }); }
    resetMap() { this.stopRotation(); this.map.flyTo([35, 0], 3, { duration: 1.5 }); }

    restorePreviousLayer() {
        if (this.previousLayer && this.previousLayer === this.baseLayers.vector) {
            this.switchView('vector');
            this.previousLayer = null;
        }
    }

    toggleMarkers(type, isVisible) {
        const markerList = type === 'offices' ? this.markers.companies : this.markers.clients;
        markerList.forEach(item => isVisible ? item.marker.addTo(this.map) : this.map.removeLayer(item.marker));
    }
}

window.MapManager = MapManager;