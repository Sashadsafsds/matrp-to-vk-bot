import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Empty message' });
    }

    const token = process.env.VK_TOKEN;
    const user_id = process.env.VK_USER_ID;

    if (!token || !user_id) {
      return res.status(500).json({ error: 'Missing VK_TOKEN or VK_USER_ID in environment' });
    }

    const params = new URLSearchParams({
      user_id,
      message,
      random_id: Math.floor(Math.random() * 1e6).toString(),
      v: '5.199',
      access_token: token
    });

    const vkRes = await fetch('https://api.vk.com/method/messages.send?' + params);
    const vkJson = await vkRes.json();

    if (vkJson.error) {
      return res.status(500).json({ error: 'VK API error', details: vkJson.error });
    }

    return res.status(200).json({ success: true, response: vkJson.response });
  } catch (err) {
    console.error('VK proxy failed:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
