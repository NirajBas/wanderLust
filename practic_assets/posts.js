const mongoose = require('mongoose');


main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/relations');
}
const userSchema = new mongoose.Schema({
    username : String,
    email :String,
});

const postSchema = new mongoose.Schema({
  description : String,
  likes : Number,
  userInfo :{
     type : mongoose.Schema.Types.ObjectId,
     ref : "User",
  },
});

const User = mongoose.model("User",userSchema);
const Post = mongoose.model("Post",postSchema);

async function pushData(){
  let user1 = new User({
     username : "nirajbas",
     email : "basyalniraj819@gmail.com"
  })
  let result1 = await user1.save();
  console.log(result1);
  let post1 = new Post({
    description : "This post is for the couples",
    userInfo :  result1._id,
  });
  let result2 = await post1.save();
  console.log(result2);
}
// pushData();