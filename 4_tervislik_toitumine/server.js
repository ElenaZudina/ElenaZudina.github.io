
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;

//Middlewares
app.use(cors());
app.use(express.json());

//MongoDB Connection
const mongoURI = 'mongodb+srv://elenzudina_db_user:1w2e3r4@cluster0.7ymoivo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Mongoose Schema and Model
const menuSchema = new mongoose.Schema({
    img: String,
    altimg: String,
    title: String,
    descr: String,
    price: Number
});

const menuItem = mongoose.model('MenuItem', menuSchema, 'menu');

const requestSchema = new mongoose.Schema({
    name: String,
    phone: String,
});

// Function to seed the databese
const seedDatabase = async () => {
    try {
        const count = await menuItem.countDocuments();
        if (count === 0) {
            console.log('No data found in menu collection. Seeding database...');
            const data = fs.readFileSync('db.json', 'utf-8');
            const json = JSON.parse(data);
            await menuItem.insertMany(json.menu);
            console.log('Database seeded successfully');
        } else {
            console.log('Menu collection already has data. Skipping seeding.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

const Request = mongoose.model('Request', requestSchema);

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

app.get('/menu', async (req, res) => {
    try {
        const menuItems = await menuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server and seed the database
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    seedDatabase();
});
