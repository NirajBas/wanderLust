const express = require("express");
const app = express();
const port = 8080;
const mongoose = require('mongoose');

app.listen(port,()=>{
    console.log("this server is currently running on port 8080");
});

app.get("path",(req,res)=>{
    console.log("this is a get request from the user");
});

