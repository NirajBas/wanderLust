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
const {listingSchema, reviewSchema} = require("./schema.js");
const session = require("express-session");
const flash = require("connect-flash");

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

app.use((req,res,next)=>{
    res.locals.listingCreated = req.flash("listingCreated");
    res.locals.listingNotC = req.flash("listingNotC");
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

app.get("/listings",async (req,res,next)=>{
    try{
      let allListings = await Listing.find({});
      if(allListings.length == 0){
       return next(new expressError(404,"cannot get the listings"));
      }
      res.render("./listings/index.ejs",{allListings});
    }catch(err){
        next(new expressError(500,"I dont know what type of error is this"));
    }
});
app.get("/listings/new",(req,res)=>{
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

app.post("/listings",schemaValidate,async (req,res,next)=>{
    try{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("listingCreated","New hotel added successfully");
    res.redirect("/listings");
    }catch(err){
        req.flash("listingNotC","no new hotel was added");
        next(err);
    }
});


//for updating the information
app.get("/listings/:id/edit",async (req,res)=>{
    const {id} = req.params;
    let hotelInfo =await Listing.findById(id);
    res.render("listings/update.ejs",{hotelInfo});
});
app.patch("/listings/:id",async (req,res)=>{
    const {id} = req.params;
    let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id,listing);
    res.redirect("/listings");
});
app.delete("/listings/:id",async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings/");
});

//reviews section
//post request for review
app.post("/listings/:id/reviews",reviewValidate,async (req,res,next)=>{
    try{
      const {id} = req.params;
      let listing = await Listing.findById(id);
      if(!listing){
          return next(new expressError(404,"listing not found"));
      }
      let newReview = new Review(req.body.review);
      listing.reviews.push(newReview);
      await newReview.save();
      await listing.save();
      res.redirect(`/listings/${id}`);
    }catch(err){
      next(err);
    }
});

app.delete("/listings/:id/reviews/:reviewId",async (req,res,next)=>{
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
    const listing = await Listing.findById(id).populate("reviews");
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
    res.status(status).send(message);
});

app.listen(port,()=>{
    console.log("app is listening to server 8080");
});