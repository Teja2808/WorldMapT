const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Visit = require('../models/Visit');

// Configure multer for visit image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/visits/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'visit-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// GET all visits
router.get('/', async (req, res) => {
    try {
        const visits = await Visit.find()
            .populate('officeId')
            .populate('clientId')
            .sort({ visitDate: -1 });
        res.json(visits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single visit
router.get('/:id', async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id)
            .populate('officeId')
            .populate('clientId');
        
        if (!visit) {
            return res.status(404).json({ error: 'Visit not found' });
        }
        
        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new visit
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const visitData = {
            ...req.body,
            attendees: req.body.attendees ? JSON.parse(req.body.attendees) : []
        };
        
        if (req.files && req.files.length > 0) {
            visitData.images = req.files.map(file => `/uploads/visits/${file.filename}`);
        }
        
        const visit = new Visit(visitData);
        await visit.save();
        
        const populatedVisit = await Visit.findById(visit._id)
            .populate('officeId')
            .populate('clientId');
        
        res.status(201).json(populatedVisit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update visit
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const updateData = {
            ...req.body,
            attendees: req.body.attendees ? JSON.parse(req.body.attendees) : undefined,
            images: existingImages
        };
        
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/visits/${file.filename}`);
            updateData.images = [...updateData.images, ...newImages];
        }
        
        const visit = await Visit.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('officeId')
        .populate('clientId');
        
        if (!visit) {
            return res.status(404).json({ error: 'Visit not found' });
        }
        
        res.json(visit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE visit
router.delete('/:id', async (req, res) => {
    try {
        const visit = await Visit.findByIdAndDelete(req.params.id);
        if (!visit) {
            return res.status(404).json({ error: 'Visit not found' });
        }
        res.json({ message: 'Visit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;