// Location Data - Loaded from MongoDB API
const API_BASE = 'http://localhost:3000/api';

window.locationData = {
    companies: [],
    clients: []
};

// Load data from API
async function loadLocationData() {
    try {
        console.log('Fetching data from MongoDB API on port 3000...');
        
        // Load offices
        const officesResponse = await fetch(`${API_BASE}/offices`);
        const offices = await officesResponse.json();
        
        // Load clients
        const clientsResponse = await fetch(`${API_BASE}/clients`);
        const clients = await clientsResponse.json();
        
        // Transform to expected format
        window.locationData.companies = offices.map(office => ({
            id: office._id,
            name: office.name,
            city: office.city,
            country: office.country,
            coordinates: office.coordinates,
            description: office.description,
            employees: office.employees,
            established: office.established,
            images: office.images || []
        }));
        
        window.locationData.clients = clients.map(client => ({
            id: client._id,
            name: client.name,
            city: client.city,
            country: client.country,
            coordinates: client.coordinates,
            description: client.description,
            industry: client.industry,
            partnership_since: client.partnershipSince,
            images: client.images || []
        }));
        
        console.log('Data loaded successfully from MongoDB');
        return true;
    } catch (error) {
        console.error('Error loading location data from API:', error);
        return false;
    }
}

window.loadLocationData = loadLocationData;