const { User, Cat, Booking, Room } = require('../models/models');

// Общие методы CRUD для разных моделей
const create = async (Model, data) => {
  return await Model.create(data);
};

const getAll = async (Model, populateFields = '') => {
  return await Model.find().populate(populateFields);
};

const getById = async (Model, id, populateFields = '') => {
  return await Model.findById(id).populate(populateFields);
};

const update = async (Model, id, data) => {
  return await Model.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (Model, id) => {
  return await Model.findByIdAndDelete(id);
};

const getAllCount = async (Model) => {
  return await Model.countDocuments();
};

const insertManyRooms = async (rooms) => {
  return await Room.insertMany(rooms);
};

const updateRoomStatus = async (roomId, isOccupied) => {
  return await Room.findByIdAndUpdate(roomId, { is_occupied: isOccupied });
};

module.exports = {
  User,
  Cat,
  Booking,
  Room,
  create,
  getAll,
  getById,
  update,
  remove,
  getAllCount,
  insertManyRooms,
  updateRoomStatus
};
