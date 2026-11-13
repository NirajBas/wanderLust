const Listing = require("../models/listing.js");
const expressError = require("../expressError.js");
const { categoryNames } = require("../utils/categories.js");

// escape user input so it is matched literally inside a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index = async (req,res,next)=>{
    try{
      // ?category=Mountains  -> filter by category
      // ?q=goa               -> search title / location / country
      let category = typeof req.query.category === "string" ? req.query.category : "";
      let q = typeof req.query.q === "string" ? req.query.q.trim() : "";

      if(!categoryNames.includes(category)){
          category = "";
      }

      let filter = {};
      if(category){
          filter.category = category;
      }
      if(q){
          const regex = new RegExp(escapeRegex(q), "i");
          filter.$or = [
              { title: regex },
              { location: regex },
              { country: regex },
          ];
      }

      let allListings = await Listing.find(filter);
      res.render("./listings/index.ejs",{allListings, category, q});
    }catch(err){
        next(err);
    }
}

// landing page: show a few listings as a preview
module.exports.home = async (req,res,next)=>{
    try{
      let featured = await Listing.find({}).sort({ _id: -1 }).limit(3);
      res.render("listings/home.ejs",{featured});
    }catch(err){
        next(err);
    }
}

module.exports.postListings = async (req,res,next)=>{
    try{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if(req.file){
        newListing.image ={
            filename : req.file.filename,
            url :req.file.path,
        }
    };
    console.log(newListing);
    await newListing.save();
    req.flash("listingCreated","New hotel added successfully");
    res.redirect("/listings");
    }catch(err){
        req.flash("listingNotC","no new hotel was added");
        next(err);
    }
};
module.exports.displayListing = async (req,res)=>{
    const {id} = req.params;
    let hotelInfo =await Listing.findById(id);
    res.render("listings/update.ejs",{hotelInfo});
};

module.exports.editListing = async (req,res)=>{
    const {id} = req.params;
    let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id,listing,{ runValidators: true });
    res.redirect("/listings");
};

module.exports.destroyListing =async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings/");
}

module.exports.getListing = async (req,res,next)=>{
     let {id} = req.params;
    console.log(id);
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });
    if(!listing){
       return next(new expressError(400,"your document could not be found"));
    }
    res.render("listings/listing.ejs",{listing});
};