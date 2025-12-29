# Interactive World Map - Company & Client Locations

A beautiful, interactive world map application showcasing company offices and client locations worldwide with smooth airplane route animations.

## Features

- **Interactive Globe View**: 3D globe projection with atmospheric effects
- **Animated Flight Routes**: Watch an airplane smoothly travel between company locations
- **Custom Markers**: Distinct markers for company offices and client locations
- **Rich Popups**: Click any marker to see detailed information
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: GSAP-powered transitions and effects
- **Modern UI**: Clean, professional interface with glassmorphism effects

## Setup Instructions

### 1. Run the Application

**No API key required!** This application uses Leaflet.js with OpenStreetMap tiles - completely free and open source.

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