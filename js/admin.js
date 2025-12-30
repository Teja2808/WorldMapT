// Admin Panel JavaScript - MongoDB API Version (Port 3000)
const API_BASE = 'http://localhost:3000/api';

// State for images during editing
let currentEditImages = [];

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
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
    container.innerHTML = offices.map(office => `
        <div class="data-card">
            <div class="card-header">
                <h3 class="card-title">${office.name}</h3>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openOfficeForm('${office._id}')"><i class="ti ti-edit"></i></button>
                    <button class="btn-icon danger" onclick="deleteOffice('${office._id}')"><i class="ti ti-trash"></i></button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-row"><i class="ti ti-map-pin"></i><span>${office.city}, ${office.country}</span></div>
            </div>
            ${office.images?.length ? `<div class="card-images">${office.images.map(img => `<img src="${img}" class="card-image">`).join('')}</div>` : ''}
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
        form.city.value = office.city;
        form.country.value = office.country;
        form.longitude.value = office.coordinates[0];
        form.latitude.value = office.coordinates[1];
        form.employees.value = office.employees || '';
        form.established.value = office.established || '';
        form.description.value = office.description || '';
        
        renderExistingImages(office.images || [], 'office-images-preview');
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
            loadOffices();
        }
    } catch (error) { alert('Error saving office'); }
});

async function deleteOffice(id) {
    if (await showConfirm('Are you sure you want to delete this office?')) {
        await fetch(`${API_BASE}/offices/${id}`, { method: 'DELETE' });
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
    container.innerHTML = clients.map(client => `
        <div class="data-card">
            <div class="card-header">
                <h3 class="card-title">${client.name}</h3>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openClientForm('${client._id}')"><i class="ti ti-edit"></i></button>
                    <button class="btn-icon danger" onclick="deleteClient('${client._id}')"><i class="ti ti-trash"></i></button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-row"><i class="ti ti-map-pin"></i><span>${client.city}, ${client.country}</span></div>
            </div>
            ${client.images?.length ? `<div class="card-images">${client.images.map(img => `<img src="${img}" class="card-image">`).join('')}</div>` : ''}
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
        form.city.value = client.city;
        form.country.value = client.country;
        form.longitude.value = client.coordinates[0];
        form.latitude.value = client.coordinates[1];
        form.industry.value = client.industry || '';
        form.partnershipSince.value = client.partnershipSince || '';
        form.description.value = client.description || '';
        
        renderExistingImages(client.images || [], 'client-images-preview');
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
            loadClients();
        }
    } catch (error) { alert('Error saving client'); }
});

async function deleteClient(id) {
    if (await showConfirm('Are you sure you want to delete this client?')) {
        await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
        loadClients();
    }
}

// ============ VISITS ============

async function loadVisits() {
    try {
        const response = await fetch(`${API_BASE}/visits`);
        const visits = await response.json();
        displayVisits(visits);
    } catch (error) { console.error(error); }
}

function displayVisits(visits) {
    const container = document.getElementById('visits-list');
    container.innerHTML = visits.map(visit => `
        <div class="data-card">
            <div class="card-header">
                <h3 class="card-title">${visit.clientId?.name || 'Unknown'} → ${visit.officeId?.name || 'Unknown'}</h3>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openVisitForm('${visit._id}')"><i class="ti ti-edit"></i></button>
                    <button class="btn-icon danger" onclick="deleteVisit('${visit._id}')"><i class="ti ti-trash"></i></button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-row"><i class="ti ti-calendar-event"></i><span>${new Date(visit.visitDate).toLocaleDateString()}</span></div>
            </div>
            ${visit.images?.length ? `<div class="card-images">${visit.images.map(img => `<img src="${img}" class="card-image">`).join('')}</div>` : ''}
        </div>
    `).join('');
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
            loadVisits();
        }
    } catch (error) { alert('Error saving visit'); }
});

async function deleteVisit(id) {
    if (await showConfirm('Are you sure you want to delete this visit?')) {
        await fetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
        loadVisits();
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