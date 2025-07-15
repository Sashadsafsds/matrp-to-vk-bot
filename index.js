require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const THREAD_URL = process.env.THREAD_URL;
const VK_TOKEN = process.env.VK_TOKEN;
const USER_ID = process.env.VK_USER_ID;
let lastId = null;

async function checkNewMessages() {
  try {
    const res = await axios.get(THREAD_URL);
    const $ = cheerio.load(res.data);
    const posts = $("article.message").toArray();

    if (posts.length === 0) return;

    const lastPost = posts[posts.length - 1];
    const postId = $(lastPost).attr("data-message-id") || $(lastPost).attr("id");

    if (postId === lastId) return;

    const text = $(lastPost).find(".bbWrapper").text().trim();
    if (!text || text.length < 2) return;

    lastId = postId;

    await axios.post(`https://api.vk.com/method/messages.send`, null, {
      params: {
        random_id: Date.now(),
        user_id: USER_ID,
        message: text,
        access_token: VK_TOKEN,
        v: "5.199"
      }
    });

    console.log("✅ Новое сообщение отправлено в VK:", text);

  } catch (err) {
    console.error("❌ Ошибка:", err.message);
  }
}

setInterval(checkNewMessages, 10000); // каждые 10 сек
console.log("🤖 МатРП → VK бот запущен");
