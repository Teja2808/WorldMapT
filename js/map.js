// Map Initialization and Configuration using Leaflet.js - MongoDB Version (Port 3000)

class MapManager {
    constructor() {
        this.map = null;
        this.markers = {
            companies: [],
            clients: []
        };
    }

    initialize() {
        // Initialize Leaflet map with world boundaries
        this.map = L.map('map', {
            minZoom: 1,
            maxZoom: 18,
            zoomControl: false,
            worldCopyJump: true,
            center: [35, 0], // Centered on major landmasses
            zoom: 3 // Higher zoom to fill the screen better
        });

        // Add SVG World Map Layer
        this.addSVGWorldMap();

        // Add zoom control to bottom right
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Add markers
        this.addMarkers();

        // Ensure map resizes with window
        window.addEventListener('resize', () => {
            this.map.invalidateSize();
        });
        
        // Ensure map fills available space
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    addSVGWorldMap() {
        // Add GeoJSON world map with custom styling
        fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: '#00D9FF',
                        weight: 1,
                        opacity: 0.4,
                        fillColor: '#1E2433',
                        fillOpacity: 0.6
                    },
                    interactive: false
                }).addTo(this.map);
            })
            .catch(error => {
                console.log('Using fallback map rendering');
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CartoDB',
                    subdomains: 'abcd',
                    maxZoom: 19,
                    noWrap: true
                }).addTo(this.map);
            });
    }

    addMarkers() {
        // Add company markers from locationData
        window.locationData.companies.forEach((location) => {
            this.addCompanyMarker(location);
        });

        // Add client markers from locationData
        window.locationData.clients.forEach((location) => {
            this.addClientMarker(location);
        });
    }

    async addCompanyMarker(location) {
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker company pulse"><i class="ti ti-building"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const latlng = L.latLng(location.coordinates[1], location.coordinates[0]);
        const marker = L.marker(latlng, { icon: icon }).addTo(this.map);

        marker.on('click', async (e) => {
            const content = await this.createPopupContent(location, 'company');
            this.showInSidePanel(content, e.originalEvent);
        });

        this.markers.companies.push({ marker, location });
    }

    async addClientMarker(location) {
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker client"><i class="ti ti-users"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const latlng = L.latLng(location.coordinates[1], location.coordinates[0]);
        const marker = L.marker(latlng, { icon: icon }).addTo(this.map);

        marker.on('click', async (e) => {
            const content = await this.createPopupContent(location, 'client');
            this.showInSidePanel(content, e.originalEvent);
        });

        this.markers.clients.push({ marker, location });
    }

    showInSidePanel(content, event) {
        const panel = document.getElementById('info-panel');
        const contentArea = document.getElementById('info-panel-content');
        contentArea.innerHTML = content;
        
        // Reset scroll position to top
        panel.scrollTop = 0;
        
        // Position panel next to click
        const x = event.clientX;
        const y = event.clientY;
        
        // Position panel to the LEFT of the location by default
        let left = x - 410; 
        let top = y - 100;
        
        // If marker is on the left side of the screen, flip panel to the RIGHT
        if (x < 450) {
            left = x + 30;
        }

        // Vertical screen boundary safety
        if (top + 500 > window.innerHeight) top = window.innerHeight - 520;
        if (top < 20) top = 20;

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        
        panel.classList.remove('hidden');
    }

    async createPopupContent(location, type) {
        const isCompany = type === 'company';
        const icon = isCompany ? 'ti-building' : 'ti-users';
        const iconClass = isCompany ? 'company' : 'client';

        let details = '';
        let relatedData = '';
        
        try {
            const API_URL = `http://localhost:3000/api/${isCompany ? 'offices' : 'clients'}/${location.id}`;
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (isCompany) {
                details = `
                    ${location.employees ? `<div class="popup-info"><i class="ti ti-users"></i><span>${location.employees} employees</span></div>` : ''}
                    ${location.established ? `<div class="popup-info"><i class="ti ti-calendar"></i><span>Est. ${location.established}</span></div>` : ''}
                `;
                
                if (data.visits && data.visits.length > 0) {
                    relatedData = `
                        <div class="popup-visits">
                            <h4><i class="ti ti-calendar-event"></i> Recent Client Visits</h4>
                            ${data.visits.slice(0, 3).map(v => `
                                <div class="visit-group">
                                    <div class="visit-item">
                                        <strong>${v.client?.name || 'Unknown'}</strong>
                                        <span>${new Date(v.visitDate).toLocaleDateString()}</span>
                                    </div>
                                    ${v.images && v.images.length > 0 ? `
                                        <div class="popup-slider-container">
                                            <div class="popup-slider">
                                                ${v.images.map((img, idx) => `
                                                    <div class="popup-slider-item">
                                                        <img src="${img}" alt="Visit photo" onclick="openLightbox(${JSON.stringify(v.images).replace(/"/g, '&quot;')}, ${idx}); event.stopPropagation();">
                                                    </div>
                                                `).join('')}
                                            </div>
                                            ${v.images.length > 1 ? '<div class="slider-hint"><i class="ti ti-arrows-left-right"></i> Scroll for more</div>' : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            } else {
                details = `
                    ${location.industry ? `<div class="popup-info"><i class="ti ti-briefcase"></i><span>${location.industry}</span></div>` : ''}
                    ${location.partnership_since ? `<div class="popup-info"><i class="ti ti-calendar"></i><span>Partner since ${location.partnership_since}</span></div>` : ''}
                `;
                
                if (data.visits && data.visits.length > 0) {
                    relatedData = `
                        <div class="popup-visits">
                            <h4><i class="ti ti-building"></i> Visited Offices</h4>
                            ${data.visits.slice(0, 3).map(v => `
                                <div class="visit-group">
                                    <div class="visit-item">
                                        <strong>${v.office?.name || 'Unknown'}</strong>
                                        <span>${new Date(v.visitDate).toLocaleDateString()}</span>
                                    </div>
                                    ${v.images && v.images.length > 0 ? `
                                        <div class="popup-slider-container">
                                            <div class="popup-slider">
                                                ${v.images.map((img, idx) => `
                                                    <div class="popup-slider-item">
                                                        <img src="${img}" alt="Visit photo" onclick="openLightbox(${JSON.stringify(v.images).replace(/"/g, '&quot;')}, ${idx}); event.stopPropagation();">
                                                    </div>
                                                `).join('')}
                                            </div>
                                            ${v.images.length > 1 ? '<div class="slider-hint"><i class="ti ti-arrows-left-right"></i> Scroll for more</div>' : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error fetching API data:', error);
        }

        const imagesHTML = location.images && location.images.length > 0 ? `
            <div class="popup-slider-container">
                <div class="popup-slider">
                    ${location.images.map((img, index) => `
                        <div class="popup-slider-item">
                            <img src="${img}" alt="${location.name}" onclick="openLightbox(${JSON.stringify(location.images).replace(/"/g, '&quot;')}, ${index})">
                        </div>
                    `).join('')}
                </div>
                ${location.images.length > 1 ? '<div class="slider-hint"><i class="ti ti-arrows-left-right"></i> Scroll for more</div>' : ''}
            </div>
        ` : '';

        return `
            <div class="popup-header">
                <div class="popup-icon ${iconClass}"><i class="ti ${icon}"></i></div>
                <div class="popup-title-section">
                    <div class="popup-title">${location.name}</div>
                    <div class="popup-type">${isCompany ? 'Company Office' : 'Client Location'}</div>
                </div>
            </div>
            <div class="popup-body">
                <div class="popup-info"><i class="ti ti-map-pin"></i><span>${location.city}, ${location.country}</span></div>
                ${details}
                ${location.description ? `<div class="popup-description">${location.description}</div>` : ''}
                ${imagesHTML}
                ${relatedData}
            </div>
        `;
    }

    fitBounds(coordinates) {
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        const bounds = L.latLngBounds(latLngs);
        this.map.fitBounds(bounds, {
            padding: [100, 100],
            maxZoom: 5,
            animate: true,
            duration: 2
        });
    }

    goHome() {
        this.map.setView([35, 0], 3, { animate: true });
    }

    resetMap() {
        this.map.setView([35, 0], 3, { animate: true });
    }

    toggleMarkers(type, isVisible) {
        const markerList = type === 'offices' ? this.markers.companies : this.markers.clients;
        markerList.forEach(item => {
            if (isVisible) {
                item.marker.addTo(this.map);
            } else {
                this.map.removeLayer(item.marker);
            }
        });
    }
}

window.MapManager = MapManager;