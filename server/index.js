const express = require('express')
const app = express()
const port = 443
const {user} = require('./models');
const {post} = require('./models');
const { invention } = require('./models');
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto")
const jwt = require('jsonwebtoken')
const multer = require('multer')
const https = require('https')
const fs = require('fs')
require("dotenv").config();

//https test start

const options = {
  key : fs.readFileSync(__dirname + '/pem/key.pem'),
  cert : fs.readFileSync(__dirname + '/pem/cert.pem')
}

//https test end



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


//post edit start  
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


//post delete start  
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


//post photo upload and edit start (+setting)
 const _storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploadPost/');
    },
    filename: (req, file, cb) => {
     cb(null, Date.now() +"-"+ file.originalname);
    },
  })
const upload = multer({storage: _storage})//목적지
  
app.use('/uploadPost', express.static('uploadPost'));

app.put('/post/upload', authenticateToken, upload.single('image'), (req, res) => {//엔포,미들웨어
  post
    .update({
      postPhoto:'uploadPost/'+req.file.filename
    },
      {
        where: {
          id: req.body.postId, userId: req.user.userId, inventionId: req.body.postInfo
}})
    .then((data) => { 
      console.log(data)
      res.status(200).send(data)
    })
    .catch((err) =>
    console.log('에러뜸'))
})
//post photo upload and edit end


//post photo delete start
app.put('/post/upload/delete', authenticateToken, (req, res) => {//엔포,미들웨어
  post
    .update({
      postPhoto:null
    }, {
      where: {
        id: req.body.postId, userId: req.user.userId, inventionId: req.body.postInfo
}})
    .then((data) => { 
      console.log(data)
      res.status(200).send(data)
    })
    .catch((err) =>
    console.log('에러뜸'))
})
//post photo delete end


//profile read start
app.get('/profile/read', authenticateToken,(req, res) => {
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
        res.sendStatus(500); 
      });
  })
//profile read end


//profile password edit start
app.put('/profile/edit/password', authenticateToken,(req, res) => {
 
    const salt = Math.round((new Date().valueOf() * Math.random))
  const hashPwd = crypto.createHash("sha256").update(req.body.password+salt).digest("hex") 

    user.update({
password:hashPwd 
    }, {
    where: { id:req.user.userId  } 
  })
 .then(result => {
     res.json(result);
  })
  .catch(err => {
     console.error(err);
     console.log('비번번경 성공 ㅋㅋㅋ')
  });
    
});
//profile password edit end


//profile(account) delete start
app.delete('/profile/delete', authenticateToken,(req, res) => {
    user.destroy({
    where:{id:req.user.userId}//
  })
    .then((data) => {
    res.redirect('/')
    })
    .catch(err => {
     console.error(err);
    console.log('계정삭제 실패 ㅋㅋ')
  })
})
//profile delete end


//profile username edit start
app.put('/profile/edit/username', authenticateToken,(req, res) => {
    user.update({
username:req.body.username  
    }, {
    where: { id:req.user.userId  }    
  })
 .then(result => {
     res.json(result);
  })
  .catch(err => {
     console.error(err);
     console.log('username 변경 성공 ㅋㅋㅋ')
  });
    
});
//profile username edit end


//profile photo upload and edit start(+setting)
const _storageprofile = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploadProfile/');
    },
    filename: (req, file, cb) => {
     cb(null, Date.now() +"-"+ file.originalname);
    },
  })
const uploadProfile = multer({storage: _storageprofile})//목적지
  
app.use('/uploadProfile', express.static('uploadProfile'));

app.put('/profile/upload', authenticateToken, uploadProfile.single('image'), (req, res) => {//엔포,미들웨어

  user
    .update({
      userPhoto:'uploadProfile/'+req.file.filename
    }, {where:{id: req.user.userId
}})
    .then((data) => { 
      console.log(data)
      res.status(200).send(data)
    })
    .catch((err) =>
    console.log('에러뜸'))
   })
//profile photo upload and edit end


//profile photo delete start
app.put('/profile/upload/delete', authenticateToken, (req, res) => {//엔포,미들웨어    
  user
    .update({
      userPhoto:null
    }, {where:{id: req.user.userId
}})
    .then((data) => { 
      console.log(data)
      res.status(200).send(data)
    })
    .catch((err) =>
    console.log('에러뜸'))
   })
//profile photo delete end


//invention read start
app.get('/invention', (req, res) => {
  invention.findAll()
                     .then(data => {
            console.log(data);
            return res
                .status(200)
                .send(data);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500); // Server error
        });
})
//invention read end




app.get('/', (req, res) => {
console.log(__dirname)  
  post.findAll().then(data=> res.status(200).send(data))

})



//https test start 
//.env

// https.createServer({key:process.env.PEM_KEY, cert:process.env.PEM_CERT}, app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// }))

//file

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


//https test end



// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })