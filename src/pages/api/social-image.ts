import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateSocialImage } from '../../utils/socialImage';
import { imageCache } from '../../utils/imageCache';

export async function getStaticPaths() {
    const posts = await getCollection('posts');
    const profiles = await getCollection('profiles');
    
    // For posts: /api/social-image/[profile]/[post]
    const postPaths = posts.map(post => ({
        params: { 
            permalink: `${post.data.profile}/${post.data.permalink}`
        }
    }));
    
    // For profiles: /api/social-image/[profile]
    const profilePaths = profiles.map(profile => ({
        params: { 
            permalink: profile.data.permalink
        }
    }));

    return [...postPaths, ...profilePaths];
}

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const permalink = url.searchParams.get('permalink');
    
    console.log('Received permalink:', permalink);
    
    if (!permalink) {
        console.error('Permalink is missing in the query parameters');
        return new Response('Permalink is required', { status: 400 });
    }

    // Check cache first (24 hour cache)
    if (imageCache.exists(permalink, { maxAge: 24 * 60 * 60 * 1000 })) {
        const cachedImage = imageCache.get(permalink);
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
        // Check if this is a profile or a post
        if (!permalink.includes('/')) {
            // This is a profile
            const profiles = await getCollection('profiles');
            const profile = profiles.find(p => p.data.permalink === permalink);
            
            if (!profile) {
                return new Response('Profile not found', { status: 404 });
            }

            const image = await generateSocialImage(
                profile.data.name,
                'Izvir Social Profile'
            );

            // Cache the image
            imageCache.set(permalink, image);

            return new Response(image, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            });
        } else {
            // This is a post
            const posts = await getCollection('posts');
            const [profile, postPermalink] = permalink.split('/');
            const post = posts.find(p => p.data.profile === profile && p.data.permalink === postPermalink);
            
            if (!post) {
                return new Response('Post not found', { status: 404 });
            }

            const image = await generateSocialImage(
                post.data.title,
                post.data.profile || 'Izvir Social'
            );

            // Cache the image
            imageCache.set(permalink, image);

            return new Response(image, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            });
        }
    } catch (error) {
        console.error('Error generating social image:', error);
        return new Response('Error generating image', { status: 500 });
    }
};
