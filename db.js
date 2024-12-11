const { type } = require("express/lib/response")
const mongoose=require("mongoose")

const Schema=mongoose.Schema
const ObjectId=Schema.ObjectId

const User=new Schema({
    email:{type:String,unique:true},
    password:String,
    username:String
})

const ToDo= new Schema({
    description:String,
    id:ObjectId
})

const UserModel=mongoose.model("users",User)
const ToDoModel=mongoose.model("to-do",ToDo)

module.exports={
    UserModel,
    ToDoModel
}