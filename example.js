const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Middleware для парсинга JSON тела запросов
app.use(bodyParser.json());

// Секретный ключ для генерации токенов
const secretKey = 'yourSecretKey';

// Настройки подключения к базе данных
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'abc123',
  database: 'test1',
};

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// Эндпоинт для логина
app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE login = ? AND password = ?',
      [login, password]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const user = rows[0];

    const token = jwt.sign({ id: user.id, login: user.login }, secretKey, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Авторизация успешна',
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт для регистрации пользователя
app.post('/register', async (req, res) => {
  const { login, password, repeat_password } = req.body;

  if (!login || !password || !repeat_password) {
    return res.status(400).json({ message: 'Логин, пароль и повтор пароля обязательны' });
  }

  if (password !== repeat_password) {
    return res.status(400).json({ message: 'Пароли не совпадают' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Проверка, существует ли уже пользователь с таким логином
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE login = ?',
      [login]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(409).json({ message: 'Пользователь с таким логином уже существует' });
    }

    // Регистрация нового пользователя
    const [result] = await connection.execute(
      'INSERT INTO users (login, password, role) VALUES (?, ?, ?)',
      [login, password, 'CLIENT']
    );

    await connection.end();

    res.status(201).json({
      message: 'Регистрация успешна',
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// CRUD для пользователей
// Получить список пользователей
app.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users');
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить пользователя по ID
app.get('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать пользователя
app.post('/users', authenticateToken, async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO users (login, password) VALUES (?, ?)',
      [login, password]
    );
    await connection.end();

    res.status(201).json({
      message: 'Пользователь создан',
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить пользователя
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { login, password, phone_number, photo } = req.body;

  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  if (photo && photo.length > 65535) {
    return res.status(400).json({ message: 'Фото слишком большое. Максимальная длина — 65535 символов.' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET login = ?, password = ?, phone_number = ?, photo = ? WHERE id = ?',
      [login, password, phone_number, photo, id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ message: 'Пользователь обновлён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить пользователя
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Старт сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
