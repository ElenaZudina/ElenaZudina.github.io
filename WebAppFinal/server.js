
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // В разработе можно использовать http
}));

//Тестовый администратор
const adminUser = { 
    username: 'admin', 
    password: 'password' 
};

//MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
    mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Mongoose Schema and Model
const serviceSchema = new mongoose.Schema({
    img: String,
    altimg: String,
    title: String,
    descr: String,
    price: Number,
    type: String
});

const Service = mongoose.model('Service', serviceSchema, 'services');

const requestSchema = new mongoose.Schema({
    name: String,
    phone: String,
});

// Function to seed the databese
const seedDatabase = async () => {
    try {
        const count = await Service.countDocuments();
        if (count === 0) {
            console.log('No data found in services collection. Seeding database...');
            const data = fs.readFileSync('db.json', 'utf-8');
            const json = JSON.parse(data);
            await Service.insertMany(json.services);
            console.log('Database seeded successfully');
        } else {
            console.log('Services collection already has data. Skipping seeding.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

const Request = mongoose.model('Request', requestSchema);

//Middleware для проврки аутентификации
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

//Маршрут для входа
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUser.username && password === adminUser.password) {
        req.session.user = adminUser;
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

//Маршрут для входа
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send('Logout successful');
});

//Маршрут для проверки статуса сеанса
app.get('/session-status', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

//Маршрут для админ-панели
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/admin.html'));
});

// API Routes
app.post('/requests', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/services', isAuthenticated, async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/services/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await Service.findByIdAndDelete(id);
        res.status(200).send('Service deleted');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/services/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const updateService = await Service.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updateService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Start the server and seed the database
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    seedDatabase();
});
