 const jwt = require('jsonwebtoken')


//JWT middleware
exports.authenticateToken=(req, res, next)=> {
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

