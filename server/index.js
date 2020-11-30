const express = require('express')
const app = express()
const port = 3000
const {user} = require('./models');
const {post} = require('./models');
const { invention } = require('./models');
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto")
const jwt = require('jsonwebtoken')

//middleware start
app.use(bodyParser.json());

app.use(
  cors({
      origin: ["http://localhost:3001"],
  method: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//middleware end


//signup start
app.post('/user/signup', (req, res) => {

  const { email, password, username } = req.body;
  
    const salt = Math.round((new Date().valueOf()*Math.random))
  const hashPwd = crypto.createHash("sha256").update(password+salt).digest("hex") 


    user
        .findOrCreate({
            where: {
                email: email
            },
            defaults: {
                username: username,
                password: hashPwd
            }
        })
        .then(async ([user, created]) => {

            if (!created) {
                return res
                    .status(409)
                    .send('invalid email / 이미 있는 이메일(나중삭제)')
            } else {
                const data = await user.get({plain: true});
                res
                    .status(201)
                    .json(data);
            }
        })
        .catch(err => {
            console.log('회원가입 오류뜸 (나중삭제)');
            console.error(err);
            res.sendStatus(500); // Server error
        });
})
//signup end


//signin start
app.post("/user/signin", (req, res) => {

    const {email, password} = req.body;

  const salt = Math.round((new Date().valueOf() * Math.random))
  const hashPwd = crypto.createHash("sha256").update(password+salt).digest("hex") 

          user
            .findOne({
              where: {
                email: email,
                password: hashPwd
              }
            })
            .then((data) => {
              console.log(data.id)
              if (!data) {
                return res
                  .status(404)
                  .send("exist user");
              } else { 
                const accessToken = jwt.sign({ email: email, userId: data.id }, 'secret', { expiresIn: '600s' })
                
              res.status(200).json({loginSuccess: true, msg: '토큰발급성공', accessToken: accessToken, id: data.id })
            }
                })
                .catch((err) => {
                    res
                        .status(404)
                        .send(err);
                });
});
//signin end


// JWT middleware start 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  console.log('토큰=>', token)
    if (token === null) {
        console.log('토큰없다')
        return res.sendStatus(401)
    } else {
        jwt.verify(token, 'secret', (err, user) => {
            if (err) {
                console.log('토큰에러');
                return res.sendStatus(403)
            } else {
              console.log('정상토큰이다 ㅋㅋ')
              console.log(user) //토큰 페이로드
              req.user = user
            next()
            }
        })
    }
}
// JWT middleware End


//signin test start
app.get('/user', authenticateToken, (req, res) => {
 
     user
                .findOne({
                    where: {
                        id: req.user.userId,
                    }
                })
       .then((result) => {
         return res.status(200).json(result);
       }) 
      .catch(err => {
        console.error(err);
        res.sendStatus(500); // Server error
      });
  })
//signin test end


//signout start
app.delete("/user/signout", authenticateToken, (req, res) => {
      res.status(205).send('success logout')
  });
//signout end












app.get('/', (req, res) => {
  
  post.findAll().then(data=> res.status(200).send(data))

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})