const express = require('express')
const app = express()
//const port = 3000
const port = 443
//const {user} = require('./models');
const {post} = require('./models');
//const {invention} = require('./models');
const bodyParser = require("body-parser");
const cors = require("cors");
// const crypto = require("crypto")
// const jwt = require('jsonwebtoken')
// const multer = require('multer')

const userRouter = require('./routes/user')
const postRouter = require('./routes/post')
const profileRouter = require('./routes/profile')
const inventionRouter = require('./routes/invention')
const refreshTokenRouter = require('./routes/refreshToken')
const socialAuthRouter = require('./routes/socialAuth')


//middleware
app.use(bodyParser.json());

app.use(cors({
      origin: ["https://www.spanner.cf"],

  //  origin: ["http://localhost:3001"],
    method: [
        "GET", "POST", "PUT", "DELETE"
    ],
    credentials: true
}));


//multer photo
app.use('/uploadProfile', express.static('uploadProfile'));
app.use('/uploadPost', express.static('uploadPost'));


//router
app.use('/user', userRouter)
app.use('/post', postRouter)
app.use('/profile', profileRouter)
app.use('/invention', inventionRouter)
app.use('/refreshToken', refreshTokenRouter)
app.use('/socialAuth', socialAuthRouter)




//root url TEST 
app.get('/', (req, res) => {
    post
        .findAll()
        .then(data => res.status(200).send(data))
})





// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
//  })


 // //https 1/3
const path = require('path')
const https = require('https')
const fs = require('fs')
const options = {
    key: fs.readFileSync(__dirname + '/pem/key.pem'),
    cert: fs.readFileSync(__dirname + '/pem/cert.pem')
    
}

// //https 2/3
app.use("/", express.static(__dirname + "/public"))
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// //https 3/3
https.createServer(options, app).listen(port, () => {
    console.log(`Example app listening at https://spanner.cf:${port}`)
})
