// Location Data for Companies and Clients

const companyLocations = [
    {
        id: 'company-1',
        name: 'Headquarters',
        city: 'San Francisco',
        country: 'USA',
        coordinates: [-122.4194, 37.7749],
        description: 'Our global headquarters and innovation center, driving the future of technology.',
        employees: 1200,
        established: 2015
    },
    {
        id: 'company-2',
        name: 'European Hub',
        city: 'London',
        country: 'United Kingdom',
        coordinates: [-0.1276, 51.5074],
        description: 'European operations center serving clients across the continent.',
        employees: 450,
        established: 2017
    },
    {
        id: 'company-3',
        name: 'Asia Pacific Office',
        city: 'Singapore',
        country: 'Singapore',
        coordinates: [103.8198, 1.3521],
        description: 'Strategic hub for Asia-Pacific region with cutting-edge facilities.',
        employees: 380,
        established: 2018
    },
    {
        id: 'company-4',
        name: 'Innovation Center',
        city: 'Tokyo',
        country: 'Japan',
        coordinates: [139.6917, 35.6895],
        description: 'Research and development center focusing on emerging technologies.',
        employees: 280,
        established: 2019
    },
    {
        id: 'company-5',
        name: 'Development Hub',
        city: 'Bangalore',
        country: 'India',
        coordinates: [77.5946, 12.9716],
        description: 'Software development and engineering excellence center.',
        employees: 650,
        established: 2020
    }
];

const clientLocations = [
    {
        id: 'client-1',
        name: 'TechCorp Global',
        city: 'New York',
        country: 'USA',
        coordinates: [-74.0060, 40.7128],
        description: 'Enterprise software solutions for Fortune 500 companies.',
        industry: 'Technology',
        partnership_since: 2016
    },
    {
        id: 'client-2',
        name: 'FinanceFirst Ltd',
        city: 'Frankfurt',
        country: 'Germany',
        coordinates: [8.6821, 50.1109],
        description: 'Leading financial services platform with 50M+ users.',
        industry: 'Finance',
        partnership_since: 2017
    },
    {
        id: 'client-3',
        name: 'RetailMax',
        city: 'Paris',
        country: 'France',
        coordinates: [2.3522, 48.8566],
        description: 'E-commerce giant transforming retail experience.',
        industry: 'Retail',
        partnership_since: 2018
    },
    {
        id: 'client-4',
        name: 'HealthPlus Systems',
        city: 'Sydney',
        country: 'Australia',
        coordinates: [151.2093, -33.8688],
        description: 'Healthcare technology provider improving patient outcomes.',
        industry: 'Healthcare',
        partnership_since: 2019
    },
    {
        id: 'client-5',
        name: 'EduLearn Platform',
        city: 'Toronto',
        country: 'Canada',
        coordinates: [-79.3832, 43.6532],
        description: 'Online education platform serving 10M+ students globally.',
        industry: 'Education',
        partnership_since: 2019
    },
    {
        id: 'client-6',
        name: 'MediaStream Co',
        city: 'Los Angeles',
        country: 'USA',
        coordinates: [-118.2437, 34.0522],
        description: 'Digital media and entertainment streaming service.',
        industry: 'Media',
        partnership_since: 2020
    },
    {
        id: 'client-7',
        name: 'AutoDrive Tech',
        city: 'Munich',
        country: 'Germany',
        coordinates: [11.5820, 48.1351],
        description: 'Autonomous vehicle technology and AI solutions.',
        industry: 'Automotive',
        partnership_since: 2020
    },
    {
        id: 'client-8',
        name: 'GreenEnergy Solutions',
        city: 'Amsterdam',
        country: 'Netherlands',
        coordinates: [4.9041, 52.3676],
        description: 'Renewable energy management and smart grid solutions.',
        industry: 'Energy',
        partnership_since: 2021
    },
    {
        id: 'client-9',
        name: 'CloudSpace Inc',
        city: 'Seoul',
        country: 'South Korea',
        coordinates: [126.9780, 37.5665],
        description: 'Cloud infrastructure and SaaS platform provider.',
        industry: 'Technology',
        partnership_since: 2021
    },
    {
        id: 'client-10',
        name: 'LogisticsPro',
        city: 'Dubai',
        country: 'UAE',
        coordinates: [55.2708, 25.2048],
        description: 'Supply chain optimization and logistics management.',
        industry: 'Logistics',
        partnership_since: 2022
    }
];

// Export data
window.locationData = {
    companies: companyLocations,
    clients: clientLocations
};