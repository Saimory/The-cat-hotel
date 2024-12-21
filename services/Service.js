const dao = require('../dao/Dao');

// Общие сервисные функции
const addNewItem = async (Model, data) => {
  return await dao.create(Model, data);
};

const getAllItems = async (Model, populateFields = '') => {
  return await dao.getAll(Model, populateFields);
};

const getItemById = async (Model, id, populateFields = '') => {
  return await dao.getById(Model, id, populateFields);
};

const updateItem = async (Model, id, data) => {
  return await dao.update(Model, id, data);
};

const deleteItem = async (Model, id) => {
  return await dao.remove(Model, id);
};

// Специфическая логика для приложения
const addNewCat = async ({ ownerId, name, age, breed }) => {
  // Проверяем, существует ли владелец
  const owner = await dao.getById(dao.User, ownerId);
  if (!owner) {
    throw new Error('Владелец с указанным ID не найден');
  }

  // Создаем новую кошку
  return await dao.create(dao.Cat, { ownerId, name, age, breed });
};

const createBooking = async ({ start_date, end_date, cat_id, room_id }) => {
  // Проверяем, существует ли кошка
  const cat = await dao.getById(dao.Cat, cat_id);
  if (!cat) {
    throw new Error('Кошка с указанным ID не найдена');
  }

  // Проверяем, есть ли пересечение бронирований
  const overlappingBooking = await dao.getAll(dao.Booking, '', {
    room_id,
    $or: [
      { start_date: { $lte: new Date(end_date) }, end_date: { $gte: new Date(start_date) } },
    ],
  });

  if (overlappingBooking.length > 0) {
    throw new Error('Комната уже забронирована на указанные даты');
  }

  // Создаем бронирование
  const booking = await dao.create(dao.Booking, {
    start_date,
    end_date,
    cat_id,
    room_id,
    user_id: cat.ownerId,
  });


  // Обновляем статус комнаты
  await dao.updateRoomStatus(room_id, true);

  return booking;
};

const deleteBooking = async (id) => {
  const booking = await dao.getById(dao.Booking, id);
  if (!booking) {
    throw new Error('Бронирование с указанным ID не найдено');
  }

  // Удаляем бронирование
  await dao.remove(dao.Booking, id);

  // Освобождаем комнату
  await dao.updateRoomStatus(booking.room_id, false);
};

const initializeRooms = async () => {
  const roomCount = await dao.getAllCount(dao.Room);
  if (roomCount === 0) {
    const rooms = Array.from({ length: 20 }, (_, i) => ({ room_number: i + 1 }));
    await dao.insertManyRooms(rooms);
    console.log('Создано 20 комнат в базе данных');
  }
};

module.exports = {
  addNewItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  addNewCat,
  createBooking,
  deleteBooking,
  initializeRooms,
};
