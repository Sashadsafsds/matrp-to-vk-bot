const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

// 🔥 Разрешаем CORS всем (для Tampermonkey)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 👈 Разрешаем все источники
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/send', async (req, res) => {
  const { user_id, message } = req.body;

  try {
    const result = await axios.post(`https://api.vk.com/method/messages.send`, null, {
      params: {
        access_token: "vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ",
        v: "5.199",
        random_id: Date.now(),
        user_id,
        message
      }
    });

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(10000, () => {
  console.log("VK proxy running on port 10000");
});
