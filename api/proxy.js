import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

const proxy = createProxyMiddleware({
    target: 'https://backend.ascww.org/api',
    changeOrigin: true,
    secure: false, // Ignore self-signed or invalid certs just in case
    pathRewrite: {
        '^/api/proxy': '', // remove base path
    },
    onProxyRes: (proxyRes, req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    },
});

export default function handler(req, res) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return proxy(req, res);
}
