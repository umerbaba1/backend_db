const express = require("express");
const app = express();
const { z } = require("zod");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { UserModel, ToDoModel } = require("./db");
const jwt = require("jsonwebtoken");
const JSON_PASS = "akdnjkasndkuausnd";
mongoose.connect(
  "mongodb+srv://umer:7JeFHoBqTX4PbdIp@amazon.eitro.mongodb.net/ToDo-Databse"
);

app.use(express.json());

function authenticator(req, res, next) {
  const token = req.headers["token"];
  if (!token) {
    res.json("Please Login ");
  }
  try {
    const decoded = jwt.verify(token, JSON_PASS);
    req.userData = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    res.status(404).json("Login Again");
  }
}

app.post("/signup", async function (req, res) {
    
  const userSchema = z.object({
    email: z.string().min(5).max(30).email(),
    password: z.string().min(3).max(100),
    username: z.string().min(7).max(100),
  });

//   console.log(userSchema.safeParse)

  const userSchemaProcess = userSchema.safeParse(req.body);
//   console.log(userSchemaProcess.success,userSchemaProcess.error)
  if (!userSchemaProcess.success) {
    res.json({
      msg: "Incorrect pattern",
      error: userSchemaProcess.error,
    });
    return
  }
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  try {
    const hashedpassword = await bcrypt.hash(password, 5);
    await UserModel.create({
      email: email,
      password: hashedpassword,
      username: username,
    });
    res.json("You are Signed Up");
  } catch (err) {
    res.json("Please Sign up again");
  }
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserModel.findOne({
      email: email,
    });
    if (!user) {
      res.json("Please SignUp first in order to login");
    }
    const hashedpassword = await bcrypt.compare(password, user.password);
    if (user && hashedpassword) {
      const token = jwt.sign(
        {
          user: user._id.toString(),
        },
        JSON_PASS
      );
      res.json({
        token,
        msg: "You are Signed In",
      });
    } else {
      res.status(403).json("User doesnot exist ");
    }
  } catch (err) {
    res.json("Cannot SignIn.. Please Try Again");
  }
});
app.get("/test", authenticator, async function (req, res) {
  const data = req.userData;
  const userData = await UserModel.findById(data);
  res.json(userData.username);
});
app.post("/todo", authenticator, async function (req, res) {
  const userId = req.userData;
  const data = req.body.description;
  await ToDoModel.create({
    description: data,
    id: userId,
  });

  res.json("Description added");
});

app.get("/todo", authenticator, async function (req, res) {
  const userId = req.userData;
  const dataUser = await ToDoModel.find({
    id: userId,
  });
  res.json(dataUser);
});

app.delete("/todo",authenticator,async(req,res)=>{
    const userId=req.userData
    const todoInfo= await ToDoModel.findOneAndDelete({
        id:userId
    })
    res.json("Todo Deleted")

})

app.put('/todo',authenticator,async(req,res)=>{
    const userId=req.userData
    const descriptionData=req.body.descriptionup
    await ToDoModel.findOneAndUpdate(
        {id:userId},
        {description:descriptionData}
    )
    res.json(`Updated the description to ${descriptionData}`)
})

app.listen(3009, () => {
  console.log("http://192.168.29.252:3009/");
});
