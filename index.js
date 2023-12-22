const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.onvejqf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        const tasksCollection = client.db("taskiaDb").collection("tasks");
        app.get('/task/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await tasksCollection.find(query).toArray();
            res.send(user);
        })
        app.post('/task', async (req, res) => {
            const taskItem = req.body;
            const result = await tasksCollection.insertOne(taskItem);
            res.send(result);
        });
        app.delete('/delete-task/:id', async (req, res) => {
            const id = req.params.id;
            try {
              const assignment = await tasksCollection.findOneAndDelete({ _id: new ObjectId(id), email: req.query?.email });
              if (assignment) {
                res.send(assignment);
              } else {
                res.status(404).json({ message: 'Task not found for the requesting user' });
              }
            } catch (err) {
              res.status(500).json({ message: err.message });
            }
          })
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('taskia making server is running')
})

app.listen(port, () => {
    console.log(`taskia Server is running on port: ${port}`)
})