import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables based on mode
const mode = process.env.NODE_ENV || 'production';
const envFile = mode === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fallback to .env if .env.production is missing/empty variables
dotenv.config();

const API_URL = process.env.VITE_API_BASE_URL ? `${process.env.VITE_API_BASE_URL}/news` : 'https://backend.ascww.org/api/news';
const IMAGE_BASE_URL = process.env.VITE_API_BASE_URL ? `${process.env.VITE_API_BASE_URL}/news/image/` : 'https://backend.ascww.org/api/news/image/';
const SITE_URL = process.env.VITE_SITE_URL || 'http://localhost:5173';

console.log(`🔧 Configuration:
- API: ${API_URL}
- Site URL: ${SITE_URL}
- Mode: ${mode}
- Env File: ${envFile}`);

// قالب HTML
const createNewsPage = (news) => {
    const title = news.title || 'خبر';
    const description = (news.description || '').replace(/<[^>]*>/g, '').substring(0, 200);
    const image = news.news_images && news.news_images.length > 0
        ? IMAGE_BASE_URL + news.news_images[0].path.replace(/^\//, '')
        : `${SITE_URL}/logo.png`;

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>${title} - شركة مياه أسيوط</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="شركة مياه الشرب والصرف الصحي بأسيوط">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${SITE_URL}/news/${news.id}">
  <meta property="og:locale" content="ar_AR">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Redirect to React App -->
  <meta http-equiv="refresh" content="0;url=/?redirect=/news/${news.id}">
  <script>
    window.location.href = '/?redirect=/news/${news.id}';
  </script>
</head>
<body>
  <h1>${title}</h1>
  <p>جاري التحويل...</p>
  <a href="/?redirect=/news/${news.id}">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
</body>
</html>`;
};

// جلب الأخبار وإنشاء الصفحات
async function generatePages() {
    try {
        console.log('🔄 جاري جلب الأخبار من API...');
        const response = await fetch(API_URL);
        const newsList = await response.json();

        console.log(`✅ تم جلب ${newsList.length} خبر`);

        // إنشاء مجلد news في dist
        const newsDir = path.join(process.cwd(), 'dist', 'news');
        if (!fs.existsSync(newsDir)) {
            fs.mkdirSync(newsDir, { recursive: true });
        }

        // إنشاء صفحة لكل خبر
        let created = 0;
        for (const news of newsList) {
            const newsPageDir = path.join(newsDir, String(news.id));
            if (!fs.existsSync(newsPageDir)) {
                fs.mkdirSync(newsPageDir, { recursive: true });
            }

            const htmlContent = createNewsPage(news);
            const htmlPath = path.join(newsPageDir, 'index.html');
            fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
            created++;

            console.log(`✅ تم إنشاء: /news/${news.id}/index.html`);
        }

        console.log(`\n🎉 تم بنجاح! تم إنشاء ${created} صفحة`);
        console.log('📋 الخطوة التالية: ارفع مجلد dist على السيرفر');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        process.exit(1);
    }
}

generatePages();
