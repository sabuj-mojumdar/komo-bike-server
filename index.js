const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wff6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('komo-bike');
        const rentalCollection = database.collection('rental');
        const usersCollection = database.collection('users');
        const bookingCollection = database.collection('books');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        const messagesCollection = database.collection('messages');



        //all rental collection
        app.get('/rentals', async (req, res) => {
            const cursor = rentalCollection.find({});
            const rentals = await cursor.toArray();
            res.json(rentals);
        })

        app.get("/rentals/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const rent = await rentalCollection.findOne(query);
            res.json(rent);
        })

        app.post('/rentals', async (req, res) => {
            const rental = req.body;
            const result = await rentalCollection.insertOne(rental);
            res.json(result)
        });

        //all booking collections

        app.post('/bookings', async (req, res) => {
            const book = req.body;
            const result = await bookingCollection.insertOne(book);
            res.json(result)
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        });

        app.get('/allorders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id }
            const cursor = ordersCollection.find(query);
            const order = await cursor.toArray();
            res.json(order);
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const order = await cursor.toArray();
            res.json(order);
        })

        app.put("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const updatedorder = req.body;
            const filter = { id: id };
            const updateInfo = {
                $set: {
                    status: updatedorder.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateInfo);
            res.send(result);
        });


        //delete single booking
        app.delete('/orders/:orId', async (req, res) => {
            const id = req.params.orId;
            const query = { id: id };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        app.get('/bookings/', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        })

        //delete single booking
        app.delete('/bookings/:bid', async (req, res) => {
            const id = req.params.bid;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })

        // delete single booking
        app.delete('/bookings/', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookingCollection.deleteMany(query);
            res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        app.get('/messages', async (req, res) => {
            const cursor = messagesCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        app.post('/messages', async (req, res) => {
            const message = req.body;
            const result = await messagesCollection.insertOne(message);
            res.json(result);
        })


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Welcome to komo bike Service website')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})