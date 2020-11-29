const express = require('express')
const app = express()
const port = 3000
const {user} = require('./models');
const {post} = require('./models');
const { invention } = require('./models');
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const crypto = require("crypto")

//middleware start
app.use(bodyParser.json());

app.use(
  cors({
      origin: ["http://localhost:3001"],
  method: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: "@korealand",
    resave: false,
    saveUninitialized: true,
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






app.get('/', (req, res) => {
  
  post.findAll().then(data=> res.status(200).send(data))

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})