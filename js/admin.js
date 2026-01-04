// Admin Panel JavaScript - MongoDB API Version (Port 3000)
const API_BASE = 'http://localhost:3000/api';

// State for images during editing
let currentEditImages = [];

// Sidebar Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOffices();
    loadClients();
    loadVisits();
    loadDashboard();
    setupImagePreviews();
});

// ============ GEOCODING ============

async function getFormCoordinates(type, e) {
    if (e) e.preventDefault();
    const form = document.getElementById(`${type}-form`);
    const address = form.address.value;
    const city = form.city.value;
    const country = form.country.value;
    
    if (!address && !city) {
        alert('Please enter a Full Address or City!');
        return;
    }
    
    const query = address || (country ? `${city}, ${country}` : city);
    const btn = e ? e.currentTarget : document.querySelector(`#${type}-form button[onclick*="getFormCoordinates"]`);
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i class="ti ti-loader animate-spin"></i> Searching...';
        btn.disabled = true;
        
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            form.latitude.value = parseFloat(data[0].lat).toFixed(6);
            form.longitude.value = parseFloat(data[0].lon).toFixed(6);
        } else {
            alert('Location not found. Please enter coordinates manually.');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        alert('Error fetching coordinates. Please enter them manually.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

window.getFormCoordinates = getFormCoordinates;

// ============ DASHBOARD ============

async function loadDashboard() {
    try {
        const officesRes = await fetch(`${API_BASE}/offices`);
        const offices = await officesRes.json();

        const clientsRes = await fetch(`${API_BASE}/clients`);
        const clients = await clientsRes.json();

        const visitsRes = await fetch(`${API_BASE}/visits`);
        const visits = await visitsRes.json();

        // Update statistics
        document.getElementById('stat-offices').textContent = offices.length;
        document.getElementById('stat-clients').textContent = clients.length;
        document.getElementById('stat-visits').textContent = visits.length;

        // Display recent 5 visits
        const recentVisits = visits
            .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
            .slice(0, 5);

        displayRecentVisits(recentVisits);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayRecentVisits(visits) {
    const container = document.getElementById('recent-visits');

    if (visits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ti ti-calendar-off"></i>
                <p>No visits recorded yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = visits.map(visit => {
        const visitDate = new Date(visit.visitDate);
        const formattedDate = visitDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const clientName = visit.clientId?.name || 'Unknown Client';
        const officeName = visit.officeId?.name || 'Unknown Office';

        return `
            <div class="recent-visit-item">
                <div class="visit-details">
                    <div class="visit-title">${clientName} → ${officeName}</div>
                    <div class="visit-meta">
                        <div class="visit-meta-item">
                            <i class="ti ti-calendar-event"></i>
                            <span>${formattedDate}</span>
                        </div>
                        ${visit.purpose ? `
                            <div class="visit-meta-item">
                                <i class="ti ti-briefcase"></i>
                                <span>${visit.purpose}</span>
                            </div>
                        ` : ''}
                        ${visit.attendees && visit.attendees.length > 0 ? `
                            <div class="visit-meta-item">
                                <i class="ti ti-users"></i>
                                <span>${visit.attendees.length} attendees</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============ CUSTOM CONFIRM MODAL ============

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        msgEl.textContent = message;
        modal.classList.add('active');

        const cleanup = (result) => {
            modal.classList.remove('active');
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        okBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
    });
}

// ============ IMAGE PREVIEWS ============

function setupImagePreviews() {
    ['office', 'client', 'visit'].forEach(type => {
        const input = document.getElementById(`${type}-images-input`);
        if (input) {
            input.addEventListener('change', (e) => {
                const preview = document.getElementById(`${type}-images-preview`);
                // Clear and show new files (these will be uploaded)
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const div = document.createElement('div');
                        div.className = 'image-preview-item';
                        div.innerHTML = `<img src="${event.target.result}"><span class="badge">New</span>`;
                        preview.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                });
            });
        }
    });
}

function renderExistingImages(images, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    currentEditImages = [...images];
    
    images.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `
            <img src="${img}">
            <button class="image-preview-delete" onclick="removeExistingImage(${index}, '${containerId}')" type="button">
                <i class="ti ti-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function removeExistingImage(index, containerId) {
    currentEditImages.splice(index, 1);
    renderExistingImages(currentEditImages, containerId);
}

// ============ OFFICES ============

async function loadOffices() {
    try {
        const response = await fetch(`${API_BASE}/offices`);
        const offices = await response.json();
        displayOffices(offices);
    } catch (error) { console.error(error); }
}

function displayOffices(offices) {
    const container = document.getElementById('offices-list');

    if (offices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                <i class="ti ti-building-off" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No offices found. Add one to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = offices.map(office => `
        <div class="data-card">
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${office.name}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="openOfficeForm('${office._id}')" title="Edit"><i class="ti ti-edit"></i></button>
                        <button class="btn-icon danger" onclick="deleteOffice('${office._id}')" title="Delete"><i class="ti ti-trash"></i></button>
                    </div>
                </div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-row-label">Location</span>
                        <div class="info-row-value"><i class="ti ti-map-pin"></i>${office.city}, ${office.country}</div>
                    </div>
                    ${office.address ? `
                        <div class="info-row">
                            <span class="info-row-label">Address</span>
                            <div class="info-row-value"><i class="ti ti-map"></i>${office.address}</div>
                        </div>
                    ` : ''}
                    ${office.employees ? `
                        <div class="info-row">
                            <span class="info-row-label">Employees</span>
                            <div class="info-row-value"><i class="ti ti-users"></i>${office.employees}</div>
                        </div>
                    ` : ''}
                    ${office.established ? `
                        <div class="info-row">
                            <span class="info-row-label">Established</span>
                            <div class="info-row-value"><i class="ti ti-calendar"></i>${office.established}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${office.images?.length ? `
                <div class="card-gallery">
                    ${office.images.map(img => `<div class="card-image-wrapper"><img src="${img}" class="card-image" alt="Office"></div>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function openOfficeForm(id = null) {
    const modal = document.getElementById('office-modal');
    const form = document.getElementById('office-form');
    form.reset();
    document.getElementById('office-id').value = id || '';
    document.getElementById('office-images-preview').innerHTML = '';
    
    if (id) {
        document.getElementById('office-modal-title').textContent = 'Edit Office';
        const response = await fetch(`${API_BASE}/offices/${id}`);
        const data = await response.json();
        const office = data.office;
        
        form.name.value = office.name;
        form.address.value = office.address || '';
        form.city.value = office.city;
        form.country.value = office.country;
        form.longitude.value = office.coordinates[0];
        form.latitude.value = office.coordinates[1];
        form.employees.value = office.employees || '';
        form.established.value = office.established || '';
        form.description.value = office.description || '';

        currentEditImages = office.images || [];
        renderExistingImages(currentEditImages, 'office-images-preview');
    } else {
        document.getElementById('office-modal-title').textContent = 'Add Office';
        currentEditImages = [];
    }
    modal.classList.add('active');
}

document.getElementById('office-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = document.getElementById('office-id').value;
    
    const coordinates = [parseFloat(formData.get('longitude')), parseFloat(formData.get('latitude'))];
    formData.delete('longitude');
    formData.delete('latitude');
    formData.append('coordinates', JSON.stringify(coordinates));
    formData.append('existingImages', JSON.stringify(currentEditImages));
    
    try {
        const response = await fetch(id ? `${API_BASE}/offices/${id}` : `${API_BASE}/offices`, {
            method: id ? 'PUT' : 'POST',
            body: formData
        });
        if (response.ok) {
            document.getElementById('office-modal').classList.remove('active');
            document.getElementById('offices-search').value = '';
            loadOffices();
        }
    } catch (error) { alert('Error saving office'); }
});

async function deleteOffice(id) {
    if (await showConfirm('Are you sure you want to delete this office?')) {
        await fetch(`${API_BASE}/offices/${id}`, { method: 'DELETE' });
        document.getElementById('offices-search').value = '';
        loadOffices();
    }
}

// ============ CLIENTS ============

async function loadClients() {
    try {
        const response = await fetch(`${API_BASE}/clients`);
        const clients = await response.json();
        displayClients(clients);
    } catch (error) { console.error(error); }
}

function displayClients(clients) {
    const container = document.getElementById('clients-list');

    if (clients.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                <i class="ti ti-user-off" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No clients found. Add one to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = clients.map(client => `
        <div class="data-card">
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${client.name}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="openClientForm('${client._id}')" title="Edit"><i class="ti ti-edit"></i></button>
                        <button class="btn-icon danger" onclick="deleteClient('${client._id}')" title="Delete"><i class="ti ti-trash"></i></button>
                    </div>
                </div>
                <div class="card-info">
                    <div class="info-row">
                        <span class="info-row-label">Location</span>
                        <div class="info-row-value"><i class="ti ti-map-pin"></i>${client.city}, ${client.country}</div>
                    </div>
                    ${client.address ? `
                        <div class="info-row">
                            <span class="info-row-label">Address</span>
                            <div class="info-row-value"><i class="ti ti-map"></i>${client.address}</div>
                        </div>
                    ` : ''}
                    ${client.industry ? `
                        <div class="info-row">
                            <span class="info-row-label">Industry</span>
                            <div class="info-row-value"><i class="ti ti-briefcase"></i>${client.industry}</div>
                        </div>
                    ` : ''}
                    ${client.partnershipSince ? `
                        <div class="info-row">
                            <span class="info-row-label">Partner Since</span>
                            <div class="info-row-value"><i class="ti ti-handshake"></i>${client.partnershipSince}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${client.images?.length ? `
                <div class="card-gallery">
                    ${client.images.map(img => `<div class="card-image-wrapper"><img src="${img}" class="card-image" alt="Client"></div>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function openClientForm(id = null) {
    const modal = document.getElementById('client-modal');
    const form = document.getElementById('client-form');
    form.reset();
    document.getElementById('client-id').value = id || '';
    document.getElementById('client-images-preview').innerHTML = '';
    
    if (id) {
        document.getElementById('client-modal-title').textContent = 'Edit Client';
        const response = await fetch(`${API_BASE}/clients/${id}`);
        const data = await response.json();
        const client = data.client;
        
        form.name.value = client.name;
        form.address.value = client.address || '';
        form.city.value = client.city;
        form.country.value = client.country;
        form.longitude.value = client.coordinates[0];
        form.latitude.value = client.coordinates[1];
        form.industry.value = client.industry || '';
        form.partnershipSince.value = client.partnershipSince || '';
        form.description.value = client.description || '';

        currentEditImages = client.images || [];
        renderExistingImages(currentEditImages, 'client-images-preview');
    } else {
        document.getElementById('client-modal-title').textContent = 'Add Client';
        currentEditImages = [];
    }
    modal.classList.add('active');
}

document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = document.getElementById('client-id').value;
    
    const coordinates = [parseFloat(formData.get('longitude')), parseFloat(formData.get('latitude'))];
    formData.delete('longitude');
    formData.delete('latitude');
    formData.append('coordinates', JSON.stringify(coordinates));
    formData.append('existingImages', JSON.stringify(currentEditImages));
    
    try {
        const response = await fetch(id ? `${API_BASE}/clients/${id}` : `${API_BASE}/clients`, {
            method: id ? 'PUT' : 'POST',
            body: formData
        });
        if (response.ok) {
            document.getElementById('client-modal').classList.remove('active');
            document.getElementById('clients-search').value = '';
            loadClients();
        }
    } catch (error) { alert('Error saving client'); }
});

async function deleteClient(id) {
    if (await showConfirm('Are you sure you want to delete this client?')) {
        await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
        document.getElementById('clients-search').value = '';
        loadClients();
    }
}

// ============ VISITS ============

async function loadVisits() {
    try {
        const response = await fetch(`${API_BASE}/visits`);
        const visits = await response.json();
        displayVisits(visits);
        loadDashboard();
    } catch (error) { console.error(error); }
}

function displayVisits(visits) {
    const container = document.getElementById('visits-list');

    if (visits.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                <i class="ti ti-calendar-off" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No visits recorded. Create one to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = visits.map(visit => {
        const visitDate = new Date(visit.visitDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        return `
            <div class="data-card">
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${visit.clientId?.name || 'Unknown Client'} <span style="color: var(--color-text-secondary);">→</span> ${visit.officeId?.name || 'Unknown Office'}</h3>
                        <div class="card-actions">
                            <button class="btn-icon" onclick="openVisitForm('${visit._id}')" title="Edit"><i class="ti ti-edit"></i></button>
                            <button class="btn-icon danger" onclick="deleteVisit('${visit._id}')" title="Delete"><i class="ti ti-trash"></i></button>
                        </div>
                    </div>
                    <div class="card-info">
                        <div class="info-row">
                            <span class="info-row-label">Visit Date</span>
                            <div class="info-row-value"><i class="ti ti-calendar-event"></i>${visitDate}</div>
                        </div>
                        ${visit.purpose ? `
                            <div class="info-row">
                                <span class="info-row-label">Purpose</span>
                                <div class="info-row-value"><i class="ti ti-briefcase"></i>${visit.purpose}</div>
                            </div>
                        ` : ''}
                        ${visit.attendees && visit.attendees.length > 0 ? `
                            <div class="info-row">
                                <span class="info-row-label">Attendees</span>
                                <div class="info-row-value"><i class="ti ti-users"></i>${visit.attendees.length} person(s)</div>
                            </div>
                        ` : ''}
                        ${visit.notes ? `
                            <div class="info-row" style="grid-column: 1 / -1;">
                                <span class="info-row-label">Notes</span>
                                <div class="info-row-value" style="color: var(--color-text-secondary);">${visit.notes}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${visit.images?.length ? `
                    <div class="card-gallery">
                        ${visit.images.map(img => `<div class="card-image-wrapper"><img src="${img}" class="card-image" alt="Visit"></div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function openVisitForm(id = null) {
    const officesRes = await fetch(`${API_BASE}/offices`);
    const offices = await officesRes.json();
    const clientsRes = await fetch(`${API_BASE}/clients`);
    const clients = await clientsRes.json();
    
    document.getElementById('visit-office').innerHTML = '<option value="">Select Office</option>' + 
        offices.map(o => `<option value="${o._id}">${o.name}</option>`).join('');
    document.getElementById('visit-client').innerHTML = '<option value="">Select Client</option>' + 
        clients.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
        
    const modal = document.getElementById('visit-modal');
    const form = document.getElementById('visit-form');
    form.reset();
    document.getElementById('visit-id').value = id || '';
    document.getElementById('visit-images-preview').innerHTML = '';
    
    if (id) {
        document.getElementById('visit-modal-title').textContent = 'Edit Visit';
        const response = await fetch(`${API_BASE}/visits/${id}`);
        const visit = await response.json();
        form.officeId.value = visit.officeId._id;
        form.clientId.value = visit.clientId._id;
        form.visitDate.value = visit.visitDate.split('T')[0];
        form.purpose.value = visit.purpose || '';
        form.notes.value = visit.notes || '';
        form.attendees.value = visit.attendees ? visit.attendees.join(', ') : '';
        
        renderExistingImages(visit.images || [], 'visit-images-preview');
    } else {
        document.getElementById('visit-modal-title').textContent = 'Add Visit';
        currentEditImages = [];
    }
    modal.classList.add('active');
}

document.getElementById('visit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = document.getElementById('visit-id').value;
    
    const attendees = formData.get('attendees').split(',').map(s => s.trim());
    formData.delete('attendees');
    formData.append('attendees', JSON.stringify(attendees));
    formData.append('existingImages', JSON.stringify(currentEditImages));
    
    try {
        const response = await fetch(id ? `${API_BASE}/visits/${id}` : `${API_BASE}/visits`, {
            method: id ? 'PUT' : 'POST',
            body: formData
        });
        if (response.ok) {
            document.getElementById('visit-modal').classList.remove('active');
            document.getElementById('visits-search').value = '';
            loadVisits();
        }
    } catch (error) { alert('Error saving visit'); }
});

async function deleteVisit(id) {
    if (await showConfirm('Are you sure you want to delete this visit?')) {
        await fetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
        document.getElementById('visits-search').value = '';
        loadVisits();
    }
}

// ============ SEARCH FILTERING ============

let allOffices = [];
let allClients = [];
let allVisits = [];

function filterOffices() {
    const searchText = document.getElementById('offices-search').value.toLowerCase();
    const filtered = allOffices.filter(office =>
        office.name.toLowerCase().includes(searchText) ||
        office.city.toLowerCase().includes(searchText) ||
        office.country.toLowerCase().includes(searchText)
    );
    displayOffices(filtered);
}

function filterClients() {
    const searchText = document.getElementById('clients-search').value.toLowerCase();
    const filtered = allClients.filter(client =>
        client.name.toLowerCase().includes(searchText) ||
        client.city.toLowerCase().includes(searchText) ||
        (client.industry && client.industry.toLowerCase().includes(searchText))
    );
    displayClients(filtered);
}

function filterVisits() {
    const searchText = document.getElementById('visits-search').value.toLowerCase();
    const filtered = allVisits.filter(visit =>
        (visit.clientId?.name && visit.clientId.name.toLowerCase().includes(searchText)) ||
        (visit.officeId?.name && visit.officeId.name.toLowerCase().includes(searchText)) ||
        (visit.purpose && visit.purpose.toLowerCase().includes(searchText))
    );
    displayVisits(filtered);
}

// Update loadOffices to cache data and setup search listener
const originalLoadOffices = loadOffices;
loadOffices = async function() {
    try {
        const response = await fetch(`${API_BASE}/offices`);
        allOffices = await response.json();
        displayOffices(allOffices);
        setupOfficeSearch();
    } catch (error) { console.error(error); }
};

// Update loadClients to cache data and setup search listener
const originalLoadClients = loadClients;
loadClients = async function() {
    try {
        const response = await fetch(`${API_BASE}/clients`);
        allClients = await response.json();
        displayClients(allClients);
        setupClientSearch();
    } catch (error) { console.error(error); }
};

// Update loadVisits to cache data and setup search listener
const originalLoadVisits = loadVisits;
loadVisits = async function() {
    try {
        const response = await fetch(`${API_BASE}/visits`);
        allVisits = await response.json();
        displayVisits(allVisits);
        loadDashboard();
        setupVisitSearch();
    } catch (error) { console.error(error); }
};

function setupOfficeSearch() {
    const searchInput = document.getElementById('offices-search');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.addEventListener('input', filterOffices);
        searchInput.dataset.listener = 'true';
    }
}

function setupClientSearch() {
    const searchInput = document.getElementById('clients-search');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.addEventListener('input', filterClients);
        searchInput.dataset.listener = 'true';
    }
}

function setupVisitSearch() {
    const searchInput = document.getElementById('visits-search');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.addEventListener('input', filterVisits);
        searchInput.dataset.listener = 'true';
    }
}

// Close helper
window.closeOfficeForm = () => document.getElementById('office-modal').classList.remove('active');
window.closeClientForm = () => document.getElementById('client-modal').classList.remove('active');
window.closeVisitForm = () => document.getElementById('visit-modal').classList.remove('active');
window.removeExistingImage = removeExistingImage;
window.deleteOffice = deleteOffice;
window.deleteClient = deleteClient;
window.deleteVisit = deleteVisit;
window.openOfficeForm = openOfficeForm;
window.openClientForm = openClientForm;
window.openVisitForm = openVisitForm;
window.getFormCoordinates = getFormCoordinates;