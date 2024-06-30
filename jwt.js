require('dotenv').config();
const Secret=process.env.SECRET;
const jwt=require('jsonwebtoken');

const jwtMiddleware=(req,res,next)=>{
    const authorization=req.headers.authorization;

    if(!authorization)return res.status(401).json({error:`Unauthorized`});
    const token=req.headers.authorization.split(' ')[1];

    if(!token)return  res.status(401).json({error:'Unauthorized'});

    try{
        const username=jwt.verify(token,Secret);

        req.username=username;
        next();
    }catch(err){
        res.status(401).json({error:"Invalid Token"});
    }
}

const generatetoken =(userId)=>{
    return jwt.sign(userId,Secret);
}

module.exports={jwtMiddleware,generatetoken};