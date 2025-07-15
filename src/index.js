import axios from 'axios';
import * as cheerio from 'cheerio';

const VK_TOKEN = process.env.VK_TOKEN;
const VK_USER_ID = process.env.VK_USER_ID;
const THREAD_URL = process.env.THREAD_URL;

async function fetchLastPost() {
  const { data } = await axios.get(THREAD_URL);
  const $ = cheerio.load(data);
  const messages = $('article.message');
  const last = messages.last();

  const text = last.find('.bbWrapper').text().trim();
  const id = last.attr('data-message-id') || last.attr('id');

  console.log('🧵 Последнее сообщение найдено:');
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

  if (res.data.error) {
    console.error('❌ VK API ошибка:', res.data.error);
  } else {
    console.log('✅ Сообщение успешно отправлено в VK:', res.data.response);
  }
}

(async () => {
  try {
    const { text, id } = await fetchLastPost();
    if (text && id) {
      await sendToVK(text);
    } else {
      console.log('⚠️ Не удалось извлечь сообщение или ID');
    }
  } catch (err) {
    console.error('❌ Общая ошибка:', err.message);
  }
})();
