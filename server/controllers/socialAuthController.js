const {user} = require('../models');
const axios = require( "axios");
require("dotenv").config();

module.exports = {

  kakao:async (req, res) => { 
  const kakaoUser = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
     Authorization: `Bearer ${req.body.token}`
  }
  })

    user
        .findOne({
            where: {
                email: `Kakao_${kakaoUser.data.id}`,
            }
        })
        .then((data) => {
            if (!data) {
                return res.status(201).json({ userInfo:kakaoUser.data, userCheck:true });       
            }
                    return res.status(201).json({ userInfo:kakaoUser.data, userCheck:false });
        
        })
    
  },
  
  github: async (req, res) => {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      code:req.body.code,
      client_id:process.env.CLIENT_ID,
      client_secret:process.env.CLIENT_SECRET,
    },
    {
      headers: {
        accept: 'application/json',
      }
    }
  );
    
  const token = response.data.access_token;
  const githubUser = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  })
  
    user
        .findOne({
            where: {
                email: `Github_${githubUser.data.id}`,
            }
        })
        .then((data) => {
            if (!data) {
                return res.status(201).json({ userInfo:githubUser.data, userCheck:true });       
            }
                    return res.status(201).json({ userInfo:githubUser.data, userCheck:false });
        
        })
    
    
    
    
}
  

}