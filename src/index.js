import axios from 'axios';
import * as cheerio from 'cheerio';
import 'dotenv/config';


// 🔒 Константы
const THREAD_URL = 'https://forum.matrp.ru/index.php?threads/28-zaavlenie-na-izmenenie-prefiksa-v-zalobah.1374303/';
const VK_TOKEN = 'vk1.a.F3Zjpr-ACP9y4IGgB718zAUCTQUci4jeRkw04gctIKdOSD_406C7BJh7w1qzKGT6junxgDnni3yg2prsgXr_ANuVnWwOwNikTg3fEyRLYnFt-85i62uEw8mWxLLOfQpyOH3x5hmW8imKVIeWl1cJWOGW7LmlsJoSXQRJuMKLUsh8kQObgJc1asHNhrtscv7w3s53UzCk0PWr19jz2j42yQ';
const VK_USER_ID = '753569419';

// 🍪 Актуальный Cookie
const COOKIE = 'xf_push_notice_dismiss=1; _ym_uid=1745945902582005262; _ym_d=1745945902; xf_th_uix_widthToggle=fixed; xf_tfa_trust=dZG1eEhgcuDj2x6M0BvEOSAFhUCHKymT; xf_user=75463%2C-lZbVl1DR7rj9Bp8yCkjtNRQpQ_yT57zblV8W7SN; ajs_anonymous_id=%223a4bceb7-3c46-421b-ae51-2dc4a6be1cef%22; xf_th_uix_sidebarCollapsed=0; __lhash_=39c503d4f60fa61286e8c4e0c0b70909; xf_csrf=js_BA8ZTNEaorP4A; __hash_=19130164d5af1e152796c32ee9f98ffe; xf_session=oxIwn81uzbt8A_oF0qr9lTk_UUa6puxV';

async function fetchLastPost() {
  console.log('🌐 Загружаем тему:', THREAD_URL);

  const res = await axios.get(THREAD_URL, {
    headers: {
      'Cookie': COOKIE,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    },
    maxRedirects: 0,
    validateStatus: status => status >= 200 && status < 400
  });

  // ⛔ Явный редирект на логин
  if (res.status === 302 && res.headers.location?.includes('/login')) {
    throw new Error('❌ Получен редирект на /login — куки истекли или недействительны');
  }

  // ⚠ Проверка: страница доступна, но в ней нет сообщений (возможно, заглушка "Вход / Регистрация")
  if (!res.data.includes('class="message"')) {
    console.warn('⚠ Страница не содержит сообщений. Возможна потеря авторизации.');
    console.log('🔍 Фрагмент страницы:\n' + res.data.slice(0, 300));
    throw new Error('⚠ Не удалось найти сообщения. Возможно, куки просрочены.');
  }

  const $ = cheerio.load(res.data);
  const messages = $('article.message');
  const last = messages.last();

  const text = last.find('.bbWrapper').text().trim();
  const id = last.attr('data-message-id') || last.attr('id');

  if (!text || !id) {
    throw new Error('⚠️ Не удалось извлечь сообщение или ID');
  }

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
    await sendToVK(text);
  } catch (err) {
    console.error('❌ Общая ошибка:', err.message);
  }
})();
