const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Office = require('../models/Office');
const Visit = require('../models/Visit');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/offices/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'office-' + uniqueSuffix + path.extname(file.originalname));
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

// GET all offices
router.get('/', async (req, res) => {
    try {
        const offices = await Office.find();
        res.json(offices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single office with visiting clients
router.get('/:id', async (req, res) => {
    try {
        const office = await Office.findById(req.params.id);
        if (!office) {
            return res.status(404).json({ error: 'Office not found' });
        }
        
        // Get all visits to this office with client details
        const visits = await Visit.find({ officeId: req.params.id })
            .populate('clientId')
            .sort({ visitDate: -1 });
        
        res.json({
            office,
            visits: visits.map(v => ({
                client: v.clientId,
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

// POST create new office
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const officeData = {
            ...req.body,
            coordinates: JSON.parse(req.body.coordinates)
        };
        
        if (req.files && req.files.length > 0) {
            officeData.images = req.files.map(file => `/uploads/offices/${file.filename}`);
        }
        
        const office = new Office(officeData);
        await office.save();
        res.status(201).json(office);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update office
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const updateData = {
            ...req.body,
            coordinates: req.body.coordinates ? JSON.parse(req.body.coordinates) : undefined,
            images: existingImages
        };
        
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/offices/${file.filename}`);
            updateData.images = [...updateData.images, ...newImages];
        }
        
        const office = await Office.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!office) {
            return res.status(404).json({ error: 'Office not found' });
        }
        
        res.json(office);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE office
router.delete('/:id', async (req, res) => {
    try {
        const office = await Office.findByIdAndDelete(req.params.id);
        if (!office) {
            return res.status(404).json({ error: 'Office not found' });
        }
        res.json({ message: 'Office deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;