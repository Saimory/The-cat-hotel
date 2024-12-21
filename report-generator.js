const PDFDocument = require('pdfkit-table');
const { Booking, User, Cat, Room } = require('./models/models'); // Добавьте User, Cat и Room
const moment = require('moment');

const generateBookingsReport = async (res) => {
  try {
    const bookings = await Booking.find()
      .populate('cat_id', 'name breed age')
      .populate('user_id', 'name contact_info')
      .populate('room_id', 'room_number');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.pdf');

    doc.pipe(res);

    // Регистрация шрифтов
    doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.font('Roboto');

    // Заголовок отчета
    doc.fontSize(16).text('Отчет о бронированиях', { align: 'center' });
    doc.moveDown();

    // Формирование данных для таблицы
    const table = {
      headers: ['#', 'Дата начала', 'Дата окончания', 'Кот', 'Пользователь', 'Комната'],
      rows: bookings.map((booking, index) => [
        index + 1,
        moment(booking.start_date).format('YYYY-MM-DD'),
        moment(booking.end_date).format('YYYY-MM-DD'),
        `${booking.cat_id.name} (${booking.cat_id.breed}, ${booking.cat_id.age} лет)`,
        `${booking.user_id.name} (${booking.user_id.contact_info})`,
        booking.room_id.room_number
      ]),
    };

    // Рендеринг таблицы
    await doc.table(table, {
      prepareHeader: () => doc.fontSize(12).font('Roboto-Bold'),
      prepareRow: (row, i) => doc.fontSize(10).font('Roboto'),
      columnSpacing: 10,
      width: 500,
    });

    // Завершение документа
    doc.end();
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error);
    if (!res.headersSent) {
      res.status(500).send('Ошибка при генерации отчета');
    }
  }
};


const generateUsersReport = async (res) => {
  try {
    // Получаем всех пользователей
    const allUsers = await User.find();

    // Составляем список пользователей с их кошками
    const usersWithCats = await Promise.all(
      allUsers.map(async (user) => {
        // Находим всех кошек, принадлежащих данному пользователю
        const cats = await Cat.find({ ownerId: user._id });

        return {
          name: user.name,
          contact_info: user.contact_info,
          totalBookings: await Booking.countDocuments({ user_id: user._id }),
          cats: cats.length > 0 ? cats.map((cat) => cat.name) : ['Нет'],
        };
      })
    );

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=users-report.pdf');
    doc.pipe(res);

    // Регистрация шрифтов
    doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.font('Roboto');

    doc.fontSize(16).text('Отчет по пользователям', { align: 'center' });
    doc.moveDown();

    const table = {
      headers: ['Имя пользователя', 'Контактная информация', 'Кол-во бронирований', 'Кошки'],
      rows: usersWithCats.map((user) => [
        user.name,
        user.contact_info,
        user.totalBookings,
        user.cats.join(', '),
      ]),
    };

    await doc.table(table, {
      prepareHeader: () => doc.fontSize(12).font('Roboto-Bold'),
      prepareRow: (row, i) => doc.fontSize(10).font('Roboto'),
    });

    doc.end();
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error);
    if (!res.headersSent) {
      res.status(500).send('Ошибка при генерации отчета');
    }
  }
};



const generateCatsReport = async (res) => {
  try {
    // Сгруппируем бронирования по кошкам
    const catsWithBookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'cats',
          localField: 'cat_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: '$cat' },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$cat._id',
          name: { $first: '$cat.name' },
          breed: { $first: '$cat.breed' },
          age: { $first: '$cat.age' },
          owner: { $first: '$user.name' },
          totalBookings: { $sum: 1 },
          lastBooking: { $max: '$end_date' },
        },
      },
    ]);

    // Получаем всех кошек
    const allCats = await Cat.find().populate('ownerId', 'name');

    // Добавляем кошек без бронирований
    allCats.forEach((cat) => {
      if (!catsWithBookings.some((c) => c._id.toString() === cat._id.toString())) {
        catsWithBookings.push({
          _id: cat._id,
          name: cat.name,
          breed: cat.breed,
          age: cat.age,
          owner: cat.ownerId ? cat.ownerId.name : 'Нет владельца',
          totalBookings: 0,
          lastBooking: null,
        });
      }
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cats-report.pdf');
    doc.pipe(res);

    // Регистрация шрифтов
    doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto-Bold', 'fonts/Roboto-Bold.ttf');
    doc.font('Roboto');

    doc.fontSize(16).text('Отчет по кошкам', { align: 'center' });
    doc.moveDown();

    const table = {
      headers: ['Имя кошки', 'Порода', 'Возраст', 'Владелец', 'Кол-во бронирований', 'Последнее бронирование'],
      rows: catsWithBookings.map((cat) => [
        cat.name,
        cat.breed,
        `${cat.age} лет`,
        cat.owner || 'Нет владельца',
        cat.totalBookings,
        cat.lastBooking ? moment(cat.lastBooking).format('YYYY-MM-DD') : 'Нет',
      ]),
    };

    await doc.table(table, {
      prepareHeader: () => doc.fontSize(12).font('Roboto-Bold'),
      prepareRow: (row, i) => doc.fontSize(10).font('Roboto'),
    });

    doc.end();
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error);
    if (!res.headersSent) {
      res.status(500).send('Ошибка при генерации отчета');
    }
  }
};



module.exports = {
  generateBookingsReport,
  generateUsersReport,
  generateCatsReport,
};

