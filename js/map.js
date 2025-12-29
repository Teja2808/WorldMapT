// Map Initialization and Configuration using Leaflet.js

class MapManager {
    constructor() {
        this.map = null;
        this.markers = {
            companies: [],
            clients: [],
            airplane: null
        };
        this.routeLine = null;
        this.routePolyline = null;
    }

    initialize() {
        // Initialize Leaflet map with world boundaries
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 5,
            zoomControl: false,
            maxBounds: [[-85, -180], [85, 180]],
            maxBoundsViscosity: 1.0,
            worldCopyJump: false,
            noWrap: true
        });

        // Add SVG World Map
        const svgLayer = L.svg();
        svgLayer.addTo(this.map);
        
        // Add dark background
        const darkBg = L.rectangle([[-90, -180], [90, 180]], {
            color: 'transparent',
            fillColor: '#0A0E1A',
            fillOpacity: 1,
            interactive: false
        }).addTo(this.map);

        // Load and add SVG world map
        this.addSVGWorldMap();

        // Add zoom control to bottom right
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Setup route polyline (initially empty, will be drawn progressively)
        this.routePolyline = L.polyline([], {
            color: '#00D9FF',
            weight: 3,
            opacity: 0.9,
            smoothFactor: 1,
            className: 'route-line-glow'
        }).addTo(this.map);
        
        // Create a separate layer for the animated segment
        this.animatedSegment = L.polyline([], {
            color: '#7B61FF',
            weight: 4,
            opacity: 1,
            smoothFactor: 1,
            className: 'route-line-animated'
        }).addTo(this.map);

        // Add markers after a short delay
        setTimeout(() => {
            this.addMarkers();
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
                // Fallback to tile layer if GeoJSON fails
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CartoDB',
                    subdomains: 'abcd',
                    maxZoom: 19,
                    noWrap: true
                }).addTo(this.map);
            });
    }

    addMarkers() {
        // Add company markers
        window.locationData.companies.forEach((location) => {
            this.addCompanyMarker(location);
        });

        // Add client markers
        window.locationData.clients.forEach((location) => {
            this.addClientMarker(location);
        });
    }

    addCompanyMarker(location) {
        // Create custom marker icon
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker company pulse"><i class="ti ti-building"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        // Create popup content
        const popupContent = this.createPopupContent(location, 'company');

        // Create marker
        const marker = L.marker([location.coordinates[1], location.coordinates[0]], {
            icon: icon
        })
        .bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup'
        })
        .addTo(this.map);

        this.markers.companies.push({ marker, location });
    }

    addClientMarker(location) {
        // Create custom marker icon
        const icon = L.divIcon({
            className: 'custom-marker-container',
            html: '<div class="custom-marker client"><i class="ti ti-users"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        // Create popup content
        const popupContent = this.createPopupContent(location, 'client');

        // Create marker
        const marker = L.marker([location.coordinates[1], location.coordinates[0]], {
            icon: icon
        })
        .bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup'
        })
        .addTo(this.map);

        this.markers.clients.push({ marker, location });
    }

    createPopupContent(location, type) {
        const isCompany = type === 'company';
        const icon = isCompany ? 'ti-building' : 'ti-users';
        const iconClass = isCompany ? 'company' : 'client';

        let details = '';
        if (isCompany) {
            details = `
                <div class="popup-info">
                    <i class="ti ti-users"></i>
                    <span>${location.employees} employees</span>
                </div>
                <div class="popup-info">
                    <i class="ti ti-calendar"></i>
                    <span>Established ${location.established}</span>
                </div>
            `;
        } else {
            details = `
                <div class="popup-info">
                    <i class="ti ti-briefcase"></i>
                    <span>${location.industry}</span>
                </div>
                <div class="popup-info">
                    <i class="ti ti-calendar"></i>
                    <span>Partner since ${location.partnership_since}</span>
                </div>
            `;
        }

        return `
            <div class="popup-header">
                <div class="popup-icon ${iconClass}">
                    <i class="ti ${icon}"></i>
                </div>
                <div class="popup-title-section">
                    <div class="popup-title">${location.name}</div>
                    <div class="popup-type">${isCompany ? 'Company Office' : 'Client Location'}</div>
                </div>
            </div>
            <div class="popup-body">
                <div class="popup-info">
                    <i class="ti ti-map-pin"></i>
                    <span>${location.city}, ${location.country}</span>
                </div>
                ${details}
                <div class="popup-description">
                    ${location.description}
                </div>
            </div>
        `;
    }

    createAirplaneMarker() {
        const icon = L.divIcon({
            className: 'airplane-marker-container',
            html: '<div class="airplane-marker"><i class="ti ti-plane-inflight"></i></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        this.markers.airplane = L.marker(
            [window.locationData.companies[0].coordinates[1], window.locationData.companies[0].coordinates[0]],
            { icon: icon }
        ).addTo(this.map);

        return this.markers.airplane.getElement().querySelector('.airplane-marker');
    }

    updateRouteLine(coordinates) {
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        this.routePolyline.setLatLngs(latLngs);
    }
    
    updateAnimatedSegment(start, current) {
        // Update the animated segment between start and current position
        this.animatedSegment.setLatLngs([[start[1], start[0]], [current[1], current[0]]]);
    }
    
    clearAnimatedSegment() {
        this.animatedSegment.setLatLngs([]);
    }

    fitBounds(coordinates) {
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        const bounds = L.latLngBounds(latLngs);
        
        this.map.fitBounds(bounds, {
            padding: [100, 100],
            maxZoom: 5,
            animate: true,
            duration: 2
        });
    }
}

// Export MapManager
window.MapManager = MapManager;