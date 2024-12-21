const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const { initializeRooms } = require('./services/service');
const Controller = require('./controllers/Controller');
const {
  generateBookingsReport,
  generateRoomUsageReport,
  generateUsersReport,
  generateCatsReport,
} = require('./report-generator.js'); // Импорт функций генерации отчётов

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/cat-hotel')
  .then(async () => {
    console.log('Подключено к базе данных MongoDB');
    await initializeRooms();
  })
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// === Маршруты для кошек ===
app.post('/api/v1/cats', Controller.createCat);
app.get('/api/v1/cats', Controller.getAllCats);
app.get('/api/v1/cats/:id', Controller.getCatById);
app.put('/api/v1/cats/:id', Controller.updateCat);
app.delete('/api/v1/cats/:id', Controller.deleteCat);

// === Маршруты для пользователей ===
app.post('/api/v1/users', Controller.createUser);
app.get('/api/v1/users', Controller.getAllUsers);
app.get('/api/v1/users/:id', Controller.getUserById);
app.delete('/api/v1/users/:id', Controller.deleteUser);

// === Маршруты для бронирований ===
app.post('/api/v1/bookings', Controller.createBooking);
app.get('/api/v1/bookings', Controller.getAllBookings);
app.get('/api/v1/bookings/:id', Controller.getBookingById);
app.put('/api/v1/bookings/:id', Controller.updateBooking);
app.delete('/api/v1/bookings/:id', Controller.deleteBooking);

// === Маршруты для комнат ===
app.get('/api/v1/rooms', Controller.getAllRooms);
app.get('/api/v1/rooms/:id', Controller.getRoomById);

// === Маршруты для генерации отчетов ===

// Отчет о бронированиях
// http://localhost:8080/api/v1/reports/bookings
app.get('/api/v1/reports/bookings', async (req, res) => {
  try {
    await generateBookingsReport(res);
  } catch (err) {
    console.error('Ошибка при генерации отчёта о бронированиях:', err);
    res.status(500).json({ message: 'Ошибка при генерации отчёта', error: err });
  }
});

// Отчет по пользователям
// http://localhost:8080/api/v1/reports/users
app.get('/api/v1/reports/users', async (req, res) => {
  try {
    await generateUsersReport(res);
  } catch (err) {
    console.error('Ошибка при генерации отчёта по пользователям:', err);
    res.status(500).json({ message: 'Ошибка при генерации отчёта', error: err });
  }
});

// Отчет по кошкам
// http://localhost:8080/api/v1/reports/cats
app.get('/api/v1/reports/cats', async (req, res) => {
  try {
    await generateCatsReport(res);
  } catch (err) {
    console.error('Ошибка при генерации отчёта по кошкам:', err);
    res.status(500).json({ message: 'Ошибка при генерации отчёта', error: err });
  }
});

// Запуск сервера
// http://localhost:8080/api-docs
app.listen(8080, () => {
  console.log('Сервер запущен на порте 8080');
});
