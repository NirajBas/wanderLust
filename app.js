if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

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
// listing controllers.
const {index, home, postListings, editListing, displayListing, destroyListing, getListing} = require("./controllers/listing.js");
const { categories } = require("./utils/categories.js");
// reviews controllers.
const { postReviews, destroyReview } = require("./controllers/reviews.js");
const { postSignup, getLogin, logOut } = require("./controllers/user.js");
const multer  = require('multer');
const {storage} = require("./config/cloudinary.js");
const upload = multer({storage});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended :true}));
app.use(express.json());
app.use(methodOverride("_method"));

let sessionOptions = {
    secret : process.env.SESSION_SECRET,
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
    // used by the navbar search, filter bar and listing forms
    res.locals.categories = categories;
    res.locals.searchQuery = typeof req.query.q === "string" ? req.query.q : "";
    next();
});

main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

app.get("/",home);

// this part is for authorization using passport
// install passport passport-local for this
app.get("/signup",(req,res)=>{
    res.render("listings/form.ejs");
});

app.post("/signup",postSignup);

// this is a login route
app.get("/login",getLogin);
// this is the login authentication route 
app.post("/login", redirectUrl,
    // here, .authenticate makes completely new session so the entire session data is swept away.
    // to prevent the url, we assign the session original url to the res.locals
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
app.get("/logout",checkAuthentication, logOut);

app.get("/listings",index);
app.get("/listings/new",checkAuthentication,(req,res)=>{
    res.render("listings/new.ejs");
});

// this is validating using joi.
let schemaValidate = (req,res,next)=>{
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
// checkAuthentication, schemaValidate, postListings
app.post("/listings",upload.single('listing[image]'),checkAuthentication,schemaValidate,postListings);


//for updating the information
app.get("/listings/:id/edit",checkAuthentication,checkOwner,displayListing);

app.patch("/listings/:id",upload.single('listing[image]'),checkAuthentication,checkOwner,editListing);

app.delete("/listings/:id",checkAuthentication,checkOwner,destroyListing);

//reviews section
app.post("/listings/:id/reviews",checkAuthentication,reviewValidate,postReviews);

app.delete("/listings/:id/reviews/:reviewId",checkAuthentication,checkAuthor,destroyReview);
//show post in detail
app.get("/listings/:id",getListing);

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