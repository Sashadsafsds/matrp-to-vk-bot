export default async function handler(req, res) {
  const { peer_id, message, token } = req.body;

  if (!peer_id || !message || !token) {
    return res.status(400).json({ error: 'Missing peer_id, message or token' });
  }

  const vkUrl = `https://api.vk.com/method/messages.send?peer_id=${peer_id}&message=${encodeURIComponent(message)}&random_id=${Date.now()}&access_token=${token}&v=5.199`;

  try {
    const response = await fetch(vkUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'VK API error', details: error.message });
  }
}
