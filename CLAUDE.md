# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an interactive world map application that tracks office and client locations globally. It's a full-stack Node.js application with Express backend, MongoDB database, and a Leaflet.js-based frontend for interactive map visualization.

## Development Commands

### Starting the Application

- **Development mode with auto-reload**: `npm run dev` - Uses nodemon to watch for file changes
- **Production mode**: `npm start` - Runs the server directly
- **Seed database**: `npm run seed` - Populates initial test data

### Server Information

- Default port: 3000 (configurable via `PORT` environment variable)
- Main entry point: [server.js](server.js)
- Admin panel: `http://localhost:3000/admin`
- Map view: `http://localhost:3000`

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

**Frontend Files:**
- [index.html](index.html) - Main map view with interactive features
- [admin.html](admin.html) - Administrative panel for data management
- [login.html](login.html) - User authentication page
- `js/` - Frontend JavaScript modules:
  - [js/map.js](js/map.js) - MapManager class handling Leaflet initialization, layer management, and marker rendering
  - [js/app.js](js/app.js) - Main application logic
  - [js/data.js](js/data.js) - API communication and data fetching
  - [js/admin.js](js/admin.js) - Admin panel functionality
  - [js/animation.js](js/animation.js) - Visual animations
  - [js/storage.js](js/storage.js) - Client-side state management
  - [js/lightbox.js](js/lightbox.js) - Image gallery viewer

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

## Important Implementation Notes

1. **Coordinate System**: All location data uses [longitude, latitude] format, which is standard for GeoJSON. The Leaflet map uses [latitude, longitude] so conversion occurs in the frontend.

2. **Image Management**: Images are served statically from `/uploads/` endpoint. Update operations preserve existing images unless explicitly removed.

3. **Mongoose Hooks**: Pre-save hooks automatically update the `updatedAt` timestamp on both Office and Client models.

4. **Visit Population**: The visits API uses Mongoose `.populate('clientId')` to include full client details in responses.

5. **Map Layer Rotation**: The MapManager class supports rotating between different tile layers (dark, satellite, green).

6. **Error Handling**: Express error middleware catches unhandled errors and returns 500 status with error messages.
