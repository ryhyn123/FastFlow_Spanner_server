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


//https 1/3
const path = require('path')
const https = require('https')
const fs = require('fs')
const options = {
    key: fs.readFileSync(__dirname + '/pem/key.pem'),
    cert: fs.readFileSync(__dirname + '/pem/cert.pem')
    
}


//middleware
app.use(bodyParser.json());

app.use(cors({
      origin: ["https://www.spanner.cf"],

   // origin: ["http://localhost:3001"],
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

//https 2/3
app.use("/", express.static(__dirname + "/public"))
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


//root url TEST 
app.get('/', (req, res) => {
    post
        .findAll()
        .then(data => res.status(200).send(data))
})


//social signin (github, kakao) , MVC after TEST
//social signin (github, kakao) , MVC after TEST
//social signin (github, kakao) , MVC after TEST


const axios = require( "axios");

//깃허브 로그인테스트
//깃허브 로그인테스트
//깃허브 로그인테스트

app.post('/github/auth', async (req, res) => {
    
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      code:req.body.code,
      client_id:'',
      client_secret:'',
    },
    {
      headers: {
        accept: 'application/json',
      }
    }
  );
    
  const token = response.data.access_token;
  const githubUser = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  })  
    return res.status(201).json(githubUser.data);
    
})

///////카카오 테스트
///////카카오 테스트
///////카카오 테스트

app.post('/kakao/auth', async (req, res) => { 
  const kakaoUser = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
     Authorization: `Bearer ${req.body.token}`
  }
  })

    return res.status(201).send(kakaoUser.data);
  
})

//////
//////
//////




// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// })

//https 3/3
https.createServer(options, app).listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
