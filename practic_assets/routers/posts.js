const express = require("express");
const router = express.Router();

router.get("/",(req,res)=>{
    res.send("GET request for posts");
});
router.post("/",(req,res)=>{
    res.send("POST request for posts");
});
router.delete("/:id",(req,res)=>{
    res.send("DELETE request for posts");
});
router.patch("/:id",(req,res)=>{
    res.send("UPDATE request for posts");
});

module.exports = router;