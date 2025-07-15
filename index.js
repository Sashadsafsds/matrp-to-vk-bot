const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const VK_TOKEN = 'vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ';
const VK_API_URL = 'https://api.vk.com/method/messages.send';

app.post('/send', async (req, res) => {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
        return res.status(400).send('Missing user_id or message');
    }

    const params = new URLSearchParams({
        access_token: VK_TOKEN,
        v: '5.131',
        user_id,
        message,
        random_id: Math.floor(Math.random() * 1e6)
    });

    try {
        const response = await fetch(`${VK_API_URL}?${params.toString()}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send('VK API Error');
    }
});

app.get('/', (req, res) => {
    res.send('VK Proxy is running ✅');
});

app.listen(PORT, () => {
    console.log(`VK proxy running on port ${PORT}`);
});
