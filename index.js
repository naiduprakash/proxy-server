import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

// Middleware to parse all body types
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy handler
app.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing required "url" query parameter' });
  }

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: undefined, // remove host to avoid conflict
      },
      params: req.query, // include original query params (can be filtered if needed)
      data: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});