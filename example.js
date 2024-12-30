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

    const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, secretKey, { expiresIn: '1h' });

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
    const [rows] = await connection.execute('SELECT * FROM users WHERE role = "CLIENT"');
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

  if (req.user.id !== parseInt(id) && req.user.role != 'ADMIN') {
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

app.post('/services', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { name, price, photo, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO services (name, price, photo, description) VALUES (?, ?, ?, ?)',
      [name, price, photo || null, description || null]
    );
    await connection.end();

    res.status(201).json({ message: 'Услуга создана', service_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/services/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { id } = req.params;
  const { name, price, photo, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE services SET name = ?, price = ?, photo = ?, description = ? WHERE id = ?',
      [name, price, photo || null, description || null, id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }

    res.status(200).json({ message: 'Услуга обновлена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/services/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM services WHERE id = ?', [id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }

    res.status(200).json({ message: 'Услуга удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/services', authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM services');
    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM services WHERE id = ?', [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Услуга не найдена' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/masters', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  const { login, password, first_name, last_name, rate_of_salary, work_experience, brief_information, services } = req.body;

  if (!login || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Логин, пароль, имя и фамилия обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Создать мастера в таблице `users`
    const [userResult] = await connection.execute(
      'INSERT INTO users (login, password, role) VALUES (?, ?, ?)',
      [login, password, 'MASTER']
    );

    // Создать детали мастера в таблице `master_details`
    const [masterResult] = await connection.execute(
      'INSERT INTO master_details (user_id, first_name, last_name, rate_of_salary, work_experience, brief_information) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, first_name, last_name, rate_of_salary || 0, work_experience || 0, brief_information || null]
    );

    // Добавить услуги в `master_services`, если указаны
    if (services && Array.isArray(services)) {
      const serviceValues = services.map(serviceId => [userResult.insertId, serviceId]);
      await connection.query(
        'INSERT INTO master_services (master_id, service_id) VALUES ?',
        [serviceValues]
      );
    }

    await connection.end();

    res.status(201).json({ message: 'Мастер создан', master_id: masterResult.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/masters/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  const { id } = req.params;
  const { first_name, last_name, rate_of_salary, work_experience, brief_information, services } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Обновить информацию о мастере
    const [updateResult] = await connection.execute(
      'UPDATE master_details SET first_name = ?, last_name = ?, rate_of_salary = ?, work_experience = ?, brief_information = ? WHERE user_id = ?',
      [first_name, last_name, rate_of_salary, work_experience, brief_information, id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастер не найден' });
    }

    // Обновить список услуг мастера
    if (services && Array.isArray(services)) {
      // Удалить старые записи
      await connection.execute('DELETE FROM master_services WHERE master_id = ?', [id]);

      // Добавить новые записи
      const serviceValues = services.map(serviceId => [id, serviceId]);
      if (serviceValues.length > 0) {
        await connection.query('INSERT INTO master_services (master_id, service_id) VALUES ?', [serviceValues]);
      }
    }

    await connection.end();

    res.status(200).json({ message: 'Информация о мастере и список услуг обновлены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


app.delete('/masters/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM master_details WHERE user_id = ?', [id]);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Мастер не найден' });
    }

    res.status(200).json({ message: 'Мастер удалён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/masters/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Получение информации о мастере
    const [masterRows] = await connection.execute(
      'SELECT u.id AS user_id, u.login, md.first_name, md.last_name, md.rate_of_salary, md.work_experience, md.brief_information ' +
      'FROM users u ' +
      'JOIN master_details md ON u.id = md.user_id ' +
      'WHERE u.id = ? AND u.role = "MASTER"',
      [id]
    );

    if (masterRows.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастер не найден' });
    }

    // Получение списка услуг мастера
    const [serviceRows] = await connection.execute(
      'SELECT s.id, s.name, s.price, s.description FROM master_services ms ' +
      'JOIN services s ON ms.service_id = s.id ' +
      'WHERE ms.master_id = ?',
      [id]
    );

    await connection.end();

    // Формирование ответа
    const masterData = {
      ...masterRows[0],
      services: serviceRows,
    };

    res.status(200).json(masterData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});



app.get('/masters', authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT ' +
      'u.id AS user_id, ' +
      'u.login, ' +
      'md.first_name, ' +
      'md.last_name, ' +
      'md.rate_of_salary, ' +
      'md.work_experience, ' +
      'md.brief_information, ' +
      'IFNULL(JSON_ARRAYAGG(JSON_OBJECT("id", s.id, "name", s.name, "price", s.price, "description", s.description)), JSON_ARRAY()) AS services ' +
      'FROM users u ' +
      'JOIN master_details md ON u.id = md.user_id ' +
      'LEFT JOIN master_services ms ON u.id = ms.master_id ' +
      'LEFT JOIN services s ON ms.service_id = s.id ' +
      'WHERE u.role = "MASTER" ' +
      'GROUP BY u.id, u.login, md.first_name, md.last_name, md.rate_of_salary, md.work_experience, md.brief_information'
    );

    await connection.end();

    res.status(200).json(rows.map(row => ({
      ...row,
      services: Array.isArray(row.services) ? row.services : JSON.parse(row.services || '[]')
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});





app.post('/masters/:id/services', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { id } = req.params;
  const { service_id } = req.body;

  if (!service_id) {
    return res.status(400).json({ message: 'ID услуги обязателен' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO master_services (master_id, service_id) VALUES (?, ?)',
      [id, service_id]
    );

    await connection.end();

    res.status(201).json({ message: 'Услуга добавлена мастеру' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/masters/:id/services', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT s.id, s.name, s.price, s.description FROM master_services ms JOIN services s ON ms.service_id = s.id WHERE ms.master_id = ?',
      [id]
    );

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/masters/:id/services/:service_id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  const { id, service_id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'DELETE FROM master_services WHERE master_id = ? AND service_id = ?',
      [id, service_id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Услуга не найдена у мастера' });
    }

    res.status(200).json({ message: 'Услуга удалена у мастера' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});





// Старт сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
