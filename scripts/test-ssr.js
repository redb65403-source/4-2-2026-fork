import handler from '../api/ssr.js';

// Mock global fetch
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
    console.log(`[MockFetch] Request to: ${url}`);

    // Mock API response
    if (url === 'https://backend.ascww.org/api/news') {
        return {
            ok: true,
            json: async () => ([
                {
                    id: 123,
                    title: "Test News Title",
                    description: "This is a test description for the news item.",
                    news_images: [{ path: "/test-image.jpg" }]
                }
            ])
        };
    }

    // Mock index.html fetch
    if (url.includes('index.html')) {
        return {
            ok: true,
            text: async () => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Original Title</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
        };
    }

    return originalFetch(url, options);
};

// Mock Response object
class MockResponse {
    constructor() {
        this.headers = {};
        this.statusCode = 200;
        this.body = "";
    }

    setHeader(key, value) {
        this.headers[key] = value;
        return this;
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    send(body) {
        this.body = body;
        return this;
    }
}

async function runTest() {
    console.log("--- Starting SSR Local Test ---");

    const req = {
        query: { id: 123 }
    };
    const res = new MockResponse();

    try {
        await handler(req, res);

        console.log("\n--- Test Result ---");
        console.log(`Status Code: ${res.statusCode}`);

        // Assertions
        const hasTitle = res.body.includes('<title>Test News Title</title>');
        const hasOgTitle = res.body.includes('<meta property="og:title" content="Test News Title" />');
        const hasOgDesc = res.body.includes('This is a test description');
        const hasOgImage = res.body.includes('test-image.jpg');

        if (hasTitle && hasOgTitle && hasOgDesc && hasOgImage) {
            console.log("✅ SUCCESS: All meta tags injected correctly.");
        } else {
            console.error("❌ FAILURE: Missing expected meta tags.");
            if (!hasTitle) console.error("- Missing <title>");
            if (!hasOgTitle) console.error("- Missing og:title");
            if (!hasOgDesc) console.error("- Missing og:description");
            if (!hasOgImage) console.error("- Missing og:image");

            console.log("\nGenerated HTML Preview:");
            console.log(res.body.substring(0, 1000)); // Print first 1000 chars
        }

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error);
    }
}

runTest();
