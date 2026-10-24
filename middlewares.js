const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
module.exports.checkAuthentication = (req,res,next)=>{
    console.log(req.originalUrl);
    if(!req.isAuthenticated()){
        console.log(req.session);
        req.session.redirectUrl = req.originalUrl;
        req.flash("notAuthenticated","the user is not logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.redirectUrl = (req,res,next)=>{
     if(req.session.redirectUrl){
            res.locals.redirectUrl = req.session.redirectUrl;
        }
        next();
}

module.exports.checkOwner =async (req,res,next) =>{
    try{
    let {id} = req.params;
    let listingFound = await Listing.findById(id);
    if(!listingFound || !listingFound.owner || !listingFound.owner.equals(req.user._id)){
        req.flash("error","you are not authorized to perform this activity");
        return res.redirect("/listings");
    }
    next();
}catch(err){
    next(err);
}
}

module.exports.checkAuthor = async(req,res,next)=>{
    try{
        let {id,reviewId} = req.params;
        let reviewFound = await Review.findById(reviewId);
        if(!reviewFound || !reviewFound.author || !reviewFound.author.equals(req.user._id)){
            req.flash("error","you don't have the permission to perform this activity");
            return res.redirect(`/listings/${id}`);
        } 
        next()
    }catch(err){
        next(err);
    }
}