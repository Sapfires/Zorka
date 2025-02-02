const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware для парсинга JSON тела запросов
app.use(bodyParser.json());

app.use(cors());

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

    const token = jwt.sign({ id: user.id, login: user.login, role: user.role, blocked: user.blocked }, secretKey, { expiresIn: '1h' });
    if(!user.blocked) {
      res.status(200).json({
        message: 'Авторизация успешна',
        token: `Bearer ${token}`,
      });
    } else {
      res.status(400).json({message:'Пользователь заблокирован'});
    }
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

  if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
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
  const { login, password, first_name, last_name, phone_number, photo } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO users (login, password, first_name, last_name, photo) VALUES (?, ?, ?, ?, ?)',
      [login, password, first_name, last_name, phone_number, photo || null]
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


// Обработчик для изменения состояния записи в service_process
app.patch('/service-process/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; // Получаем ID из URL
  const { status} = req.body;

  // Проверка на наличие обязательных данных
  if (!status) {
    return res.status(400).json({ message: 'Статус обязателен' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Запрос для обновления состояния записи
    const [result] = await connection.execute(
        'UPDATE service_process SET status = ?  WHERE id = ?',
        [status, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Процесс услуги не найден' });
    }

    res.status(200).json({ message: 'Процесс услуги обновлен успешно' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить пользователя
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { login, password, phone_number, first_name, last_name, photo } = req.body;
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
      'UPDATE users SET login = ?, password = ?, phone_number = ?, first_name = ?, last_name = ? , photo = ? WHERE id = ?',
      [login, password, phone_number, first_name, last_name, photo, id]
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


// Обновить пользователя
app.put('/users/lock/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }


  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'UPDATE users SET  blocked = ? WHERE id = ?',
        [blocked, id]
    );
    await connection.end();


    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ message: 'Пользователь' + (blocked? ' заблокирован' : ' разблокирован')});
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
  const { name, price, photo, description, duration } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO services (name, price, photo, description, duration) VALUES (?, ?, ?, ?, ?)',
      [name, price, photo || null, description || null, duration || null]
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
  const { name, price, photo, description, duration } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE services SET name = ?, price = ?, photo = ?, description = ?, duration = ? WHERE id = ?',
      [name, price, photo || null, description || null, duration || null, id]
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



  const { login, password, first_name, last_name, rate_of_salary, work_experience, brief_information, working_hours, photo } = req.body;

  if (!login || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Логин, пароль, имя и фамилия обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [userResult] = await connection.execute(
      'INSERT INTO users (login, password, role) VALUES (?, ?, ?)',
      [login, password, 'MASTER']
    );

    const [masterResult] = await connection.execute(
      'INSERT INTO master_details (user_id, first_name, last_name, rate_of_salary, work_experience, brief_information, working_hours, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userResult.insertId,
        first_name,
        last_name,
        rate_of_salary || 0,
        work_experience || 0,
        brief_information || null,
        working_hours || '09:00-18:00',
        photo || null
      ]
    );

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
  const { first_name, last_name, rate_of_salary, work_experience, brief_information, services, photo } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Обновить информацию о мастере
    const [updateResult] = await connection.execute(
        'UPDATE master_details SET first_name = ?, last_name = ?, rate_of_salary = ?, work_experience = ?, brief_information = ?, photo = ? WHERE user_id = ?',
        [first_name, last_name, rate_of_salary, work_experience, brief_information, photo, id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастер не найден' });
    }

    // Обновить список услуг мастера
    if (services && Array.isArray(services)) {
      // Удалить старые записи из master_services
      await connection.execute('DELETE FROM master_services WHERE master_id = ?', [id]);

      // Извлечь только ID услуг из массива объектов
      const serviceValues = services.map(service => [id, service.id]);

      if (serviceValues.length > 0) {
        // Добавить новые услуги
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
      'SELECT u.id AS user_id, u.login, md.first_name, md.last_name, md.rate_of_salary, md.work_experience, md.brief_information, md.photo ' +
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
      'SELECT\n' +
        '    u.id AS user_id,\n' +
        '    u.login,\n' +
        '    md.first_name,\n' +
        '    md.last_name,\n' +
        '    md.rate_of_salary,\n' +
        '    md.work_experience,\n' +
        '    md.brief_information,\n' +
        '    md.photo,\n' +
        '    IFNULL(JSON_ARRAYAGG(JSON_OBJECT(\'id\', s.id, \'name\', s.name, \'price\', s.price, \'description\', s.description)), JSON_ARRAY()) AS services\n' +
        'FROM users u\n' +
        '    JOIN master_details md ON u.id = md.user_id\n' +
        '    LEFT JOIN master_services ms ON u.id = ms.master_id\n' +
        '    LEFT JOIN services s ON ms.service_id = s.id\n' +
        'WHERE u.role = \'MASTER\'\n' +
        'GROUP BY u.id, u.login, md.first_name, md.last_name, md.rate_of_salary, md.work_experience, md.brief_information, md.photo'
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

app.get('/services/:serviceId/masters', authenticateToken, async (req, res) => {
  const { serviceId } = req.params; // ID услуги

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Запрос для получения мастеров, которые могут оказать выбранную услугу
    const [masters] = await connection.execute(
        `SELECT m.id, m.login, md.first_name, md.last_name, md.rate_of_salary, md.work_experience 
      FROM users m
      JOIN master_details md ON m.id = md.user_id
      JOIN master_services ms ON m.id = ms.master_id
      WHERE ms.service_id = ?`,
        [serviceId]
    );

    await connection.end();

    if (masters.length > 0) {
      res.status(200).json(masters);
    } else {
      res.status(404).json({ message: 'No masters available for this service' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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


app.post('/schedule', authenticateToken, async (req, res) => {
  const { service_id, client_id, master_id, start_time, end_time, description } = req.body;

  if (!service_id || !client_id || !master_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'Все поля, кроме описания, обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO schedule (service_id, client_id, master_id, start_time, end_time, description) VALUES (?, ?, ?, ?, ?, ?)',
      [service_id, client_id, master_id, start_time, end_time, description || null]
    );

    await connection.end();

    res.status(201).json({ message: 'Запись добавлена в расписание', schedule_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT s.id, s.start_time, s.end_time, s.description, ' +
      'sv.name AS service_name, u_client.login AS client_name, u_master.login AS master_name ' +
      'FROM schedule s ' +
      'JOIN services sv ON s.service_id = sv.id ' +
      'JOIN users u_client ON s.client_id = u_client.id ' +
      'JOIN users u_master ON s.master_id = u_master.id'
    );

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/schedule/master/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT s.id, s.start_time, s.end_time, s.description, ' +
      'sv.name AS service_name, u_client.login AS client_name ' +
      'FROM schedule s ' +
      'JOIN services sv ON s.service_id = sv.id ' +
      'JOIN users u_client ON s.client_id = u_client.id ' +
      'WHERE s.master_id = ?',
      [id]
    );

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/schedule/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { service_id, client_id, master_id, start_time, end_time, description } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'UPDATE schedule SET service_id = ?, client_id = ?, master_id = ?, start_time = ?, end_time = ?, description = ? WHERE id = ?',
      [service_id, client_id, master_id, start_time, end_time, description || null, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Запись в расписании не найдена' });
    }

    res.status(200).json({ message: 'Запись в расписании обновлена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/schedule/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'DELETE FROM schedule WHERE id = ?',
      [id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Запись в расписании не найдена' });
    }

    res.status(200).json({ message: 'Запись в расписании удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/schedule/client/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT s.id, s.start_time, s.end_time, s.description, ' +
      'sv.name AS service_name, u_master.login AS master_name ' +
      'FROM schedule s ' +
      'JOIN services sv ON s.service_id = sv.id ' +
      'JOIN users u_master ON s.master_id = u_master.id ' +
      'WHERE s.client_id = ?',
      [id]
    );

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/schedule/service/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT s.id, s.start_time, s.end_time, s.description, ' +
      'u_client.login AS client_name, u_master.login AS master_name ' +
      'FROM schedule s ' +
      'JOIN users u_client ON s.client_id = u_client.id ' +
      'JOIN users u_master ON s.master_id = u_master.id ' +
      'WHERE s.service_id = ?',
      [id]
    );

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/availability2/service/:service_id', authenticateToken, async (req, res) => {
  const { service_id } = req.params;
  const { range, start } = req.query;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Получить мастеров, оказывающих заданную услугу
    const [masters] = await connection.execute(
        `SELECT u.id AS master_id, u.login AS master_name
       FROM master_services ms
       JOIN users u ON ms.master_id = u.id
       WHERE ms.service_id = ? AND u.role = "MASTER"`,
        [service_id]
    );



    if (masters.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастера с этой услугой не найдены' });
    }

    // Получить расписание мастеров
    const masterIds = masters.map(master => master.master_id);

    const [schedule] = await connection.execute(
        `SELECT
           sc.master_id AS master_id,
           sc.start_time AS start_time,
           ADDTIME(sc.start_time, sv.duration * 100) AS end_time
         FROM schedule sc
                INNER JOIN services sv ON sc.service_id = sv.id
         WHERE master_id IN (${masterIds.join(',')})
         GROUP BY sc.master_id, sc.start_time, ADDTIME(sc.start_time, sv.duration * 100)`
    );


    await connection.end();

    // Преобразуем расписание в удобный формат
    const rebuildSchedule = schedule.map(item => ({
      masterId: item.master_id,
      startTime: new Date(item.start_time),
      endTime: new Date(item.end_time)
    }));



    // Функция для поиска пересечений двух временных интервалов
    function findIntersection(interval1, interval2) {
      const latestStart = new Date(Math.max(interval1.startTime, interval2.startTime));
      const earliestEnd = new Date(Math.min(interval1.endTime, interval2.endTime));
      if (latestStart < earliestEnd) {
        return { startTime: latestStart, endTime: earliestEnd };
      }
      return null;
    }

    // Получаем уникальные master_id
    const uniqueMasterIds = [...new Set(rebuildSchedule.map(item => item.masterId))];

    // Строим график пересечений
    let intersectionSchedule = rebuildSchedule.filter(item => item.masterId === uniqueMasterIds[0]);

    for (let i = 1; i < uniqueMasterIds.length; i++) {
      const currentMasterSchedule = rebuildSchedule.filter(item => item.masterId === uniqueMasterIds[i]);
      const newIntersections = [];

      intersectionSchedule.forEach(baseItem => {
        currentMasterSchedule.forEach(currentItem => {
          const intersection = findIntersection(baseItem, currentItem);
          if (intersection) {
            newIntersections.push(intersection);
          }
        });
      });

      intersectionSchedule = newIntersections;
    }

    // Формируем события для отдачи клиенту
    const events = intersectionSchedule.map(slot => ({
      start_time: slot.startTime.toISOString(),
      end_time: slot.endTime.toISOString(),
      description: 'недоступно'
    }));

    // Отправляем результат
    res.status(200).json({
      service_id,
      events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});




app.get('/availability/service/:service_id', authenticateToken, async (req, res) => {
  const { service_id } = req.params;
  const { range, start } = req.query;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Получить мастеров, оказывающих заданную услугу
    const [masters] = await connection.execute(
      'SELECT u.id AS master_id, u.login AS master_name ' +
      'FROM master_services ms ' +
      'JOIN users u ON ms.master_id = u.id ' +
      'WHERE ms.service_id = ? AND u.role = "MASTER"',
      [service_id]
    );

    if (masters.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастера с этой услугой не найдены' });
    }

    let dateFilter = '';
    let startDate = new Date(start);
    let endDate = new Date(start);

    switch (range) {
      case 'day':
        // Фильтруем по конкретному дню
        dateFilter = `AND s.start_time >= '${startDate.toISOString().split('T')[0]}T00:00:00' 
                      AND s.end_time <= '${startDate.toISOString().split('T')[0]}T23:59:59'`;
        break;

      case 'week':
        // Определяем понедельник текущей недели
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Понедельник
        startDate = startOfWeek;
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Воскресенье
        endDate = endOfWeek;
        dateFilter = `AND s.start_time >= '${startOfWeek.toISOString().split('T')[0]}T00:00:00' 
                      AND s.end_time <= '${endOfWeek.toISOString().split('T')[0]}T23:59:59'`;
        break;

      case 'month':
        // Получаем первый и последний день месяца
        const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        startDate = startOfMonth;
        endDate = endOfMonth;

        dateFilter = `AND s.start_time >= '${startOfMonth.toISOString().split('T')[0]}T00:00:00' 
                      AND s.end_time <= '${endOfMonth.toISOString().split('T')[0]}T23:59:59'`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid range parameter' });
    }

    // Получить расписание для данной услуги с учетом фильтрации по диапазону времени
    const [schedule] = await connection.execute(
      `SELECT s.master_id, s.start_time, s.end_time, s.description 
       FROM schedule s
       JOIN master_services ms ON s.master_id = ms.master_id
       WHERE ms.service_id = ? ${dateFilter}`,
      [service_id]
    );

    await connection.end();

    // 1. Чистое расписание
    const scheduleDetails = schedule.map(slot => ({
      start_time: slot.start_time,
      end_time: slot.end_time,
      description: slot.description
    }));

    // 2. Список мастеров
    const masterDetails = masters.map(master => ({
      master_id: master.master_id,
      master_name: master.master_name
    }));

    // 3. Формируем слоты по датам и часам (значение - 0 мастеров пока)
    const slots = {};

    // Функция для создания слотов на заданный диапазон
    const createSlotsForDateRange = (startDate, endDate) => {
      const resultSlots = {};
      let currentDate = new Date(startDate);

      // Перебираем все дни в диапазоне
      while (currentDate <= endDate) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        resultSlots[dateKey] = {};

        // Создаем часовые слоты с 9:00 до 21:00
        for (let hour = 9; hour <= 21; hour++) {
          const hourKey = `${String(hour).padStart(2, '0')}:00`;
          resultSlots[dateKey][hourKey] = 0; // Пока мастеров 0
        }

        // Переходим к следующему дню
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return resultSlots;
    };

    // Создаем слоты для запрашиваемого диапазона
    const timeslots = createSlotsForDateRange(startDate, endDate);

    // 4. Обновляем слоты, заполняем количество занятых мастеров
    // Для каждого слота проверяем, сколько мастеров заняты на этом времени
    schedule.forEach(slot => {
      const dateKey = new Date(slot.start_time).toISOString().split('T')[0];
      const hourKey = new Date(slot.start_time).getHours() + ":00";

      if (timeslots[dateKey] && timeslots[dateKey][hourKey] !== undefined) {
        timeslots[dateKey][hourKey] += 1; // Увеличиваем количество занятых мастеров для этого времени
      }
    });

    res.status(200).json({
      service_id,
      schedule: scheduleDetails,
      masters: masterDetails,
      slots: timeslots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/availability/slot/:service_id', authenticateToken, async (req, res) => {
  const { service_id } = req.params;
  let { date, hour } = req.query;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Получить мастеров, оказывающих заданную услугу
    const [masters] = await connection.execute(
      'SELECT u.id AS master_id, u.login AS master_name ' +
      'FROM master_services ms ' +
      'JOIN users u ON ms.master_id = u.id ' +
      'WHERE ms.service_id = ? AND u.role = "MASTER"',
      [service_id]
    );

    if (masters.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Мастера с этой услугой не найдены' });
    }

    // Убедимся, что hour в формате "09:00"
    if (!hour.includes(':')) {
      hour = `${String(hour).padStart(2, '0')}:00`;  // Если передан только час (например, "9"), добавляем ":00" и приводим к формату "09"
    }


    // Проверяем корректность даты и часа
    const startTime = new Date(`${date} ${hour}:00:00`);

    if (isNaN(startTime)) {
      return res.status(400).json({ message: 'Неверный формат даты или времени' });
    }

    // Создаем время окончания (через 1 час)
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // Интервал 1 час

    // Получить расписание для мастеров на этот интервал времени
    const [schedule] = await connection.execute(
      `SELECT s.master_id, s.start_time, s.end_time 
       FROM schedule s
       WHERE s.start_time < ? AND s.end_time > ?`,
      [endTime.toISOString(), startTime.toISOString()]
    );

    // Закрываем соединение
    await connection.end();

    // Мастера, которые заняты на этот слот
    const unavailableMasters = new Set(schedule.map(s => s.master_id));

    // Отбираем только доступных мастеров
    const availableMasters = masters.filter(master => !unavailableMasters.has(master.master_id));

    // Возвращаем список доступных мастеров
    res.status(200).json({
      service_id,
      date,
      hour,
      available_masters: availableMasters
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});





app.get('/salon/settings', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [settings] = await connection.execute('SELECT * FROM salon_settings LIMIT 1');

    await connection.end();

    if (settings.length === 0) {
      return res.status(404).json({ message: 'Настройки салона не найдены' });
    }

    res.status(200).json(settings[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/salon/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  const { phone, email, open_time, close_time } = req.body;

  if (!phone || !email || !open_time || !close_time) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO salon_settings (phone, email, open_time, close_time) VALUES (?, ?, ?, ?)',
      [phone, email, open_time, close_time]
    );

    await connection.end();

    res.status(201).json({ message: 'Настройки салона созданы' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/salon/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute('DELETE FROM salon_settings WHERE id = 1');

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Настройки салона не найдены' });
    }

    res.status(200).json({ message: 'Настройки салона удалены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Эндпоинт с проверкой токена
app.get("/service-processes", authenticateToken, async (req, res) => {
  // Проверяем роль пользователя
  if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
    return res.status(403).json({ message: "Доступ запрещён" });
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    // Текущая дата
    const today = new Date().toISOString().split("T")[0];

    // SQL-запрос для получения данных
    const query = `
      SELECT sp.id,
             c.first_name AS client_first_name,
             c.last_name AS client_last_name,
             c.photo                                AS client_photo,
             m.first_name AS master_first_name,
             m.last_name AS master_last_name,
             m.photo                                AS master_photo,
             s.name                                 AS service_name,
             s.price                                AS service_price,
             s.photo                                AS service_photo,
             sp.start_time,
             sp.end_time,
             sp.status
      FROM service_process sp
             LEFT JOIN schedule sc on sp.schedule_id = sc.id
             LEFT JOIN users c ON sc.client_id = c.id
             LEFT JOIN master_details m ON sc.master_id = m.user_id
             LEFT JOIN services s ON sp.service_id = s.id
      WHERE DATE(sp.start_time) = ? 
        AND sp.status != 'PAID' 
        AND sp.status != 'CANCELLED'
    `;

    const [rows] = await connection.execute(query, [today]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  } finally {
    await connection.end();
  }
});

app.put('/salon/settings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  const { phone, email, open_time, close_time } = req.body;

  if (!phone || !email || !open_time || !close_time) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'UPDATE salon_settings SET phone = ?, email = ?, open_time = ?, close_time = ? WHERE id = 1',
      [phone, email, open_time, close_time]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Настройки салона не найдены' });
    }

    res.status(200).json({ message: 'Настройки салона обновлены' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Точка доступа для получения истории клиента
app.get('/history/client/:clientid', authenticateToken, async (req, res) => {
  const { clientid } = req.params;

  // Проверка прав доступа (если пользователь не является администратором, то может смотреть только свою историю)
  if (req.user.id !== parseInt(clientid) && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }

  try {
    // Подключаемся к базе данных
    const connection = await mysql.createConnection(dbConfig);

    // SQL-запрос для получения истории клиента
    const [rows] = await connection.execute(
        `
          SELECT distinct sp.id,
                          sp.service_id,
                          sp.status,
                          sp.start_time,
                          sp.duration,
                          sp.end_time,
                          s.name,
                          s.photo,
                          m.first_name,
                          m.photo AS service_name
          FROM service_process sp
                 INNER JOIN schedule sch ON sp.service_id = sch.service_id
                 INNER JOIN master_details m ON m.user_id = sch.master_id
                 INNER JOIN services s ON sp.service_id = s.id
          WHERE sch.client_id = ?
          ORDER BY sp.start_time
              DESC;
          ;
      `,
        [clientid]
    );

    await connection.end();

    // Если записи не найдены, возвращаем ошибку
    if (rows.length === 0) {
      return res.status(404).json({ message: 'История для данного клиента не найдена.' });
    }

    // Возвращаем найденную историю клиента
    res.status(200).json({
      client_id: clientid,
      history: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Старт сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
