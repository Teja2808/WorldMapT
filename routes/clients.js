const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Client = require('../models/Client');
const Visit = require('../models/Visit');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/clients/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'client-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// GET all clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single client with visited offices
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        // Get all visits by this client with office details
        const visits = await Visit.find({ clientId: req.params.id })
            .populate('officeId')
            .sort({ visitDate: -1 });
        
        res.json({
            client,
            visits: visits.map(v => ({
                office: v.officeId,
                visitDate: v.visitDate,
                purpose: v.purpose,
                notes: v.notes,
                attendees: v.attendees,
                images: v.images // Added visit images
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new client
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const clientData = {
            ...req.body,
            coordinates: JSON.parse(req.body.coordinates)
        };
        
        if (req.files && req.files.length > 0) {
            clientData.images = req.files.map(file => `/uploads/clients/${file.filename}`);
        }
        
        const client = new Client(clientData);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update client
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const updateData = {
            ...req.body,
            coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : undefined,
            images: existingImages
        };
        
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/clients/${file.filename}`);
            updateData.images = [...updateData.images, ...newImages];
        }
        
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE client
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;