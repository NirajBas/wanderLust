const express = require("express");
const app = express();
const port = 8080;
const expressError = require("./expressError");

 const apiToken =(req,res,next)=>{
    console.log("this is 1st middleware authentication");
    let {token} = req.query;
    if(token === "accessgranted"){
       return next();
    }
    throw new expressError(401,"Access Denied");
};
const pathToken =(req,res,next)=>{
    console.log("this is a second middleware for home route");
    return next();
};


// this proves that middlewares are the main security handlers and we do the authentication and authorization it the middlewares. So I must be learning the full backend concepts of middlewares and request and response handling. This is a key concept which I must not ignore.
app.get("/",(req,res)=>{
   res.send("data");
});

app.get("/paths",apiToken,(req,res)=>{
    abcd = abcd;
});


app.get("/random",apiToken,pathToken,(req,res)=>{
    console.log("This is a random route handler");
    res.send("hello world this is a random route handler");
});

const adminHandler = (req,res,next)=>{
    let {username} = req.query;
    if(username == "admin"){
        return next();
    }
    throw new expressError(403,"you are forbidden to this page!!!!");
}

app.get("/admin",adminHandler,(req,res)=>{
    console.log("This is an admin route handler");
    res.send("welcome to the admin dashboard");
    
});

app.use("/admin",(err,req,res,next)=>{
    console.log("this page is for the admin of our tech department");
    next(err);
});


app.use((err,req,res,next)=>{
    console.log("this is an error handling middleware first one");
    let {status =500,message= "some broken backend code"} = err;
    console.log(message);
    res.status(status).send(message);
});

app.use((err,req,res,next)=>{
    console.log("--------Error-----------");
    next(err);
});

app.listen(port,()=>{
    console.log("app is listening on server 8080");
});