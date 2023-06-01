import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserById, registerUser, findUserByEmail } from "./db/users.js";

// init
const app = express();
const PORT = process.env.PORT || 3500;

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// setup view engines
app.set("view engine", "ejs");

// middleware fn
const isAuthenticated = async (req, res, next) => {
  const { logintoken } = req.cookies;

  if (logintoken) {
    const decodedData = jwt.verify(logintoken, process.env.JWTSECRET);
    req.user = await findUserById(decodedData.id);
    next();
  } else {
    res.redirect("login");
  }
};

// HOME page
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { validUser: req.user.email });
});

// Register page
app.get("/register", (req, res) => {
  res.render("register");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Logout page
app.get("/logout", (req, res) => {
  res.cookie("logintoken", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.redirect("/");
});

// send register data
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || (!password && !email)) {
    res.render("register", { register: "all fields required!" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await registerUser(email, hashPassword);

  newUser === null
    ? res.render("register", { register: "user already exists!" })
    : res.render("register", { register: "user registration success!" });
});

// send login data
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || (!password && !email)) {
    res.render("login", { login: "all fields required!" });
    return;
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser === null) {
    res.render("login", { login: "invalid credentials!" });
    return;
  }

  const match = await bcrypt.compare(password, existingUser.password);

  if (!match) {
    res.render("login", { login: "invalid credentials!" });
    return;
  }

  const jwtToken = jwt.sign({ id: existingUser.id }, process.env.JWTSECRET);

  res.cookie("logintoken", jwtToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 300 * 1000),
  });

  res.redirect("/");
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
