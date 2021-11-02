const express = require("express");
const { MongoClient } = require('mongodb');
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.av6mz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()

        const database = client.db("online_shop")
        const productsCollection = database.collection("products")
        const orderCollection = database.collection("order")

        //get api
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size)
            let product;
            const count = await cursor.count()
            if (page) {
                product = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                product = await cursor.toArray()
            }
            res.send({
                count,
                product
            })
        })
        // Post to get data
        app.post("/products/bykey", async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const cursor = await productsCollection.find(query).toArray()
            res.json(cursor)
        });

        // post order detail
        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get("/", (req, res) => {
    res.send("node cunnected")
});


app.listen(port, () => {
    console.log("Server cunnected ", port);
})