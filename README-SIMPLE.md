# Interactive World Map Tracker - Quick Start Guide

## 🚀 No Installation Required!

This version works **completely in your browser** without any backend setup. All data is stored locally using browser localStorage.

## ✨ Features Added

1. **Admin Login Portal** - Access at `login.html`
   - Username: `admin`
   - Password: `admin`

2. **Image Management**
   - Upload multiple images per office/client
   - Delete images individually
   - Images stored as base64 in localStorage

3. **Image Lightbox/Slider**
   - Click any image on the map to open fullscreen view
   - Use arrow keys or buttons to navigate
   - Press ESC to close

## 📖 How to Use

### Step 1: Open the Map
1. Open `index.html` in your web browser
2. You'll see the interactive world map with sample data
3. Click on markers to see location details with images

### Step 2: Access Admin Panel
1. Open `login.html` in your browser
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. You'll be redirected to the admin panel

### Step 3: Manage Data

**Add an Office:**
1. Go to "Offices" tab
2. Click "+ Add Office"
3. Fill in the form:
   - Name, City, Country
   - Coordinates (use Google Maps to find them)
   - Upload images
4. Click "Save Office"

**Add a Client:**
1. Go to "Clients" tab
2. Click "+ Add Client"
3. Fill in details and upload images
4. Save

**Record a Visit:**
1. Go to "Visits" tab
2. Click "+ Add Visit"
3. Select office and client
4. Enter visit details
5. Save

**Edit/Delete:**
- Click the edit icon (✏️) to modify
- Click the trash icon (🗑️) to delete
- To delete an image: hover over it and click the X button

### Step 4: View Changes on Map
1. Go back to `index.html`
2. All your changes will be visible immediately
3. Click markers to see updated information with images

## 🖼️ Image Slider Features

When you click an image in a popup:
- **Fullscreen view** of the image
- **Navigate** with arrow buttons or keyboard (← →)
- **Close** with X button or ESC key
- **Image counter** shows current position

## 📍 Finding Coordinates

To get coordinates for any location:
1. Go to [Google Maps](https://maps.google.com)
2. Right-click on the location
3. Click the coordinates to copy them
4. In the form:
   - **Longitude** = First number (horizontal position)
   - **Latitude** = Second number (vertical position)

Example: For New York
- Coordinates from Google Maps: `40.7128, -74.0060`
- In form: Longitude = `-74.0060`, Latitude = `40.7128`

## 🎨 Keyboard Shortcuts

**Map View:**
- `R` - Replay airplane animation
- `L` - Toggle legend panel

**Image Lightbox:**
- `→` - Next image
- `←` - Previous image
- `ESC` - Close lightbox

## 💾 Data Storage

- All data is stored in your browser's localStorage
- Data persists even after closing the browser
- Each browser/computer has its own separate data
- To backup: Use browser developer tools to export localStorage
- To reset: Clear browser data for this site

## 🔒 Security Note

This is a demo application. For production use:
- Change the admin credentials
- Implement proper authentication
- Use a real backend database
- Add user permissions

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets
- Mobile phones

## 🆘 Troubleshooting

**Map not loading?**
- Make sure you have internet connection (for map tiles)
- Clear browser cache and reload

**Images not showing?**
- Check if you uploaded the images correctly
- Try smaller images (recommended < 2MB each)

**Data disappeared?**
- Check if you're using the same browser
- Data is browser-specific and won't sync across devices

**Can't login to admin?**
- Username: `admin` (lowercase)
- Password: `admin` (lowercase)
- Make sure you're on `login.html`

## 🎯 Quick Demo Workflow

1. Open `index.html` → See the map with sample data
2. Open `login.html` → Login with admin/admin
3. Add a new office in your city with an image
4. Add a client location
5. Record a visit between them
6. Go back to map → See your new markers
7. Click markers → View details and images
8. Click an image → See fullscreen slider

## 📂 File Structure

```
├── index.html           # Main map view
├── login.html          # Admin login page
├── admin.html          # Admin panel
├── js/
│   ├── storage.js      # LocalStorage manager
│   ├── data.js         # Data loader
│   ├── map.js          # Map functionality
│   ├── animation.js    # Airplane animation
│   ├── lightbox.js     # Image slider
│   ├── admin.js        # Admin panel logic
│   └── app.js          # Main app
└── styles/
    ├── main.css        # Map styles
    └── admin.css       # Admin styles
```

## 🌟 Tips

1. **Add real photos**: Upload actual office/client photos for better presentation
2. **Use accurate coordinates**: Double-check locations on Google Maps
3. **Regular backups**: Export your localStorage data periodically
4. **Test on different devices**: Check how it looks on mobile

---

**That's it! You're ready to track your global presence!** 🌍✨