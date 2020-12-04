const express = require('express')
const app = express()
const port = 3000
const {user} = require('./models');
const {post} = require('./models');
const {invention} = require('./models');
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto")
const jwt = require('jsonwebtoken')
const multer = require('multer')


//middleware start
app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors({
    // origin: ["http://spanner.s3-website.ap-northeast-2.amazonaws.com"],

    origin: ["http://localhost:3001"],
    method: [
        "GET", "POST", "PUT", "DELETE"
    ],
    credentials: true
}));
//middleware end 


//signup start
app.post('/user/signup', (req, res) => {

    const {email, password, username} = req.body;
    const salt = Math.round((new Date().valueOf() * Math.random))
    const hashPwd = crypto
        .createHash("sha256")
        .update(password + salt)
        .digest("hex")

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
                    .send("Email already exists")
            } else {
                const data = await user.get({plain: true});
                const sendData = {
                    id: data.id,
                    username: data.username,
                    email: data.email
                }
                res
                    .status(201)
                    .json(sendData);
            }
        })
        .catch(err => {
            res
                .status(404)
                .send(err);
        });
})
//signup end 


//signin start
app.post("/user/signin", (req, res) => {

    const {email, password} = req.body;

    const salt = Math.round((new Date().valueOf() * Math.random))
    const hashPwd = crypto
        .createHash("sha256")
        .update(password + salt)
        .digest("hex")

    user
        .findOne({
            where: {
                email: email,
                password: hashPwd
            }
        })
        .then((data) => {
            if (!data) {
                return res
                    .status(404)
                    .send("Couldn't find the User");
            } else {
                const accessToken = jwt.sign({
                    email: email,
                    userId: data.id
                }, 'secret', {expiresIn: '600s'})

                const refreshToken = jwt.sign({
                    email: email,
                    userId: data.id
                }, 'secretRefresh', {expiresIn: '1d'})

                user.update({
                    refreshToken: refreshToken
                }, {
                    where: {
                        id: data.id
                    }
                })

                const sendData = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    userPhoto: data.userPhoto,
                    loginSuccess: true,
                    msg: '토큰발급성공',
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
                res
                    .status(200)
                    .json(sendData)
            }
        })
        .catch((err) => {
            res
                .status(500)
                .send(err);
        });
});
//signin end 


//JWT middleware start
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) {
        return res.sendStatus(401)
    } else {
        jwt.verify(token, 'secret', (err, user) => {
            if (err) {
                return res.sendStatus(403)
            } else {
                req.user = user
                next()
            }
        })
    }
}
// JWT middleware End 


//JWT refreshToken start
app.post('/refreshToken', (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken === null) 
        return res.sendStatus(401)

    user
        .findOne({
            where: {
                refreshToken: refreshToken
            }
        })
        .then((token) => {
            if (token) {
                jwt.verify(refreshToken, 'secretRefresh', (err, reToken) => {
                    if (err) 
                        return res.sendStatus(403)

                    const accessToken = jwt.sign({
                        email: reToken.email,
                        userId: reToken.userId
                    }, 'secret', {expiresIn: '600s'})
                    res
                        .status(200)
                        .json({msg: '토큰발급성공', accessToken: accessToken, id: reToken.userId})
                })
            } else {
                console.log('리프레시 토큰 요청에 대한 엑세스 토큰 발급 실패')
            }
        })
})
//JWT refreshToken end 


//signin test start
app.get('/user', authenticateToken, (req, res) => {

    user
        .findOne({
            where: {
                id: req.user.userId
            }
        })
        .then((data) => {
            return res
                .status(200)
                .json(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        });
})
//signin test end 


//signout start
app.delete("/user/signout", authenticateToken, (req, res) => {
    res
        .status(205)
        .send("successfully signed out!")
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
                    attributes: ['email', 'username', 'userPhoto']
                }, {
                    model: invention,
                    required: false,
                    attributes: ['id', 'title', 'text', 'inventionPhoto']
                }
            ],
            raw: true,
            nest: true
        })
        .then(data => {
            console.log(data);
            return res
                .status(200)
                .send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        });
})
//post read end 


//post write start
app.post('/post/write', authenticateToken, (req, res) => {
    post
        .create(
            {text: req.body.text, title: req.body.title, userId: req.user.userId, inventionId: req.body.postInfo}
        )
        .then((data) => {
            res
                .status(201)
                .json(data)
        })
        .catch((err) => {
            res
                .status(500)
                .send(err);
        })
    })
//post write end 


//post edit start
app.put('/post/edit', authenticateToken, (req, res) => {
    post
        .update({
            text: req.body.text,
            title: req.body.title
        }, {
            where: {
                id: req.body.postId,
                userId: req.user.userId,
                inventionId: req.body.inventionId
            }
        })
        .then(data => {
            res
                .status(201)
                .json(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        });
});
//post edit end 


//post delete start
app.delete('/post/delete', authenticateToken, (req, res) => {
    post
        .destroy({
            where: {
                id: req.body.postId,
                userId: req.user.userId,
                inventionId: req.body.inventionId
            }
        })
        .then(() => {
            res
                .status(200)
                .send("successfully deleted!");
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//post delete end 


//post photo upload and edit start (+setting)
const _storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadPost/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})
const upload = multer({storage: _storage}) //목적지

app.use('/uploadPost', express.static('uploadPost'));

app.put(
    '/post/upload',
    authenticateToken,
    upload.single('image'),
    (req, res) => { //엔포,미들웨어
        post
            .update({
                postPhoto: 'uploadPost/' + req.file.filename
            }, {
                where: {
                    id: req.body.postId,
                    userId: req.user.userId,
                    inventionId: req.body.postInfo
                }
            })
            .then((data) => {
                console.log(data)
                res
                    .status(200)
                    .send(data)
            })
            .catch(err => {
                res
                    .status(500)
                    .send(err);
            })
        }
)
//post photo upload and edit end 


//post photo delete start
app.put('/post/upload/delete', authenticateToken, (req, res) => { //엔포,미들웨어
    post
        .update({
            postPhoto: null
        }, {
            where: {
                id: req.body.postId,
                userId: req.user.userId,
                inventionId: req.body.postInfo
            }
        })
        .then((data) => {
            console.log(data)
            res
                .status(200)
                .send(data)
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//post photo delete end 


//profile read start
app.get('/profile/read', authenticateToken, (req, res) => {
    user
        .findOne({
            where: {
                id: req.user.userId
            }
        })
        .then((data) => {
            return res
                .status(200)
                .json(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//profile read end 


//profile password edit start
app.put('/profile/edit/password', authenticateToken, (req, res) => {

    const salt = Math.round((new Date().valueOf() * Math.random))
    const hashPwd = crypto
        .createHash("sha256")
        .update(req.body.password + salt)
        .digest("hex")

    user
        .update({
            password: hashPwd
        }, {
            where: {
                id: req.user.userId
            }
        })
        .then(() => {
            res
                .status(201)
                .send("successfully edited password !");
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })

    });
//profile password edit end 


//profile(account) delete start
app.delete('/profile/delete', authenticateToken, (req, res) => {
    user
        .destroy({
            where: {
                id: req.user.userId
            } //
        })
        .then((data) => {
            res
                .status(200)
                .send("successfully deleted!")
            res.redirect('/')
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//profile delete end 


//profile username edit start
app.put('/profile/edit/username', authenticateToken, (req, res) => {
    user
        .update({
            username: req.body.username
        }, {
            where: {
                id: req.user.userId
            }
        })
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })

    });
//profile username edit end 


//profile photo upload and edit start(+setting)
const _storageprofile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadProfile/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})
const uploadProfile = multer({storage: _storageprofile}) //목적지

app.use('/uploadProfile', express.static('uploadProfile'));

app.put(
    '/profile/upload',
    authenticateToken,
    uploadProfile.single('image'),
    (req, res) => { //엔포,미들웨어

        user
            .update({
                userPhoto: 'uploadProfile/' + req.file.filename
            }, {
                where: {
                    id: req.user.userId
                }
            })
            .then((data) => {
                res
                    .status(200)
                    .send(data)
            })
            .catch(err => {
                res
                    .status(500)
                    .send(err);
            })
        }
)
//profile photo upload and edit end 


//profile photo delete start
app.put('/profile/upload/delete', authenticateToken, (req, res) => { //엔포,미들웨어
    user
        .update({
            userPhoto: null
        }, {
            where: {
                id: req.user.userId
            }
        })
        .then(() => {
            res
                .status(200)
                .send("successfully deleted!")
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//profile photo delete end 


//invention read start
app.get('/invention/:id', (req, res) => {
    const inventionId = req
        .params
        .id

        invention
        .findOne({
            where: {
                id: inventionId
            }
        })
        .then(data => {
            console.log(data);
            return res
                .status(200)
                .send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        })
    })
//invention read end

app.get('/', (req, res) => {
    console.log(__dirname)
    post
        .findAll()
        .then(data => res.status(200).send(data))

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})