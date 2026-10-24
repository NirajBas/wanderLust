const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const expressError = require("./expressError");
const Review = require("./models/reviews.js");
//for validation purpose
const {listingSchema, reviewSchema} = require("./schema.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const { stripTypeScriptTypes } = require("module");
const {checkAuthentication} = require("./middlewares.js");
const {redirectUrl} = require("./middlewares.js");
const {checkOwner} = require("./middlewares.js");
const {checkAuthor} = require("./middlewares.js");
const {index} = require("./controllers/listing.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended :true}));
app.use(express.json());
app.use(methodOverride("_method"));

let sessionOptions = {
    secret : "niraj-dibya",
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires: Date.now()+ 7 *24*60*60*1000,
        maxAge : 7 *24*60*60*1000,
    }
}
app.use(session(sessionOptions));
app.use(flash());

// configurations related to passport for authentication
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.listingCreated = req.flash("listingCreated");
    res.locals.listingNotC = req.flash("listingNotC");
    res.locals.registerSuccess = req.flash("registerSuccess");
    res.locals.formError = req.flash("formError");
    res.locals.loginSuccess = req.flash("loginSuccess");
    res.locals.logoutSuccess = req.flash("logoutSuccess");
    res.locals.notAuthenticated = req.flash("notAuthenticated");
    res.locals.error = req.flash("error");
    res.locals.checkUser = req.user;
    next();
});

main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}

app.get("/",(req,res)=>{
        const token = req.query.token;
       res.render("listings/home.ejs");
});

// this part is for authorization using passport
// install passport passport-local for this
app.get("/signup",(req,res)=>{
    res.render("listings/form.ejs");
});

app.post("/signup",async(req,res,next)=>{
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
});

// this is a login route
app.get("/login",(req,res)=>{
    res.render("listings/login.ejs");
});
// this is the login authentication route 
app.post("/login", redirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,   // auto sets flash error on failure
    }), 
    (req, res) => {
        req.flash("loginSuccess", "Welcome back!");
        res.redirect(res.locals.redirectUrl || "/listings");
    }
);
// this is for logging out of the current session.
app.get("/logout",checkAuthentication, (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("logoutSuccess", "Logged out successfully");
        res.redirect("/");
    });
});

app.get("/listings",index);
app.get("/listings/new",checkAuthentication,(req,res)=>{
    res.render("listings/new.ejs");
});

// this is validating using joi.
let schemaValidate = (req,res,next)=>{
    console.log("this is a schema validator");
    console.log(req.body);
    let result = listingSchema.validate(req.body);
    if(result.error){
        let message = result.error.details[0].message;
        console.log(message);
        throw new expressError(400,message);
    }
    next();
};
// this is review validation using joi
let reviewValidate = (req,res,next)=>{
    console.log("this is a review validator");
    console.log(req.body);
    let result = reviewSchema.validate(req.body);
    console.log(result);
    if(result.error){
        let message = result.error.details[0].message;
        console.log(message);
        throw new expressError(400,message);
    }
    next();
};

app.post("/listings",checkAuthentication,schemaValidate,async (req,res,next)=>{
    try{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    console.log(newListing);
    await newListing.save();
    req.flash("listingCreated","New hotel added successfully");
    res.redirect("/listings");
    }catch(err){
        req.flash("listingNotC","no new hotel was added");
        next(err);
    }
});


//for updating the information
app.get("/listings/:id/edit",checkAuthentication,checkOwner,async (req,res)=>{
    const {id} = req.params;
    let hotelInfo =await Listing.findById(id);
    res.render("listings/update.ejs",{hotelInfo});
});
app.patch("/listings/:id",checkAuthentication,checkOwner,async (req,res)=>{
    const {id} = req.params;
    let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id,listing);
    res.redirect("/listings");
});
app.delete("/listings/:id",checkAuthentication,checkOwner,async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings/");
});

//reviews section
//post request for review
app.post("/listings/:id/reviews",checkAuthentication,reviewValidate,async (req,res,next)=>{
    try{
      const {id} = req.params;
      let listing = await Listing.findById(id);
      if(!listing){
          return next(new expressError(404,"listing not found"));
      }
      let newReview = new Review(req.body.review);
      newReview.author = req.user._id;
      listing.reviews.push(newReview);
      await newReview.save();
      await listing.save();
      res.redirect(`/listings/${id}`);
    }catch(err){
      next(err);
    }
});

app.delete("/listings/:id/reviews/:reviewId",checkAuthentication,checkAuthor,async (req,res,next)=>{
    try{
      const {id, reviewId} = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/listings/${id}`);
    }catch(err){
      next(err);
    }
});
//show post in detail
app.get("/listings/:id",async (req,res,next)=>{
     let {id} = req.params;
    console.log(id);
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });
    if(!listing){
       return next(new expressError(400,"your document could not be found"));
    }
    res.render("listings/listing.ejs",{listing});
});

// in case if the post is not found.
app.use((req,res,next)=>{
    console.log("the user has entered an incorrect path and is not allowed");
    return next(new expressError(404,"OOPS!!, page not found"));
});


app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name == "CastError"){
         return next(new expressError(500,"OOPS!!, your id was invalid"));
    }
    next(err);
});


app.use((err,req,res,next) =>{
    console.log("this is an error handling middleware");
    let {status =500,message ="Internal server error"} = err;
    res.status(status).render("listings/error.ejs",{msg : message});
});

app.listen(port,()=>{
    console.log("app is listening to server 8080");
});