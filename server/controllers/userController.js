const {user} = require('../models');
const crypto = require("crypto")
const jwt = require('jsonwebtoken')


module.exports = {

  signup:(req, res) => {
console.log('요청옴')
    const { email, password, username } = req.body;
    
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
  },
  
  signin:(req, res) => {

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
                }, 'secret', {expiresIn: '30m'})

                const refreshToken = jwt.sign({
                    email: email,
                    userId: data.id
                }, 'secretRefresh', {expiresIn: '24h'})

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
  },
  
  signout: (req, res) => {
    res
      .status(205)
      .send("successfully signed out!")
  },
 
  userinfo: (req, res) => {
   
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
}

}