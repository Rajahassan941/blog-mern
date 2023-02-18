const { model,mongoose  } = require("mongoose");

const{Schema}=mongoose;

const Userschema=new Schema({
        username:{
            type:'String',
            required:true,
            min:4
        },
        password:{
            type:'String',
            required:true,
            unique:true
        }
})

const UserModel=model('User',Userschema)
module.exports=UserModel;