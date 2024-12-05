# Izvir Image Generation Service

This service generates social sharing images for Izvir posts.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the service:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Astro frontend URL for CORS (default: http://localhost:4321)

## API Endpoints

### Generate Image

```
GET /generate?title=Your%20Title&text=Read%20more
```

Parameters:
- `title`: Post title (URL encoded)
- `text`: Additional text (URL encoded)

Returns a PNG image (1080x1080) with the formatted content.
