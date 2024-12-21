const Service = require('../services/service');
const dao = require('../dao/Dao');

// === Контроллеры для кошек ===
const createCat = async (req, res) => {
  try {
    const newCat = await Service.addNewCat(req.body);
    res.status(201).json({ message: 'Кошка успешно добавлена', data: newCat });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении кошки', error: err.message });
  }
};

const getAllCats = async (req, res) => {
  try {
    const cats = await Service.getAllItems(dao.Cat, 'ownerId');
    res.status(200).json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении списка кошек', error: err.message });
  }
};

const getCatById = async (req, res) => {
  try {
    const cat = await Service.getItemById(dao.Cat, req.params.id, 'ownerId');
    cat ? res.status(200).json(cat) : res.status(404).json({ message: 'Кошка не найдена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении кошки', error: err.message });
  }
};

const updateCat = async (req, res) => {
  try {
    const updatedCat = await Service.updateItem(dao.Cat, req.params.id, req.body);
    updatedCat
      ? res.status(200).json({ message: 'Кошка обновлена', data: updatedCat })
      : res.status(404).json({ message: 'Кошка не найдена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении кошки', error: err.message });
  }
};

const deleteCat = async (req, res) => {
  try {
    await Service.deleteItem(dao.Cat, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении кошки', error: err.message });
  }
};

// === Контроллеры для пользователей ===
const createUser = async (req, res) => {
  try {
    const newUser = await Service.addNewItem(dao.User, req.body);
    res.status(201).json({ message: 'Пользователь успешно добавлен', data: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении пользователя', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Service.getAllItems(dao.User);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей', error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await Service.getItemById(dao.User, req.params.id);
    user ? res.status(200).json(user) : res.status(404).json({ message: 'Пользователь не найден' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении пользователя', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await Service.deleteItem(dao.User, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя', error: err.message });
  }
};

// === Контроллеры для бронирований ===
const createBooking = async (req, res) => {
  try {
    const newBooking = await Service.createBooking(req.body);
    res.status(201).json({ message: 'Бронирование успешно создано', data: newBooking });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании бронирования', error: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Service.getAllItems(dao.Booking, 'cat_id user_id room_id');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении списка бронирований', error: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Service.getItemById(dao.Booking, req.params.id, 'cat_id user_id room_id');
    booking ? res.status(200).json(booking) : res.status(404).json({ message: 'Бронирование не найдено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении бронирования', error: err.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Service.updateItem(dao.Booking, req.params.id, req.body);
    updatedBooking
      ? res.status(200).json({ message: 'Бронирование обновлено', data: updatedBooking })
      : res.status(404).json({ message: 'Бронирование не найдено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении бронирования', error: err.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    await Service.deleteBooking(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении бронирования', error: err.message });
  }
};

// === Контроллеры для комнат ===
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Service.getAllItems(dao.Room, 'bookings');
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении списка комнат', error: err.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Service.getItemById(dao.Room, req.params.id, 'bookings');
    room ? res.status(200).json(room) : res.status(404).json({ message: 'Комната не найдена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении комнаты', error: err.message });
  }
};

module.exports = {
  // Кошки
  createCat,
  getAllCats,
  getCatById,
  updateCat,
  deleteCat,

  // Пользователи
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,

  // Бронирования
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,

  // Комнаты
  getAllRooms,
  getRoomById,
};
