import axios from 'axios';

const ALLOWED_DOMAINS = ['jsonplaceholder.typicode.com', 'api.example.com']; // 👈 Add your allowed domains here

export default async function handler(req, res) {
  const { url, ...restQuery } = req.query;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  if (!url) {
    return res.status(400).json({ error: 'Missing required "url" query parameter' });
  }

  try {
    // const parsedUrl = new URL(url);
    // if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    //   return res.status(403).json({ error: 'This domain is not allowed.' });
    // }

    // Optional: log the proxy request
    console.log(`[${req.method}] Proxying to ${url}`);

    // Remove problematic headers
    const {
      host, connection, 'content-length': _, ...safeHeaders
    } = req.headers;

    const axiosResponse = await axios({
      method: req.method,
      url,
      headers: safeHeaders,
      params: restQuery,
      data: req.body,
      timeout: 10000, // 10 sec timeout
    });

    // Set response headers (skip problematic ones)
    for (const [key, value] of Object.entries(axiosResponse.headers)) {
      if (key.toLowerCase() === 'transfer-encoding') continue;
      res.setHeader(key, value);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(axiosResponse.status).send(axiosResponse.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    res.status(status).json({
      error: typeof message === 'string' ? message : error.message,
      response: message,
    });
  }
}