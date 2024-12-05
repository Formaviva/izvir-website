import express from 'express';
import cors from 'cors';
import { createCanvas } from 'canvas';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins during development
app.use(cors());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.get('/generate', async (req, res) => {
  try {
    console.log('Generating image with params:', req.query);
    const { title = '', text = '' } = req.query;

    // Instagram post dimensions (1080x1080)
    const width = 1080;
    const height = 1080;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add logo or branding
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IZVIR', width / 2, 200);

    // Add title with gradient
    const titleGradient = ctx.createLinearGradient(0, height / 2 - 100, 0, height / 2 + 100);
    titleGradient.addColorStop(0, '#ffffff');
    titleGradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 64px Arial';

    // Word wrap title
    const words = decodeURIComponent(title).split(' ');
    let line = '';
    let lines = [];
    const maxWidth = width - 200;
    const lineHeight = 80;

    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Draw title lines
    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, height / 2 + (i - lines.length / 2) * lineHeight);
    });

    // Add "Read more on Izvir" text
    ctx.fillStyle = '#888888';
    ctx.font = '32px Arial';
    ctx.fillText('Read more on Izvir', width / 2, height - 100);

    // Convert canvas to buffer and send response
    const buffer = canvas.toBuffer('image/png');
    console.log('Image generated successfully');
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000'
    });
    res.send(buffer);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image: ' + error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Image service running on port ${port}`);
});
