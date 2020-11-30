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


//post read start
app.get('/post/read', (req, res) => {
  post
        .findAll({
             
            include: [
                {
                    model: user,
                    required: false,
                    attributes: ['email','username', 'userPhoto']
                }, {
                    model: invention,
                    required: false,
                    attributes: ['id','title','text', 'inventionPhoto']
                }
            ],
            raw: true, 
            nest: true, 
        })
        .then(data => {
            console.log(data);
            return res
                .status(200)
                .send(data);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500); 
        });
 })
//post read end


//post write start
app.post('/post/write', authenticateToken,(req, res) => {  
    post.
    create({
      text: req.body.text,
      title: req.body.title,
      userId: req.user.userId,
      inventionId: req.body.postInfo 
    })
    .then((data) => {
      res.status(201).json(data)
    })   .catch((err) => { res.status(500).send('글쓰기 에러ㅋㅋ') })    
  })
//post write end


//post edit start //클라이언트 님, 211번 where는 해당 post의 id 값을 꼭 필요로 합니다. inventionId 도 보내주세욥
app.put('/post/edit', authenticateToken,(req, res) => {
    post.update({
    text: req.body.text, 
    title: req.body.title,
    postPhoto: req.body.postPhoto
  }, {
    where: { id:req.body.postId, userId:req.user.userId, inventionId:req.body.inventionId }
  })
 .then(result => {
     res.status(201).json(result);
  })
  .catch(err => {
     console.error(err);
     console.log('글수정 실패 ㅋ')
  });
});
//post edit end


//post delete start //클라이언트 님, 227번 where는 해당 post의 id 값을 꼭 필요로 합니다. inventionId 도 보내주세욥
app.delete('/post/delete',authenticateToken, (req, res) => {
    post.destroy({
     where: { id:req.body.postId, userId:req.user.userId, inventionId:req.body.inventionId }
  })
    .then(() => {
    res.status(201).send('success delete');
    })
    .catch(err => {
     console.error(err);
    console.log('글삭제 실패 ㅋㅋ')
  })
    })
//post delete end




app.get('/', (req, res) => {
  
  post.findAll().then(data=> res.status(200).send(data))

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})