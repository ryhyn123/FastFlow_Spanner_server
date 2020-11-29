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


//signin start

app.post("/user/signin", (req, res) => {

    const {email, password} = req.body;

  const salt = Math.round((new Date().valueOf() * Math.random))
  const hashPwd = crypto.createHash("sha256").update(password+salt).digest("hex") 

    req
        .session
        .regenerate(() => {
            user
                .findOne({
                    where: {
                        email: email,
                        // password: password
                        password: hashPwd
                    }
                })
                .then((data) => {
                  console.log(data.id)
                    if (!data) {
                        return res
                            .status(404)
                            .send("invalid user / 이미있는유저(delete)");
                    }
                    req.session.userid = data.id;
                    res
                        .status(200)
                        .json(data
                          // {
                          //   id: data.id, email: data.email, username: data.username, profile_image: data.profile_image, createdAt: data.createdAt, updatedAt: data.updatedAt,
                          // session:req.session.userid}
                        );
                })
                .catch((err) => {
                    res
                        .status(404)
                        .send(err);
                });
        });
});
//signin end

////////로그인 test start
app.get('/user', (req, res) => {
  if (req.session.userid) {

     user
                .findOne({
                    where: {
                        id: req.session.userid,
                    }
                })
       .then((result) => {
         return res.status(200).json(result);
       }) 
      .catch(err => {
        console.error(err);
        res.sendStatus(500); // Server error
      });
  }
  })
//////로그인 test end


app.get('/', (req, res) => {
  
  post.findAll().then(data=> res.status(200).send(data))

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})