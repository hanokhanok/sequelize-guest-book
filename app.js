require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');

app.listen(3000, () => {
	console.log('http://127.0.0.1:3000');
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sequelize = new Sequelize({
	host: 'localhost',
	port: process.env.PORT,
	database: process.env.DB_NAME,
	username: process.env.USER_NAME,
	password: process.env.DB_PASSWORD,
	dialect: 'mysql',
	pool: { max: 10 }
});

const Sample = sequelize.define('GuestBook', {
	writer: {
		type: DataTypes.STRING(20)
	},
	comment: {
		type: DataTypes.TEXT()
	}
}, {
	charset: 'utf8',
	tableName: 'guest-book'
});

sequelize.sync();

app.get('/write', (req, res, next) => {
	res.render('write.pug');
});

app.post('/save', async (req, res, next) => {
	try {
		let result = await Sample.create({ ...req.body });
		res.redirect('/list');
	}
	catch(e) {
		console.log(e);
	}
});

app.get(['/', '/list'], async (req, res, next) => {
	try {
		let result = await Sample.findAll({
			order: [['id', 'desc']]
		});
		res.render('list', { result });
	}
	catch(e) {
		console.log(e);
	}
});

app.get('/update/:id', async (req, res, next) => {
	let id = req.params.id;
	let v = await Sample.findOne({ where: { id } });
	res.render('update.pug', { v });
});

app.post('/saveUpdate', async (req, res, next) => {
	let { id, comment, writer } = req.body;
	let result = await Sample.update({ comment, writer }, { where: { id } });
	res.redirect('/');
});

app.get('/remove/:id', async (req, res, next) => {
	let id = req.params.id;
	let result = await Sample.destroy({ where: { id } });
	res.redirect('/');
})