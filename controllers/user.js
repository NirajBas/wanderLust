const User = require("../models/user.js");

module.exports.postSignup = async(req,res,next)=>{
    console.log("This is a post request for passport authorization");
    try{
        const {username,email,password} = req.body;
        let newUser = new User({
            email : email,
            username : username,
        });
        let registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {  // auto login after register
            if (err) return next(err);
            req.flash("registerSuccess", "Welcome to WanderLust!");
            res.redirect("/listings");
        });
    }catch(err){
        req.flash("formError",err.message);
        res.redirect("/signup");
    }
}
module.exports.getLogin = (req,res)=>{
    res.render("listings/login.ejs");
};

module.exports.logOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("logoutSuccess", "Logged out successfully");
        res.redirect("/");
    });
}