


const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware для парсинга JSON тела запросов
app.use(bodyParser.json());

// Пример пользователей (в реальном проекте данные будут из базы данных)
let users = [
  { login: 'user123', password: 'securePassword123', id: '12345' },
];

// Секретный ключ для генерации токенов
const secretKey = 'yourSecretKey';

// Эндпоинт для логина
app.post('/login', (req, res) => {
  const { login, password } = req.body;

  // Проверка наличия логина и пароля
  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  // Поиск пользователя по логину
  const user = users.find((u) => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Пользователь не найден' });
  }

  // Генерация токена
  const token = jwt.sign({ id: user.id, login: user.login }, secretKey, { expiresIn: '1h' });

  // Ответ с успешной авторизацией
  res.status(200).json({
    message: 'Авторизация успешна',
    token: `Bearer ${token}`,
  });
});

// Эндпоинт для регистрации пользователя
app.post('/register', (req, res) => {
  const { login, password, repeat_password } = req.body;

  // Проверка наличия всех обязательных полей
  if (!login || !password || !repeat_password) {
    return res.status(400).json({ message: 'Логин, пароль и повтор пароля обязательны' });
  }

  // Проверка совпадения паролей
  if (password !== repeat_password) {
    return res.status(400).json({ message: 'Пароли не совпадают' });
  }

  // Проверка, существует ли уже пользователь с таким логином
  const existingUser = users.find((user) => user.login === login);
  if (existingUser) {
    return res.status(409).json({ message: 'Пользователь с таким логином уже существует' });
  }

  // Регистрация нового пользователя
  const newUser = { login, password, id: String(users.length + 1) };
  users.push(newUser);

  // Ответ с успешной регистрацией
  res.status(201).json({
    message: 'Регистрация успешна',
    user_id: newUser.id,
  });
});

// Старт сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


