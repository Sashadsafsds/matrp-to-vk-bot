export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, token, message } = req.body;

  if (!user_id || !token || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const response = await fetch(`https://api.vk.com/method/messages.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        user_id,
        access_token: token,
        message,
        v: '5.131',
        random_id: Date.now().toString()
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'VK request failed', details: err.message });
  }
}
