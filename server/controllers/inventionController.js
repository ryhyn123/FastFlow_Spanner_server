const {invention} = require('../models');

module.exports = {

read:(req, res) => {
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
}
}