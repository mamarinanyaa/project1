// импорт стандартных библиотек Node.js
const { readFileSync } = require("fs");
const { createServer } = require("http");


// файл для базы данных
const DB_TEXT = process.env.DB_TEXT || "./db_text.json";
const DB_IMG = process.env.DB_IMG || "./db_img.json";
const DB_HOLIDAY = process.env.DB_HOLIDAY || "./db_holiday.json";
// номер порта, на котором будет запущен сервер
const PORT = process.env.PORT || 3024;
// префикс URI для всех методов приложения
const URI_PREFIX = "/api";

/**
 * Класс ошибки, используется для отправки ответа с определённым кодом и описанием ошибки
 */
class ApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

function arrayRandElement(arr) {
  const rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
}

function getList() {
  return JSON.parse(readFileSync(DB_HOLIDAY) || "[]");
}

function getHolidayText(cat) {
  const textObj = JSON.parse(readFileSync(DB_TEXT) || "[]");
  return arrayRandElement(textObj[cat]);
}

function getHolidayImg(cat) {
  const imageObj = JSON.parse(readFileSync(DB_IMG) || "[]");
  const img = arrayRandElement(imageObj[cat]);
  return {
    idImg: img.slice(0, -4),
    urlImg: `http://localhost:3024/img/${img}`,
  }
}

function getRandomItem(cat) {
  return { ...getHolidayText(cat), ...getHolidayImg(cat) };
}

function getTextId(itemId) {
  const textObj = JSON.parse(readFileSync(DB_TEXT) || "[]");
  let item = null;

  for (const key in textObj) {
    if (Object.hasOwnProperty.call(textObj, key)) {
      const arr = textObj[key];
      for (const obj of arr) {
        if (obj.idText === itemId) {
          item = obj;
          break;
        }
      }

      if (item) break;
    }
  }

  if (!item) throw new ApiError(404, { message: "Item Not Found" });
  return item;
}

function getImgId(itemId) {
  const imgObj = JSON.parse(readFileSync(DB_IMG) || "[]");
  let img = null;

  for (const key in imgObj) {
    if (Object.hasOwnProperty.call(imgObj, key)) {
      const arr = imgObj[key];
      for (const str of arr) {
        if (str.includes(itemId)) {
          img = str;
          break;
        }
      }

      if (img) break;
    }
  }

  if (!img) throw new ApiError(404, { message: "Item Not Found" });
  return {
    idImg: img.slice(0, -4),
    urlImg: `http://localhost:${PORT}/img/${img}`,
  }
}

// создаём HTTP сервер, переданная функция будет реагировать на все запросы к нему
module.exports = server = createServer(async (req, res) => {

  // req - объект с информацией о запросе, res - объект для управления отправляемым ответом
  if  (req.url.includes('img')) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    require("fs").readFile(`.${req.url}`, (err, image) => {
      res.end(image);
    });
    return;
  }
  // этот заголовок ответа указывает, что тело ответа будет в JSON формате
  res.setHeader("Content-Type", "application/json");

  // CORS заголовки ответа для поддержки кросс-доменных запросов из браузера
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
  // в этом случае достаточно ответить с пустым телом и этими заголовками
  if (req.method === "OPTIONS") {
    // end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

  // если URI не начинается с нужного префикса - можем сразу отдать 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not Found" }));
    return;
  }

  // убираем из запроса префикс URI, разбиваем его на путь и параметры
  const [uri, query] = req.url.substring(URI_PREFIX.length).split("?");
  const queryParams = {};
  // параметры могут отсутствовать вообще или иметь вид a=b&b=c
  // во втором случае наполняем объект queryParams { a: 'b', b: 'c' }
  if (query) {
    for (const piece of query.split("&")) {
      const [key, value] = piece.split("=");
      queryParams[key] = value ? decodeURIComponent(value) : "";
    }
  }

  try {
    // обрабатываем запрос и формируем тело ответа
    const body = await (async () => {
      if (uri === "" || uri === "/") {
        return getList();
      }

      const holiday = Object.keys(getList()).find((item) => item === uri.substring(1));

      if (holiday) {
        return getRandomItem(holiday);
      }

      if (uri.includes("/text/")) {
        const holiday = Object.keys(getList()).find((item) => item === uri.substring(6));
        if (holiday) {
          return getHolidayText(holiday);
        } else {
          const itemId = uri.substring(6);
          return getTextId(itemId);
        }
      }

      if (uri.includes("/image/")) {
        const holiday = Object.keys(getList()).find((item) => item === uri.substring(7));
        if (holiday) {
          return getHolidayImg(holiday);
        } else {
          const itemId = uri.substring(7);
          return getImgId(itemId);
        }
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    console.log("err: ", err);
    // обрабатываем сгенерированную нами же ошибку
    if (err instanceof ApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Server Error" }));
    }
  }
})
  // выводим инструкцию, как только сервер запустился...
  .on("listening", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `Сервер CRM запущен. Вы можете использовать его по адресу http://localhost:${PORT}`
      );
      console.log("Нажмите CTRL+C, чтобы остановить сервер");
      console.log("Доступные методы:");
      console.log(`GET ${URI_PREFIX} - получить список праздников`);
      console.log(
        `GET ${URI_PREFIX}/{title_holiday} - получить случайное поздравление к празднику (текст и картинку)`
      );
      console.log(
        `GET ${URI_PREFIX}/text/{title_holiday} - получить случайный текст к празднику`
      );
      console.log(
        `GET ${URI_PREFIX}/text/{id} - получить поздравление по его ID`
      );
      console.log(
        `GET ${URI_PREFIX}/image/{title_holiday} - получить случайное изображение к празднику`
      );
      console.log(`GET ${URI_PREFIX}/{id} - получить поздравление по его ID`);
    }
  })
  // ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
