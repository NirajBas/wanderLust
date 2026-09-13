const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(ezrr));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}
const init = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
init()
   .then(res =>{console.log("successful insertion")})
   .catch(err =>{console.log(err)});

