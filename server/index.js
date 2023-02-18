const express = require("express")
const cors = require("cors")
const mongoose= require("mongoose")
const bcrypt = require("bcrypt")
const jwt=require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User =require("./models/User.js")

const app = express();

const salt=bcrypt.genSaltSync(10)
const secret='aahgdq7wy8u9huagyguihhdugaysd'
const PORT=process.env.PORT||4000

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(cookieParser())
//middleware
app.use(express.json());

mongoose.connect('mongodb+srv://rajahassan:9DoDJmQNu8xSkU18@cluster0.oup7mce.mongodb.net/?retryWrites=true&w=majority',()=>{
    console.log('DB connected');
})

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc=await User.create({username,
        password: bcrypt.hashSync(password,salt)
    })
  res.json(userDoc);
  } catch (e) {
    res.status(400).json(e)
  }
  
});

app.post('/login',async(req,res)=>{
    const{username,password} = req.body;
    const userDoc= await User.findOne({username});
    const passOk= bcrypt.compareSync(password,userDoc.password)
    if(passOk){
      jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
        if(err) throw err;
        res.cookie('token',token).json('ok')

      })

    }else{
        res.status(400).json('wrong credentials')
        
    }
})
app.get('/profile',(req,res)=>{
  const {token}=req.cookies;
  jwt.verify(token,secret,{},(err,info)=>{
      if(err) throw err;
      res.json(info)
  })

})





app.listen(PORT,()=>{
    console.log(`app listening on ${PORT}`);
});



//9DoDJmQNu8xSkU18

//mongodb+srv://rajahassan:9DoDJmQNu8xSkU18@cluster0.oup7mce.mongodb.net/?retryWrites=true&w=majority