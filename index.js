const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());

app.use(express.json());
app.use(cookieParser());






app.get('/', (req, res) => {
  res.send('taskia making server is running')
})

app.listen(port, () => {
  console.log(`taskia Server is running on port: ${port}`)
})