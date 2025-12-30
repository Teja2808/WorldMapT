// Seed script to populate database with sample data
const mongoose = require('mongoose');
require('dotenv').config();

const Office = require('./models/Office');
const Client = require('./models/Client');
const Visit = require('./models/Visit');

const sampleOffices = [
    {
        name: 'Headquarters',
        city: 'San Francisco',
        country: 'USA',
        coordinates: [-122.4194, 37.7749],
        description: 'Our global headquarters and innovation center',
        employees: 1200,
        established: 2015
    },
    {
        name: 'European Hub',
        city: 'London',
        country: 'United Kingdom',
        coordinates: [-0.1276, 51.5074],
        description: 'European operations center',
        employees: 450,
        established: 2017
    },
    {
        name: 'Asia Pacific Office',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: [103.8198, 1.3521],
        description: 'Strategic hub for Asia-Pacific region',
        employees: 380,
        established: 2018
    }
];

const sampleClients = [
    {
        name: 'TechCorp Global',
        city: 'New York',
        country: 'USA',
        coordinates: [-74.0060, 40.7128],
        description: 'Enterprise software solutions provider',
        industry: 'Technology',
        partnershipSince: 2016
    },
    {
        name: 'FinanceFirst Ltd',
        city: 'Frankfurt',
        country: 'Germany',
        coordinates: [8.6821, 50.1109],
        description: 'Leading financial services platform',
        industry: 'Finance',
        partnershipSince: 2017
    },
    {
        name: 'RetailMax',
        city: 'Paris',
        country: 'France',
        coordinates: [2.3522, 48.8566],
        description: 'E-commerce solutions provider',
        industry: 'Retail',
        partnershipSince: 2018
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worldmap');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Office.deleteMany({});
        await Client.deleteMany({});
        await Visit.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert offices
        const offices = await Office.insertMany(sampleOffices);
        console.log(`✅ Created ${offices.length} offices`);

        // Insert clients
        const clients = await Client.insertMany(sampleClients);
        console.log(`✅ Created ${clients.length} clients`);

        // Create sample visits
        const sampleVisits = [
            {
                officeId: offices[0]._id,
                clientId: clients[0]._id,
                visitDate: new Date('2024-01-15'),
                purpose: 'Quarterly Business Review',
                notes: 'Discussed expansion plans',
                attendees: ['John Smith', 'Jane Doe']
            },
            {
                officeId: offices[1]._id,
                clientId: clients[1]._id,
                visitDate: new Date('2024-02-20'),
                purpose: 'Product Demo',
                notes: 'Showcased new features',
                attendees: ['Alice Johnson', 'Bob Williams']
            }
        ];

        const visits = await Visit.insertMany(sampleVisits);
        console.log(`✅ Created ${visits.length} visits`);

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();