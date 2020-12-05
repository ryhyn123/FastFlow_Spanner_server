const express = require('express')
const app = express()
const port = 3000
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


//middleware
app.use(bodyParser.json());

app.use(cors({
     origin: ["http://spanner.s3-website.ap-northeast-2.amazonaws.com"],

    //origin: ["http://localhost:3001"],
    method: [
        "GET", "POST", "PUT", "DELETE"
    ],
    credentials: true
}));

//router
app.use('/user', userRouter)
app.use('/post', postRouter)
app.use('/profile', profileRouter)
app.use('/invention', inventionRouter)
app.use('/refreshToken', refreshTokenRouter)



 

app.get('/', (req, res) => {
    console.log('루트 URL TEST')
    post
        .findAll()
        .then(data => res.status(200).send(data))

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

