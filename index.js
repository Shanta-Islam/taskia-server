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

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    // middlewares 
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    const tasksCollection = client.db("taskiaDb").collection("tasks");
    app.get('/task/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await tasksCollection.find(query).toArray();
      res.send(user);
    })
    app.get('/tasks', async (req, res) => {
      const query = {};
      const user = await tasksCollection.find(query).toArray();
      res.send(user);
    })
    app.post('/task', async (req, res) => {
      const taskItem = req.body;
      const result = await tasksCollection.insertOne(taskItem);
      res.send(result);
    });
    app.put('/update-task/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedTask = req.body;
      const task = {
        $set: {
          title: updatedTask.title,
          desc: updatedTask.desc,
          dateValue: updatedTask.dateValue
        }
      }
      const result = await tasksCollection.updateOne(filter, task, options);
      console.log(result);
      res.send(result);
    })

    app.delete('/delete-task/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const task = await tasksCollection.findOneAndDelete({ _id: new ObjectId(id), email: req.query?.email });
        if (task) {
          res.send(task);
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