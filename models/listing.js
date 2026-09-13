const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
     type : String,
     max :100,
    },
    image :  {
      filename: { type: String },
      url: { 
        type: String,  
        default : "https://unsplash.com/photos/city-buildings-illuminated-at-night-with-warm-lights-PwDUczQFG28",
       set : (v)=> v===""?"https://unsplash.com/photos/city-buildings-illuminated-at-night-with-warm-lights-PwDUczQFG28":v,
    }
    },
    price :{
       type:  Number,
       required : true,
       min :0,
    },
    location : String,
    country : String,
    reviews :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Reviews",
        }
    ]
});
const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;