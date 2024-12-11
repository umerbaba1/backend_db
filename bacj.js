const express=require("express")
const app =express()
const mongoose=require("mongoose")
const{UserModel , ToDoModel}=require('./db')
const jwt=require("jsonwebtoken")
const JSON_PASS="akdnjkasndkuausnd"
mongoose.connect("mongodb+srv://umer:7JeFHoBqTX4PbdIp@amazon.eitro.mongodb.net/ToDo-Databse")

app.use(express.json())

function authenticator(req,res,next){
    const token = req.headers["token"]
    if(!token){
        res.json("Please Login ")
    }
   try{
    const decoded=jwt.verify(token,JSON_PASS)
    req.userData=decoded.user
    next()

   }catch(err){
    console.log(err)
    res.status(404).json("Login Again")
   }

}

app.post('/signup', async function(req,res){

    const email=req.body.email
    const password=req.body.password
    const username=req.body.username

     await UserModel.create({
        email:email,
        password:password,
        username:username
    })

    res.json("You are Signed Up")


})

app.post('/signin',async function(req,res){

    const email=req.body.email
    const password=req.body.password

    const user= await UserModel.findOne({
        email:email,
        password:password
    })
    if(user){
        const token=jwt.sign({
            user:user._id.toString()
        },JSON_PASS)


        res.json({
            token,
            msg:"You are Signed In"
        })
    }else{
        res.status(403).json("Invalid Credentials")
    }
    

})
app.get('/test',authenticator, async function(req,res){
    const data=req.userData
    const userData= await UserModel.findById(data)
    res.json(userData.username)

})
app.post('/todo',authenticator,async function (req,res) {
    const userId=req.userData
    const data=req.body.description
    await ToDoModel.create({
        description:data,
        id:userId
    })

    res.json("Description added")
    
})

app.get('/to-do',authenticator,async function(req,res) {
    const userId=req.userData
    const dataUser= await ToDoModel.findOne({
        id:userId
    })
    res.json(dataUser)
    
})
app.listen(3009,()=>{
    console.log("http://192.168.29.252:3009/")
}
)