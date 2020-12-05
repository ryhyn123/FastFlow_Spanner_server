const {user} = require('../models');
 const jwt = require('jsonwebtoken')

module.exports = {

  refreshToken: (req, res) => {

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
            }, 'secret', { expiresIn: '30m' })
            res
              .status(200)
              .json({ msg: '토큰발급성공', accessToken: accessToken, id: reToken.userId })
          })
        } else {
          console.log('리프레시 토큰 요청에 대한 엑세스 토큰 발급 실패')
        }
      })
  }
}