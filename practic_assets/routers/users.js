const express = require("express");
const router = express.Router();


router.get("/",(req,res)=>{
    res.cookie("hello","world",{signed: true});
    res.cookie("prayFor","Nepal",{signed: true});
    res.cookie("name","Niraj");
    res.send("GET request for users");
});
// this is related to signed cookies
// req.cookies for unsigned cookies and req.signedCookies for the signed ones

router.get("/greet",(req,res)=>{
    console.dir(req.cookies);
    console.dir(req.signedCookies);
    let {name = "anonymous"} = req.cookies;
    let {hello} = req.signedCookies;
    res.send(`Hi, ${name} and hello ${hello}`);
});



router.post("/",(req,res)=>{
    res.send("POST request for users");
});
router.delete("/:id",(req,res)=>{
    res.send("DELETE request for users");
});
router.patch("/:id",(req,res)=>{
    res.send("UPDATE request for users");
});

module.exports = router;