const mongoose = require('mongoose');

// === Модель пользователя ===
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_info: { type: String, required: true }
}, { versionKey: false });

userSchema.methods.toJSON = function() {
  return Object.freeze({
    id: this._id.toString(),
    name: this.name,
    contact_info: this.contact_info,
  });
};

// === Модель кошки ===
const catSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { versionKey: false });

catSchema.methods.toJSON = function() {
  return Object.freeze({
    id: this._id.toString(),
    name: this.name,
    age: this.age,
    breed: this.breed,
    ownerId: this.ownerId.toString(),
  });
};


// === Модель бронирования ===
const bookingSchema = new mongoose.Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  cat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cat', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Убрали required
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
}, { versionKey: false });

bookingSchema.methods.toJSON = function() {
  return Object.freeze({
    id: this._id.toString(),
    start_date: this.start_date,
    end_date: this.end_date,
    cat_id: this.cat_id ? this.cat_id.toString() : null,
    user_id: this.user_id ? this.user_id.toString() : null,
    room_id: this.room_id ? this.room_id.toString() : null,
  });
};


// === Модель комнаты ===
const roomSchema = new mongoose.Schema({
  room_number: { type: Number, unique: true, required: true },
  is_occupied: { type: Boolean, default: false }
}, { versionKey: false });


roomSchema.virtual('bookings', {
  ref: 'Booking', 
  localField: '_id', 
  foreignField: 'room_id' 
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });


roomSchema.methods.toJSON = function() {
  return Object.freeze({
    id: this._id.toString(),
    room_number: this.room_number,
    is_occupied: this.is_occupied,
    bookings: this.bookings 
  });
};

module.exports = mongoose.model('Room', roomSchema);

module.exports = {
  User: mongoose.model('User', userSchema),
  Cat: mongoose.model('Cat', catSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Room: mongoose.model('Room', roomSchema)
};
