import axios from 'axios';

export default async function handler(req, res) {
  const { url, ...restQuery } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing required "url" query parameter' });
  }

  try {
    const axiosResponse = await axios({
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: undefined, // avoid host header conflict
      },
      params: restQuery,
      data: req.body,
    });

    res.status(axiosResponse.status).set(axiosResponse.headers).send(axiosResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      response: error.response?.data || null,
    });
  }
}