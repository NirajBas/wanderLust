const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const expressError = require("../expressError.js");

module.exports.postReviews = async (req,res,next)=>{
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
}
module.exports.destroyReview = async (req,res,next)=>{
    try{
      const {id, reviewId} = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/listings/${id}`);
    }catch(err){
      next(err);
    }
}