import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
    const { id } = request.query;

    // Configuration - Use Environment Variables
    const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://backend.ascww.org/api';
    const API_URL = `${API_BASE_URL}/news`;
    const IMAGE_BASE_URL = `${API_BASE_URL}/news/image/`;
    const SITE_URL = process.env.VITE_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');

    // List of proxies to try
    // We prioritize keeping the original structure but routed through a proxy
    const PROXIES = [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/',
    ];

    /**
     * Tries to fetch from multiple sources in parallel (Direct + Proxies)
     * Returns the first successful response.
     */
    const fetchNewsData = async () => {
        const fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'application/json'
            }
        };

        const promises = [];

        // 1. Direct Fetch
        promises.push(
            fetch(API_URL, fetchOptions)
                .then(res => {
                    if (!res.ok) throw new Error(`Direct failed: ${res.status}`);
                    return res.json();
                })
        );

        // 2. Proxy Fetches (Add a few reliable ones)
        PROXIES.forEach(proxy => {
            const proxyUrl = `${proxy}${encodeURIComponent(API_URL)}`;
            promises.push(
                fetch(proxyUrl, fetchOptions)
                    .then(res => {
                        if (!res.ok) throw new Error(`Proxy ${proxy} failed: ${res.status}`);
                        return res.json();
                    })
            );
        });

        // Race them! First one to resolve successfully wins.
        try {
            return await Promise.any(promises);
        } catch (error) {
            console.error('[SSR] All fetch attempts failed:', error.errors);
            throw new Error('Failed to fetch news from any source');
        }
    };

    /**
     * Wraps an image URL in a public caching proxy to ensure visibility
     * even if the origin server blocks bots/crawlers.
     */
    const proxifyImage = (imageUrl) => {
        // wsrv.nl is a reliable, free image proxy/CDN (formerly images.weserv.nl)
        // We assume the imageUrl is absolute.
        return `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&output=jpg`;
    };

    // Default Meta Data
    const defaultMeta = {
        title: "شركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد",
        description: "الموقع الرسمي لشركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد - تابع أحدث الأخبار والخدمات",
        image: `${SITE_URL}/logo.png`,
        url: SITE_URL
    };

    let meta = defaultMeta;

    try {
        const newsList = await fetchNewsData();
        const newsItem = newsList.find(item => item.id == id);

        if (newsItem) {
            // Clean description by stripping HTML tags
            const rawDescription = newsItem.description || defaultMeta.description;
            const cleanDescription = rawDescription
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            const originalImageUrl = newsItem.news_images && newsItem.news_images.length > 0
                ? IMAGE_BASE_URL + (newsItem.news_images[0].path.startsWith('/') ? newsItem.news_images[0].path.slice(1) : newsItem.news_images[0].path)
                : defaultMeta.image;

            // USE PROXIED IMAGE for Og Tags to bypass backend blocking
            const finalImage = originalImageUrl !== defaultMeta.image
                ? proxifyImage(originalImageUrl)
                : defaultMeta.image;

            meta = {
                title: newsItem.title,
                description: cleanDescription,
                image: finalImage,
                url: `${SITE_URL}/news/${id}`
            };
        } else {
            console.warn(`[SSR] News ID ${id} not found in list`);
            meta.title = `News Not Found: ${id}`;
        }

    } catch (error) {
        console.error('[SSR] Failed to fetch news data:', error);
        // Keep default meta
    }

    try {
        // 2. Try to get index.html
        let html = null;

        try {
            const possiblePaths = [
                path.join(process.cwd(), 'dist', 'index.html'),
                path.join(process.cwd(), 'index.html'),
                path.join(process.cwd(), 'public', 'index.html')
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    html = fs.readFileSync(p, 'utf-8');
                    break;
                }
            }
        } catch (fsError) {
            console.warn('FS Read failed, falling back to fetch:', fsError);
        }

        if (!html) {
            const indexRes = await fetch(`${SITE_URL}/index.html`, {
                headers: { 'User-Agent': 'Vercel-SSR-Function' }
            });
            if (indexRes.ok) {
                html = await indexRes.text();
            } else {
                throw new Error(`Failed to fetch index.html: ${indexRes.status}`);
            }
        }

        // 3. Inject Meta Tags into real HTML

        // Clean description for safe injection
        const safeDescription = meta.description
            .substring(0, 200)
            .replace(/"/g, '&quot;');

        // Remove ALL existing meta tags to prevent duplicates
        html = html.replace(/<title>.*?<\/title>/s, '');
        html = html.replace(/<meta property="og:[^"]*"[^>]*>/g, '');
        html = html.replace(/<meta name="twitter:[^"]*"[^>]*>/g, '');

        // Inject fresh, clean tags with Facebook-required image properties
        const metaTags = `
            <title>${meta.title}</title>
            <meta property="og:title" content="${meta.title}" />
            <meta property="og:description" content="${safeDescription}" />
            <meta property="og:image" content="${meta.image}" />
            <meta property="og:image:secure_url" content="${meta.image}" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="${meta.title}" />
            <meta property="og:url" content="${meta.url}" />
            <meta property="og:type" content="article" />
            <meta property="og:site_name" content="شركة مياه الشرب والصرف الصحي بأسيوط" />
            <meta property="og:locale" content="ar_AR" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${meta.title}" />
            <meta name="twitter:description" content="${safeDescription}" />
            <meta name="twitter:image" content="${meta.image}" />`;

        html = html.replace('</head>', `${metaTags}</head>`);

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).send(html);

    } catch (error) {
        console.error('SSR Error:', error);

        // 4. FALLBACK: Return minimal HTML with correct meta tags
        const safeDescription = meta.description
            .substring(0, 200)
            .replace(/"/g, '&quot;');

        const fallbackHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${meta.title}</title>
                <meta property="og:title" content="${meta.title}" />
                <meta property="og:description" content="${safeDescription}" />
                <meta property="og:image" content="${meta.image}" />
                <script>window.location.href = "/?redirect=/news/${id}";</script>
            </head>
            <body>
                <h1>جاري التحويل...</h1>
                <p><a href="/?redirect=/news/${id}">اضغط هنا إذا لم يتم التحويل تلقائياً</a></p>
            </body>
            </html>
        `;
        return response.status(200).send(fallbackHtml);
    }
}
