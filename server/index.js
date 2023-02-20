const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const multer = require("multer");
const fs = require("fs");
const { request } = require("http");

const app = express();

const uploadMiddleware = multer({ dest: "uploads/" });
const salt = bcrypt.genSaltSync(10);
const secret = "aahgdq7wy8u9huagyguihhdugaysd";
const PORT = process.env.PORT || 4000;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
//middleware
app.use(express.json());

mongoose.connect(
  "mongodb+srv://rajahassan:287128@cluster0.zt2u6br.mongodb.net/?retryWrites=true&w=majority", 
  () => {
    console.log("DB connected");
  }
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userDoc = await User.findOne({ username });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json("wrong credentials");
    }
  } else {
    console.log("wrong");
  }
});
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});
app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const extension = parts[parts.length - 1];
  const newpath = path + "." + extension; 
  fs.renameSync(path, newpath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body; 
    const postDoc = await Post.create({
      title,
      content,
      summary,
      cover: newpath,
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get('/post/:id',async(req,res)=>{
  const {id}=req.params
  const postDoc=await Post.findById(id).populate('author',['username'])
  res.json(postDoc)
})

app.listen(PORT, () => {
  console.log(`app listening on ${PORT}`);
});

//9DoDJmQNu8xSkU18

//mongodb+srv://rajahassan:9DoDJmQNu8xSkU18@cluster0.oup7mce.mongodb.net/?retryWrites=true&w=majority
