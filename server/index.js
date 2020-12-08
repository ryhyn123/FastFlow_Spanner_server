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
    //  origin: ["http://spanner.s3-website.ap-northeast-2.amazonaws.com"],

    origin: ["http://localhost:3001"],
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
    //console.log('깃허브 로그인 요청옴')
    //console.log(req.body.code)
    
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      code:req.body.code,
      client_id:'db63ccbb62de73c0baac',
      client_secret:'d53d922b996a2ddfcd9c596e86d110f979eaea43',
    },
    {
      headers: {
        accept: 'application/json',
      }
    }
  );
    //console.log('response=>',response.data.access_token)
  const token = response.data.access_token;
  const githubUser = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  })  
  
//console.log('회원가입전')
axios.post('http://localhost:3000/user/signup', {
    email: `Github_${githubUser.data.id}`,
    username: `${githubUser.data.login}`,
    password: `${githubUser.data.id}`
  })
//console.log('회원가입후')
//console.log('로그인 전')
 axios.post('http://localhost:3000/user/signin', {
        email: `Github_${githubUser.data.id}`,
        password: `${githubUser.data.id}`,
      })
//console.log('로그인후')

    return res.status(201).send(token);
    
})

///////카카오 테스트
///////카카오 테스트
///////카카오 테스트

app.post('/kakao/auth', async (req, res) => { 
    console.log(`req.body.token=>${req.body.token}`)
  const kakaoUser = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
     Authorization: `Bearer ${req.body.token}`
  }
   
  })
    console.log(`kakaoUserkakaoUser=>${kakaoUser.data.id}`)
//console.log('회원가입전')

  axios.post('http://localhost:3000/user/signup', {
    email: `Kakao_${kakaoUser.data.id}`,
    username: `${kakaoUser.data.properties.nickname}`,
    password: `${kakaoUser.data.id}`
  })
//console.log('회원가입후')
//console.log('로그인 전')

  axios.post('http://localhost:3000/user/signin', {
      email: `Kakao_${kakaoUser.data.id}`,
        password: `${kakaoUser.data.id}`,
  })
//console.log('로그인후')
  
//console.log(`req.body.token=>${req.body.token}`)
  return res.status(201).send(req.body.token);
  
})

//////
//////
//////




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

