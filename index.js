const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongo-simple-crud.tzwys72.mongodb.net/?appName=Mongo-simple-crud`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        console.log("MongoDB Connected");

        const db = client.db("Smart_db");
        const productsCollection = db.collection("products");
        const bidsCollection = db.collection("bids");
        const usersCollection = db.collection("users")


        app.post('/users', async (req, res) => {
            const newUser = req.body

            const email = req.body.email
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                res.send('User Already Exist')
            }
            else {
                const result = await usersCollection.insertOne(newUser)
                res.send(result)
            }

        })

        app.get('/products', async (req, res) => {
            console.log(req.query)
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }
            const cursor = productsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        app.post('/products', async (req, res) => {

            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        app.get('/latest-products', async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            const query = { _id: new ObjectId(id) }

            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price
                }
            }
            const options = {}
            const result = await productsCollection.updateOne(query, update, options)
            res.send(result)
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/', (req, res) => {
            res.send('Smart server is running');
        });


        app.get('/bids', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.buyer_email = email
            }
            const cursor = bidsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/products/productBid/:productId', async (req, res) => {
            const productId = req.params.productId
            const query = { productId: productId }
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 })
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/bids', async (req, res) => {
            const email = req.query.email; 
            const query = {};

            if (email) {
                query.buyer_email = email;
            }

            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        app.post('/bids', async (req, res) => {
            const newProduct = req.body;
            const result = await bidsCollection.insertOne(newProduct);
            res.send(result);
        });
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bidsCollection.deleteOne(query)
            res.send(result)
        })

        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (error) {
        console.error(" Connection Error:", error);
    }
}

run().catch(console.dir);
