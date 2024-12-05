import { createCanvas } from 'canvas';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const title = req.query.title || '';
  const text = req.query.text || '';

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

  // Convert canvas to buffer
  const buffer = canvas.toBuffer('image/png');

  return res.status(200).setHeader('Content-Type', 'image/png').setHeader('Cache-Control', 'public, max-age=31536000').send(buffer);
};
