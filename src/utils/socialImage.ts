import { createCanvas, registerFont, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure canvas size for social media
const WIDTH = 1200;
const HEIGHT = 630;

// Colors
const BACKGROUND = '#1a1a1a';
const TEXT_COLOR = '#ffffff';

export async function generateSocialImage(title: string, author: string): Promise<Buffer> {
    // Create canvas
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, 'rgba(66, 153, 225, 0.1)');    // Blue tint
    gradient.addColorStop(1, 'rgba(49, 130, 206, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Configure text
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw title
    ctx.font = 'bold 64px Arial';
    const words = title.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < WIDTH - 100) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    // Draw each line of the title
    const lineHeight = 80;
    const totalHeight = lines.length * lineHeight;
    const startY = (HEIGHT - totalHeight) / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, WIDTH / 2, startY + i * lineHeight);
    });

    // Draw author
    ctx.font = '32px Arial';
    ctx.fillText(author, WIDTH / 2, HEIGHT - 80);

    // Return buffer
    return canvas.toBuffer('image/png');
}
