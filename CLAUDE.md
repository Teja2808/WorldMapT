# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive world map application that tracks office and client locations globally. It's a hybrid full-stack Node.js application with Express backend, MongoDB database, and Leaflet.js-based frontend for interactive map visualization. The application supports both a persistent MongoDB backend and in-browser localStorage fallback for data persistence.

## Development Commands

- **Development mode with auto-reload**: `npm run dev` - Runs server with nodemon for file change detection
- **Production mode**: `npm start` - Direct node execution without auto-reload
- **Seed database**: `npm run seed` - Clears all data and populates with sample offices, clients, and visits

**Note**: No linting, testing, or build tools are currently configured.

### Server

- **Port**: 3000 (configurable via `PORT` in `.env`)
- **Entry point**: [server.js](server.js)
- **Admin panel**: http://localhost:3000/admin
- **Map view**: http://localhost:3000
- **Database**: Configured via `MONGODB_URI` in `.env` (defaults to local MongoDB)

## Architecture Overview

### Backend Stack

**Core Dependencies:**
- Express.js: REST API framework
- MongoDB + Mongoose: Database and ODM
- Multer: File upload handling for images
- CORS: Cross-origin resource sharing
- dotenv: Environment variable management

**Directory Structure:**
- `server.js` - Main Express server and middleware configuration
- `models/` - Mongoose schemas for Office, Client, and Visit data
- `routes/` - API endpoints organized by resource type (offices, clients, visits)
- `uploads/` - Directory for storing user-uploaded images

### Frontend Stack

**Map Visualization:**
- [Leaflet.js](https://leafletjs.com/) - Interactive mapping library
- Multiple tile layer options: CartoDB Dark, Esri Satellite, Esri Terrain
- Custom marker clustering and icon management

**Frontend Architecture:**
- [index.html](index.html) - Main map view
- [admin.html](admin.html) - Data management interface
- [js/map.js](js/map.js) - MapManager class (Leaflet initialization, layer switching, marker/cluster rendering)
- [js/app.js](js/app.js) - Main application initialization and event coordination
- [js/data.js](js/data.js) - API communication layer
- [js/admin.js](js/admin.js) - Admin panel form handling and CRUD operations
- [js/storage.js](js/storage.js) - localStorage fallback for offline/demo mode
- [js/animation.js](js/animation.js) - UI transitions and visual effects
- [js/lightbox.js](js/lightbox.js) - Image gallery modal viewer

### Data Models

**Office Schema** ([models/Office.js](models/Office.js)):
- Name, address, city, country (required)
- Coordinates as [longitude, latitude] array
- Employee count, establishment year
- Array of image URLs
- Description field
- Automatic timestamp tracking (createdAt, updatedAt)

**Client Schema** ([models/Client.js](models/Client.js)):
- Name, address, city, country (required)
- Coordinates as [longitude, latitude] array
- Industry and partnership year
- Array of image URLs
- Description field
- Automatic timestamp tracking

**Visit Schema** ([models/Visit.js](models/Visit.js)):
- References to Office and Client documents
- Visit date and purpose
- Attendees list
- Notes and images array
- Automatic timestamps

### API Routes

All routes return JSON responses. Base path: `/api/`

**Offices** (`/api/offices`):
- `GET /` - List all offices
- `GET /:id` - Get office details with visit history
- `POST /` - Create office (supports multipart image upload, max 5 images, 5MB limit)
- `PUT /:id` - Update office (image handling preserves existing images)
- `DELETE /:id` - Delete office

**Clients** (`/api/clients`):
- `GET /` - List all clients
- `GET /:id` - Get client details with visit history
- `POST /` - Create client (supports multipart image upload)
- `PUT /:id` - Update client
- `DELETE /:id` - Delete client

**Visits** (`/api/visits`):
- `GET /` - List all visits
- `POST /` - Create visit record
- `PUT /:id` - Update visit
- `DELETE /:id` - Delete visit

### Image Upload Handling

Images are processed through multer middleware with:
- Storage: Disk storage in `uploads/offices/` or `uploads/clients/` directories
- Filename convention: Resource type prefix + timestamp + random suffix + original extension
- File types: jpeg, jpg, png, gif, webp
- Size limit: 5MB per file
- Max files per upload: 5

When updating records with images, existing images are preserved unless explicitly removed (via `existingImages` parameter).

## Environment Configuration

Create a `.env` file in the root directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/worldmap
NODE_ENV=development
```

See [.env](.env) for the current configuration.

## Key Architectural Patterns

### Coordinate System
All location data uses `[longitude, latitude]` format in MongoDB (GeoJSON standard). The frontend Leaflet map uses `[latitude, longitude]` so conversion occurs at the data boundary (e.g., in [js/data.js](js/data.js) when fetching data). This is critical when:
- Fetching offices/clients: Convert from `[lon, lat]` to `[lat, lon]`
- Sending new coordinates in API: Convert from `[lat, lon]` to `[lon, lat]`

### Hybrid Data Storage
The application supports two modes:
- **With MongoDB**: Full backend with persistent data across sessions (normal operation)
- **Without MongoDB**: Falls back to browser localStorage via [js/storage.js](js/storage.js) - useful for demos or offline operation

### Frontend-Backend Communication
The frontend primarily uses `fetch()` calls to `/api/` endpoints. [js/data.js](js/data.js) handles API communication. If API calls fail, the application gracefully degrades to localStorage. Key flow:
1. Admin panel ([js/admin.js](js/admin.js)) collects form data and sends to API
2. API routes validate and persist to MongoDB with multer handling images
3. Map refreshes by fetching updated data from `/api/offices` and `/api/clients`
4. On error, localStorage is used transparently to maintain functionality

### Image Management
- Images upload to `uploads/offices/` or `uploads/clients/` directories via multer middleware
- Filenames follow pattern: `{resource-type}-{timestamp}-{random}.{ext}`
- Updates preserve existing images by default; removal via `existingImages` parameter
- File size limit: 5MB per file, max 5 files per upload
- Images stored on disk; database stores only filenames in the `images` array
- Frontend reconstructs full URLs as `/uploads/{resource}/{filename}`

### Timestamps and Updates
[models/Office.js](models/Office.js) and [models/Client.js](models/Client.js) have pre-save hooks that automatically update the `updatedAt` timestamp. This happens on any modification, including image additions/removals.

### Marker Rendering
[js/map.js](js/map.js) MapManager class renders offices and clients as separate marker groups, supporting different icons and behaviors. Includes layer rotation between CartoDB Dark, Esri Satellite, and Esri Terrain tile layers. Uses Leaflet's L.markerClusterGroup for performance with many markers.

## Important Implementation Notes

### Frontend-Backend Flow
1. Frontend fetches data via [js/data.js](js/data.js) using `fetch()` to `/api/` endpoints
2. [js/map.js](js/map.js) MapManager receives data and renders markers using Leaflet
3. On API failure, [js/storage.js](js/storage.js) provides localStorage fallback
4. Admin panel ([js/admin.js](js/admin.js)) handles CRUD operations and image uploads

### Coordinate Conversion
Critical: MongoDB stores `[longitude, latitude]` (GeoJSON standard), but Leaflet map expects `[latitude, longitude]`. Conversion happens at the data boundary in [js/data.js](js/data.js) when fetching and before sending to API.

### Layer Management
[js/map.js](js/map.js) implements tile layer rotation between:
- CartoDB Dark (default)
- Esri Satellite
- Esri Terrain

Layer toggle logic should preserve current markers across switches.

### Storage Fallback Behavior
The application gracefully degrades when MongoDB is unavailable:
- Frontend [js/data.js](js/data.js) catches API errors and falls back to [js/storage.js](js/storage.js)
- [js/storage.js](js/storage.js) manages in-browser localStorage for demo/offline mode
- Data is not synced between storage modes - use one or the other for consistency
- Useful for testing UI without running the backend or for demo deployments

### Route Structure
API routes are organized by resource type in the `routes/` directory:
- Each route file exports a router configured with multer middleware (where applicable)
- Multer configuration: `dest: 'uploads/{resource}/'`, max 5 files, 5MB each, jpeg/png/gif/webp only
- Image files are stored with naming pattern: `{resource}-{timestamp}-{random}.{ext}`
- Routes handle both multipart/form-data (for images) and application/json requests

## Debugging and Common Tasks

### Viewing Recent Changes
Check git log to understand recent UI/UX work:
```bash
git log --oneline -10
```
Recent commits show split view, header/button changes, satellite view fixes, and map switching improvements.

### Testing Without Backend
1. Verify `.env` has correct `MONGODB_URI` pointing to a running MongoDB instance
2. If MongoDB is unavailable, ensure frontend gracefully falls back to localStorage
3. Check browser console (F12) for API errors and fallback messages

### Debugging Image Uploads
- Verify `uploads/offices/` and `uploads/clients/` directories exist and are writable
- Check multer middleware in [routes/offices.js](routes/offices.js) and [routes/clients.js](routes/clients.js)
- Images are stored on disk and referenced by filename in the database
- Test with small images (<1MB) first to isolate file size issues
- Inspect network requests to verify multipart/form-data is being sent correctly

### Inspecting Database State
```bash
# Connect to MongoDB and view data
mongosh worldmap
db.offices.find()
db.clients.find()
db.visits.find()
```

### Resetting Application State
```bash
# Reseed database with sample data (clears all existing data)
npm run seed

# To clear data via MongoDB:
# mongosh worldmap
# db.dropDatabase()
```
