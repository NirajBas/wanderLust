const express = require("express");
const app = express();
const posts = require("./posts");
const users = require("./users");
var session = require('express-session');
const flash = require("connect-flash");
const path = require("path");
const { nextTick } = require("process");
// resave : false prevents the modification of the session storage on each request even when the session was not modified on that request.
const sessionInfo = {
    secret: "secret-information",
    resave: false,
    saveUninitialized: true
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(session(sessionInfo));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.message = req.flash("info");
    res.locals.error = req.flash("err");
    next();
});

app.get("/register",(req,res)=>{
    let {name ="anonymous"} = req.query;
    req.session.name = name;
    if(name === "anonymous"){
        req.flash("err","user not registered");
    }else{
        req.flash("info","a username has been registered successfully");
    }
    res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
    console.log(req.session);
    res.render("flash.ejs",{name : req.session.name});
});

app.get("/getpost", (req, res) => {
    console.log(req.session);
    console.log(req.session.count);
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send("this is a get post request");
});

app.listen(8080, () => {
    console.log("app is listening to server 8080");
});


