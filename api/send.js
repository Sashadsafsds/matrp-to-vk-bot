import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Empty message' });
  }

  const token = process.env.VK_TOKEN;
  const user_id = process.env.VK_USER_ID;
  const random_id = Math.floor(Math.random() * 1e9);

  const params = new URLSearchParams({
    user_id,
    message,
    random_id,
    v: '5.199',
    access_token: token,
  });

  try {
    const vkResp = await fetch(`https://api.vk.com/method/messages.send?` + params);
    const json = await vkResp.json();
    return res.status(200).json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'VK proxy failed' });
  }
}
