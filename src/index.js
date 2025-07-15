import axios from 'axios';
import * as cheerio from 'cheerio';

const THREAD_URL = 'https://forum.matrp.ru/index.php?threads/28-zaavlenie-na-izmenenie-prefiksa-v-zalobah.1374303/';
const VK_TOKEN = 'vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ';
const VK_USER_ID = 753569419;

async function fetchLastPost() {
  console.log('🌐 Загружаем тему:', THREAD_URL);

  const res = await axios.get(THREAD_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(res.data);
  const messages = $('article.message');
  const last = messages.last();

  const text = last.find('.bbWrapper').text().trim();
  const id = last.attr('data-message-id') || last.attr('id');

  console.log('📨 Последнее сообщение найдено:');
  console.log('🔹 ID:', id);
  console.log('🔹 Текст:', text.slice(0, 200) + (text.length > 200 ? '...' : ''));

  return { text, id };
}

async function sendToVK(message) {
  const res = await axios.post('https://api.vk.com/method/messages.send', null, {
    params: {
      user_id: VK_USER_ID,
      message,
      random_id: Date.now(),
      access_token: VK_TOKEN,
      v: '5.199'
    }
  });

  if (res.data?.error) {
    console.error('❌ VK API ошибка:', res.data.error);
  } else {
    console.log('✅ Отправлено в VK! ID сообщения:', res.data.response);
  }
}

(async () => {
  try {
    const { text, id } = await fetchLastPost();
    if (text && id) {
      await sendToVK(text);
    } else {
      console.log('⚠️ Не удалось извлечь текст или ID');
    }
  } catch (err) {
    console.error('❌ Общая ошибка:', err.message);
  }
})();
