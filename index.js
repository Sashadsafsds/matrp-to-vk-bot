const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send', async (req, res) => {
  const { token, user_id, message } = req.body;

  try {
    const response = await axios.get('https://api.vk.com/method/messages.send', {
      params: {
        access_token: token,
        user_id,
        message,
        random_id: Math.floor(Math.random() * 100000),
        v: '5.131',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'VK API error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VK proxy running on port ${PORT}`);
});
