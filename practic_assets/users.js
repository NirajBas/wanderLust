const mongoose = require('mongoose');


main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(ezrr));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/relations');
}

const userSchema = new mongoose.Schema({
    name : String,
    phone_no : Number,
    address : [{
        _id :false,
        location : String,
        place : String,
    }],
});

const User = mongoose.model("User",userSchema);
async function implement(){
    const user1 = new User({
        name : "Dibya Basel",
        phone_no : 99834343,
        address :[{
            location :"Parbat",
            place : "ranipani",
        },
     {
        location : "Gulmi",
        place : "Shantipur",
     }],
     });
    return await user1.save();
}
implement()
      .then((res)=>{
        console.log(res);
      }).catch(err =>{
        console.log(err);
      })