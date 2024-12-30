import type { APIRoute } from 'astro';
import { createCanvas } from 'canvas';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ url }) => {
  try {
    // Get the post permalink from query params
    const permalink = url.searchParams.get('post');
    if (!permalink) {
      return new Response('Post permalink is required', { status: 400 });
    }

    // Get all posts and find the matching one
    const posts = await getCollection('posts');
    const post = posts.find(p => p.data.permalink === permalink);
    
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

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

    // Add Izvir logo/branding
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IZVIR', width / 2, 100);

    // Add profile name
    ctx.fillStyle = '#888888';
    ctx.font = '32px Arial';
    ctx.fillText(`@${post.data.profile}`, width / 2, 150);

    // Add post title with gradient
    const titleGradient = ctx.createLinearGradient(0, height / 2 - 100, 0, height / 2 + 100);
    titleGradient.addColorStop(0, '#ffffff');
    titleGradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 64px Arial';

    // Word wrap title
    const words = post.data.title.split(' ');
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
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, startY + i * lineHeight);
    });

    // Add publish date at the bottom
    const publishDate = new Date(post.data.publishDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillStyle = '#888888';
    ctx.font = '32px Arial';
    ctx.fillText(publishDate, width / 2, height - 100);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Return the image
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
