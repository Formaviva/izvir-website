import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateSocialImage } from '../../../utils/socialImage';
import { imageCache } from '../../../utils/imageCache';

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    
    if (!slug) {
        return new Response('Slug is required', { status: 400 });
    }

    // Check cache first (24 hour cache)
    if (imageCache.exists(slug, { maxAge: 24 * 60 * 60 * 1000 })) {
        const cachedImage = imageCache.get(slug);
        if (cachedImage) {
            return new Response(cachedImage, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            });
        }
    }

    try {
        // Get post data
        const posts = await getCollection('posts');
        const post = posts.find(post => post.slug === slug);
        
        if (!post) {
            return new Response('Post not found', { status: 404 });
        }

        // Generate image
        const image = await generateSocialImage(
            post.data.title,
            post.data.profile || 'Izvir Social'
        );

        // Cache the image
        imageCache.set(slug, image);

        // Return the image
        return new Response(image, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        console.error('Error generating social image:', error);
        return new Response('Error generating image', { status: 500 });
    }
};
