const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9vt9t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('products_portal');
        const bookingsCollection = database.collection('booking');
        const servicesCollection = database.collection('services');
        const reviewsCollection = database.collection('reviews');
        const userCollection = database.collection('users');


        app.get('/booking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = bookingsCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // services
        app.post("/addServices", async (req, res) => {
            const result = await servicesCollection.insertOne(req.body);
            res.send(result);
        });

        app.get("/allServices", async (req, res) => {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        });
        // Review

        app.post("/addReviewes", async (req, res) => {
            const result = await reviewsCollection.insertOne(req.body);
            res.send(result);
        });

        app.get("/allReviewes", async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.json(result);

        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



    }
    finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(` listening at ${port}`)
})