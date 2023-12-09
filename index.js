import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import { validationResult } from "express-validator";
import UserModel from "./models/User.js";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import checkAuth from './utils/checkAuth.js'
const app = express();

mongoose
  .connect(
    "mongodb+srv://admin:banan4iki@cluster0.a0kicsv.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => console.log("db ok!"))
  .catch((err) => {
    console.log("db not ok! ", err);
  });
app.use(express.json()); // учим читать express json формат

app.get("/", (req, res) => {
  // если get запрос, то возвр. ф-ию с request and response
  res.send("hello world!");
});

app.post("/auth/login", async (req, res) => {
  //login
  try {
    const user = await UserModel.findOne({ email: req.body.email }); // ищем user по email

    if (!user) {
      return res.status(404).json({ // если не нашли
        message: "Пользователь не найден",
      });
    }
    const isValidPass = await bcrypt.compare( //проверяем пароли
      req.body.password, //тот что мы отправили
      user._doc.passwordHash //тот что в bd (нашли по email)
    );
    if (!isValidPass) {
      return res.status(400).json({
        message: "Не верный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    return req.status(404).json({
      message: "Не удалось авторизоваться",
    });
  }
});

app.post("/auth/register", registerValidation, async (req, res) => {
  // регистрация
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10); // алгоритм шифрования пароля
    const hash = await bcrypt.hash(password, salt); // зашифрованный пароль

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегестрироваться",
    });
  }
});

app.get('/auth/me', checkAuth, (res, req) => {
  try{

  } catch (err){ }
})

app.listen(4444, (err) => {
  if (err) {
    return console.log(ertt);
  }

  console.log("Server - OK!");
});
