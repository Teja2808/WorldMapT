# Interactive World Map Tracker - Full Stack Application

A full-stack web application for tracking company offices, client locations, and visits worldwide with MongoDB backend and admin panel.

## Features

### Map Features
- **Interactive World Map**: SVG-based vector map with smooth animations
- **Animated Flight Routes**: Circular airplane animation showing office connections
- **Smart Markers**: Company and client markers with hover effects
- **Rich Popups**: Click markers to see:
  - Office: Location, employees, images, and recent client visits
  - Client: Location, industry, images, and visited offices
- **Progressive Route Drawing**: Lines appear as airplane travels
- **Premium Dark UI**: Modern glassmorphic design with neon accents

### Admin Panel Features
- **Office Management**: Add, edit, delete office locations with images
- **Client Management**: Add, edit, delete client locations with images
- **Visit Tracking**: Record client visits to offices with dates and notes
- **Image Upload**: Upload up to 5 images per office/client
- **Real-time Updates**: Changes reflect immediately on the map

## Tech Stack

- **Frontend**: Vanilla JavaScript, Leaflet.js, GSAP, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for image handling

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
# Default connection: mongodb://localhost:27017/worldmap
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update `.env` file with your connection string

### 3. Configure Environment Variables

The `.env` file is already created with default values:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/worldmap
NODE_ENV=development
```

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

This creates sample offices, clients, and visits.

### 5. Start the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 6. Access the Application

- **Map View**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Usage Guide

### Admin Panel

#### Adding an Office
1. Go to Admin Panel → Offices tab
2. Click "+ Add Office"
3. Fill in:
   - Office name, city, country
   - Coordinates (longitude, latitude) - Use Google Maps to find coordinates
   - Employees count, established year
   - Description
   - Upload images (optional, max 5)
4. Click "Save Office"

#### Adding a Client
1. Go to Clients tab
2. Click "+ Add Client"
3. Fill in client details including coordinates
4. Upload client images
5. Save

#### Recording a Visit
1. Go to Visits tab
2. Click "+ Add Visit"
3. Select office and client from dropdowns
4. Enter visit date, purpose, and notes
5. Add attendees (comma-separated)
6. Save

### Map Interaction

- **View Office Details**: Click any blue building marker
- **View Client Details**: Click any pink user group marker
- **Replay Animation**: Click "Replay Route" or press 'R'
- **Toggle Legend**: Click "Legend" button or press 'L'
- **Pan/Zoom**: Use mouse or touch gestures

## API Endpoints

### Offices
- `GET /api/offices` - Get all offices
- `GET /api/offices/:id` - Get office with visiting clients
- `POST /api/offices` - Create office (multipart/form-data)
- `PUT /api/offices/:id` - Update office
- `DELETE /api/offices/:id` - Delete office

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client with visited offices
- `POST /api/clients` - Create client (multipart/form-data)
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Visits
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get single visit
- `POST /api/visits` - Create visit (JSON)
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

## Project Structure

```
.
├── models/              # Mongoose models
│   ├── Office.js
│   ├── Client.js
│   └── Visit.js
├── routes/              # Express routes
│   ├── offices.js
│   ├── clients.js
│   └── visits.js
├── uploads/             # Uploaded images
│   ├── offices/
│   └── clients/
├── js/                  # Frontend JavaScript
│   ├── app.js          # Main app
│   ├── map.js          # Map manager
│   ├── animation.js    # Airplane animation
│   ├── data.js         # API data loader
│   └── admin.js        # Admin panel
├── styles/              # CSS files
│   ├── main.css
│   └── admin.css
├── server.js            # Express server
├── seed.js              # Database seeder
├── index.html           # Map view
├── admin.html           # Admin panel
├── package.json
└── .env                 # Environment variables
```

## Finding Coordinates

To get coordinates for a location:
1. Go to [Google Maps](https://www.google.com/maps)
2. Right-click on the location
3. Click the coordinates to copy
4. Format: First number is latitude, second is longitude
5. In the form: longitude goes first, then latitude

Since this is a vanilla HTML/CSS/JavaScript application, you can run it in several ways:

**Option 1: Using VS Code Live Server**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option 2: Using Python**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

**Option 3: Using Node.js**
```bash
npx http-server -p 8000

# Then open http://localhost:8000 in your browser
```

**Option 4: Direct File Access**
Simply open `index.html` in your web browser (may have limitations with some features)

### Troubleshooting

If the map doesn't load:

1. **Check Browser Console**: Press F12 and look for error messages in the Console tab
2. **Clear Browser Cache**: Press Ctrl+Shift+R (Cmd+Shift+R on Mac) to hard reload
3. **Check CDN Access**: Make sure you have internet access to load Leaflet.js and GSAP from CDN
4. **Verify Server**: The application works best with a local server (use Options 1-3 above)
5. **Modern Browser**: Use the latest version of Chrome, Firefox, Safari, or Edge

**Common Issues:**

- **Blank screen**: Check if CDN resources are blocked by firewall/network
- **No animation**: Wait 2-3 seconds after page load, or press 'R' to replay
- **Markers not showing**: Check browser console for JavaScript errors

## Project Structure

```
web-map/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styles with CSS variables
├── js/
│   ├── app.js            # Main application logic
│   ├── map.js            # Map initialization and markers
│   ├── animation.js      # Airplane route animation
│   └── data.js           # Company and client location data
└── web-map-README.md     # This file
```

## Customization

### Adding New Locations

Edit `js/data.js` to add or modify company and client locations:

```javascript
const companyLocations = [
    {
        id: 'company-1',
        name: 'Your Office Name',
        city: 'City',
        country: 'Country',
        coordinates: [longitude, latitude],
        description: 'Description of the office',
        employees: 100,
        established: 2024
    }
];
```

### Changing Colors

All colors are defined as CSS variables in `styles/main.css`. Modify the `:root` section:

```css
:root {
    --color-primary: #1560BD;
    --color-secondary: #4682B4;
    /* ... more colors */
}
```

### Animation Settings

Adjust animation speed and behavior in `js/animation.js`:

```javascript
const duration = 3; // Animation duration in seconds
```

## Keyboard Shortcuts

- **R**: Replay the route animation
- **L**: Toggle legend visibility

## Technologies Used

- **Leaflet.js v1.9.4**: Free, open-source interactive mapping
- **OpenStreetMap**: Free map tiles (no API key needed!)
- **GSAP 3.12.4**: Smooth animations
- **Tabler Icons**: Beautiful icon set
- **Vanilla JavaScript**: No framework dependencies
- **CSS Variables**: Easy theming and customization

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- The airplane animation uses GSAP for smooth 60fps performance
- All animations are GPU-accelerated where possible
- Works smoothly on most devices including mobile

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Mapping library by [Leaflet.js](https://leafletjs.com/)
- Icons from [Tabler Icons](https://tabler-icons.io/)
- Animations powered by [GSAP](https://greensock.com/gsap/)

## License

This project is open source and available for educational and commercial use.