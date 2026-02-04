import https from 'https';

const url = 'https://backend.ascww.org/api/news/image/e00babfc-b09e-4671-9ad6-c883ab88a9dd.jpg';

console.log(`Checking image: ${url}`);

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Content Type:', res.headers['content-type']);

    if (res.statusCode === 200) {
        console.log('✅ Image exists and is accessible!');
    } else {
        console.error('❌ Image not accessible. Status:', res.statusCode);
    }
}).on('error', (e) => {
    console.error('❌ Error checking image:', e);
});
