module.exports = {
  async up(db) {
    // Добавляем поле isAdmin в коллекцию users
    await db.collection('users').updateMany({}, { $set: { isAdmin: false } });
  },

  async down(db) {
    // Удаляем поле isAdmin
    await db.collection('users').updateMany({}, { $unset: { isAdmin: "" } });
  },
};
