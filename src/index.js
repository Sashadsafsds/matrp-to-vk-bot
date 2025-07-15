import axios from 'axios';
import cheerio from 'cheerio';

const VK_TOKEN = process.env.VK_TOKEN;
const VK_USER_ID = process.env.VK_USER_ID;
const THREAD_URL = process.env.THREAD_URL;
const LAST_ID_URL = 'https://raw.githubusercontent.com/<user>/<repo>/main/last_id.txt'; // заменим

async function getLastId() {
  try {
    const res = await axios.get(LAST_ID_URL);
    return res.data.trim();
  } catch {
    return null;
  }
}

async function saveLastId(id) {
  const fs = await import('fs/promises');
  await fs.writeFile('last_id.txt', id, 'utf8');
}

async function fetchLastPost() {
  const { data } = await axios.get(THREAD_URL);
  const $ = cheerio.load(data);
  const messages = $('article.message');
  const last = messages.last();
  const text = last.find('.bbWrapper').text().trim();
  const id = last.attr('data-message-id') || last.attr('id');
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
  return res.data;
}

(async () => {
  try {
    const lastStoredId = await getLastId();
    const { text, id } = await fetchLastPost();

    if (id && id !== lastStoredId) {
      console.log('📬 Новое сообщение:', text.slice(0, 100));
      await sendToVK(text);
      await saveLastId(id);
    } else {
      console.log('✅ Новых сообщений нет');
    }
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
  }
})();
