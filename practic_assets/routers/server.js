const express = require("express");  
const app = express();
const posts = require("./posts");
const users = require("./users");
const cookieParser = require("cookie-parser");

app.use(cookieParser("secret-code"));
app.use("/users",users);
app.use("/posts",posts);

app.listen(8080,()=>{
    console.log("app is listening to server 8080");
});


