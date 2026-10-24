const Listing = require("../models/listing.js");

module.exports.index = async (req,res,next)=>{
    try{
      let allListings = await Listing.find({});
      if(allListings.length == 0){
       return next(new expressError(404,"cannot get the listings"));
      }
      res.render("./listings/index.ejs",{allListings});
    }catch(err){
        next(new expressError(500,"I dont know what type of error is this"));
    }
}

module.exports.postListings = async (req,res,next)=>{
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
}