const {user} = require('../models');
const crypto = require("crypto")

module.exports = {
  read : (req, res) => {
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
  },

  editPassword:(req, res) => {

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

  },
  
  delete:(req, res) => {
    user
        .destroy({
            where: {
                id: req.user.userId
            } 
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
  },

  editUsername:(req, res) => {
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

  },
  
  upload: (req, res) => {   

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
  },
  
  uploadDelte:(req, res) => {  
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
    }
  
  

}