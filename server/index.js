const express = require('express')
const app = express()
const port = 3000
const {user} = require('./models');
const {post} = require('./models');
const { invention } = require('./models');
const bodyParser = require("body-parser");

/////middleware
app.use(bodyParser.json());


app.get('/', (req, res) => {
  
  post.findAll().then(data=> res.status(200).send(data))


})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})