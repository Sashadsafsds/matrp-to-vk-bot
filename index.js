import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const VK_TOKEN = 'vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ';

app.use(express.json());

app.post('/send', async (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ error: 'Missing user_id or message' });
  }

  const params = new URLSearchParams({
    user_id: user_id,
    message: message,
    random_id: Date.now().toString(),
    access_token: VK_TOKEN,
    v: '5.199'
  });

  try {
    const vkRes = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      body: params
    });
    const data = await vkRes.json();
    res.json(data);
  } catch (error) {
    console.error('[VK Error]', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`VK Proxy Server running on port ${PORT}`);
});
