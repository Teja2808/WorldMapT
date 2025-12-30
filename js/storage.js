// LocalStorage Data Manager (replaces backend API)

class StorageManager {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize with sample data if empty
        if (!localStorage.getItem('offices')) {
            const sampleOffices = [
                {
                    id: 'office-1',
                    name: 'Headquarters',
                    city: 'San Francisco',
                    country: 'USA',
                    coordinates: [-122.4194, 37.7749],
                    description: 'Our global headquarters and innovation center',
                    employees: 1200,
                    established: 2015,
                    images: []
                },
                {
                    id: 'office-2',
                    name: 'European Hub',
                    city: 'London',
                    country: 'United Kingdom',
                    coordinates: [-0.1276, 51.5074],
                    description: 'European operations center',
                    employees: 450,
                    established: 2017,
                    images: []
                },
                {
                    id: 'office-3',
                    name: 'Asia Pacific Office',
                    city: 'Singapore',
                    country: 'Singapore',
                    coordinates: [103.8198, 1.3521],
                    description: 'Strategic hub for Asia-Pacific',
                    employees: 380,
                    established: 2018,
                    images: []
                }
            ];
            localStorage.setItem('offices', JSON.stringify(sampleOffices));
        }

        if (!localStorage.getItem('clients')) {
            const sampleClients = [
                {
                    id: 'client-1',
                    name: 'TechCorp Global',
                    city: 'New York',
                    country: 'USA',
                    coordinates: [-74.0060, 40.7128],
                    description: 'Enterprise software solutions',
                    industry: 'Technology',
                    partnershipSince: 2016,
                    images: []
                },
                {
                    id: 'client-2',
                    name: 'FinanceFirst Ltd',
                    city: 'Frankfurt',
                    country: 'Germany',
                    coordinates: [8.6821, 50.1109],
                    description: 'Financial services platform',
                    industry: 'Finance',
                    partnershipSince: 2017,
                    images: []
                }
            ];
            localStorage.setItem('clients', JSON.stringify(sampleClients));
        }

        if (!localStorage.getItem('visits')) {
            const sampleVisits = [
                {
                    id: 'visit-1',
                    officeId: 'office-1',
                    clientId: 'client-1',
                    visitDate: '2024-01-15',
                    purpose: 'Quarterly Business Review',
                    notes: 'Discussed expansion plans',
                    attendees: ['John Smith', 'Jane Doe']
                }
            ];
            localStorage.setItem('visits', JSON.stringify(sampleVisits));
        }
    }

    // Offices
    getOffices() {
        return JSON.parse(localStorage.getItem('offices') || '[]');
    }

    getOffice(id) {
        const offices = this.getOffices();
        const office = offices.find(o => o.id === id);
        if (!office) return null;

        // Get visits for this office
        const visits = this.getVisits().filter(v => v.officeId === id);
        const clients = this.getClients();
        
        return {
            office,
            visits: visits.map(v => ({
                ...v,
                client: clients.find(c => c.id === v.clientId)
            }))
        };
    }

    saveOffice(office) {
        const offices = this.getOffices();
        if (office.id) {
            // Update
            const index = offices.findIndex(o => o.id === office.id);
            if (index !== -1) {
                offices[index] = office;
            }
        } else {
            // Create
            office.id = 'office-' + Date.now();
            offices.push(office);
        }
        localStorage.setItem('offices', JSON.stringify(offices));
        return office;
    }

    deleteOffice(id) {
        let offices = this.getOffices();
        offices = offices.filter(o => o.id !== id);
        localStorage.setItem('offices', JSON.stringify(offices));
        
        // Also delete related visits
        let visits = this.getVisits();
        visits = visits.filter(v => v.officeId !== id);
        localStorage.setItem('visits', JSON.stringify(visits));
    }

    // Clients
    getClients() {
        return JSON.parse(localStorage.getItem('clients') || '[]');
    }

    getClient(id) {
        const clients = this.getClients();
        const client = clients.find(c => c.id === id);
        if (!client) return null;

        // Get visits for this client
        const visits = this.getVisits().filter(v => v.clientId === id);
        const offices = this.getOffices();
        
        return {
            client,
            visits: visits.map(v => ({
                ...v,
                office: offices.find(o => o.id === v.officeId)
            }))
        };
    }

    saveClient(client) {
        const clients = this.getClients();
        if (client.id) {
            // Update
            const index = clients.findIndex(c => c.id === client.id);
            if (index !== -1) {
                clients[index] = client;
            }
        } else {
            // Create
            client.id = 'client-' + Date.now();
            clients.push(client);
        }
        localStorage.setItem('clients', JSON.stringify(clients));
        return client;
    }

    deleteClient(id) {
        let clients = this.getClients();
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem('clients', JSON.stringify(clients));
        
        // Also delete related visits
        let visits = this.getVisits();
        visits = visits.filter(v => v.clientId !== id);
        localStorage.setItem('visits', JSON.stringify(visits));
    }

    // Visits
    getVisits() {
        return JSON.parse(localStorage.getItem('visits') || '[]');
    }

    getVisit(id) {
        const visits = this.getVisits();
        const visit = visits.find(v => v.id === id);
        if (!visit) return null;

        const offices = this.getOffices();
        const clients = this.getClients();
        
        return {
            ...visit,
            office: offices.find(o => o.id === visit.officeId),
            client: clients.find(c => c.id === visit.clientId)
        };
    }

    saveVisit(visit) {
        const visits = this.getVisits();
        if (visit.id) {
            // Update
            const index = visits.findIndex(v => v.id === visit.id);
            if (index !== -1) {
                visits[index] = visit;
            }
        } else {
            // Create
            visit.id = 'visit-' + Date.now();
            visits.push(visit);
        }
        localStorage.setItem('visits', JSON.stringify(visits));
        return visit;
    }

    deleteVisit(id) {
        let visits = this.getVisits();
        visits = visits.filter(v => v.id !== id);
        localStorage.setItem('visits', JSON.stringify(visits));
    }

    // Image handling (store as base64)
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Export instance
window.storage = new StorageManager();