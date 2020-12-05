const { post } = require('../models');
const {user} = require('../models');
const {invention} = require('../models');


module.exports = {

read:(req, res) => {
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
            return res
                .status(200)
                .send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
        });
  },

  write: (req, res) => {
   
    const { text, title, inventionId } = req.body;
   
    post
        .create(
            {text: text, title: title, userId: req.user.userId, inventionId: inventionId}
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
    },
  
  edit:(req, res) => {
    const { text, title, postId, inventionId } = req.body;
    post
        .update({
            text: text,
            title: title
        }, {
            where: {
                id: postId,
                userId: req.user.userId,
                inventionId: inventionId
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
  },
  
  delete: (req, res) => {
    const { postId, inventionId } = req.body;
    post
        .destroy({
            where: {
                id: postId,
                userId: req.user.userId,
                inventionId: inventionId
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
  },
  
  upload: (req, res) => {  
     const { postId, inventionId } = req.body;
        post
            .update({
                postPhoto: 'uploadPost/' + req.file.filename
            }, {
                where: {
                    id: postId,
                    userId: req.user.userId,
                    inventionId: inventionId
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
  },
  
  uploadDelete: (req, res) => { 
      const { postId, inventionId } = req.body;
    post
        .update({
            postPhoto: null
        }, {
            where: {
                id: postId,
                userId: req.user.userId,
                inventionId: inventionId
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

}
