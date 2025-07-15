import axios from 'axios';
import * as cheerio from 'cheerio';

// 🔒 Константы
const THREAD_URL = 'https://forum.matrp.ru/index.php?threads/28-zaavlenie-na-izmenenie-prefiksa-v-zalobah.1374303/';
const VK_TOKEN = 'vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ';
const VK_USER_ID = '753569419';

// 🍪 Cookie для авторизации
const COOKIE = 'xf_push_notice_dismiss=1; _ym_uid=1745945902582005262; _ym_d=1745945902; xf_th_uix_widthToggle=fixed; xf_tfa_trust=dZG1eEhgcuDj2x6M0BvEOSAFhUCHKymT; xf_user=75463%2C-lZbVl1DR7rj9Bp8yCkjtNRQpQ_yT57zblV8W7SN; ajs_anonymous_id=%223a4bceb7-3c46-421b-ae51-2dc4a6be1cef%22; xf_th_uix_sidebarCollapsed=0; xf_csrf=2DRWxCMzfbMpchib; __lhash_=39c503d4f60fa61286e8c4e0c0b70909; xf_session=vbgYGH16hfMFzQmoyVkzAZ6rkYCqEkH4; __hash_=36d67b4960ea1debe7988d58cc00aea6';

// 🔧 Создаём клиент с правильными заголовками
const axiosClient = axios.create({
  headers: {
    'Cookie': COOKIE,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ru,en;q=0.9',
    'Connection': 'keep-alive',
    'Referer': 'https://forum.matrp.ru/',
    'Upgrade-Insecure-Requests': '1'
  },
  maxRedirects: 0, // 👈 отключим редиректы для проверки
  validateStatus: status => status >= 200 && status < 400
});

async function fetchLastPost() {
  console.log('🌐 Загружаем тему:', THREAD_URL);

  const response = await axiosClient.get(THREAD_URL);

  // 👀 Если идёт редирект — покажем куда
  if (response.status >= 300 && response.status < 400 && response.headers.location) {
    console.warn('⚠️ Редирект на:', response.headers.location);
    throw new Error('Получен редирект — возможно, не авторизован');
  }

  const $ = cheerio.load(response.data);
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
