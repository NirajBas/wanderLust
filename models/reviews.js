const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating : {
        type : Number,
        min :1,
        max :5,
        createdAt :{
            type : Date,
            default : Date.now()
        }
    },
    comments : String,
});
module.exports = mongoose.model("Reviews",reviewSchema);