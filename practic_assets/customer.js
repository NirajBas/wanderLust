const mongoose = require('mongoose');


main()
   .then(res => console.log("connected successfully"))
   .catch(err =>  console.log(ezrr));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/relations');
}


const orderSchema = new mongoose.Schema({
    item :String,
    price :Number,
});

const Order = mongoose.model("Order",orderSchema);

const customerSchema = new mongoose.Schema({
    name : String,
    orders : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref :"Order",
        }
    ],
});

customerSchema.pre("findOneAndDelete",function(data){
    let {name} = this;
    console.log(name);
    console.log(`deleting data of ${name}`);
});
customerSchema.post("findOneAndDelete",async (data)=>{
    let {name} = data;
    console.log(`deleted the data for ${name} successfully`);
    if(data.orders.length){
        let result =await Order.deleteMany({_id : {$in :data.orders}});
        console.log(result);
    }
});

customerSchema.pre("save",function(data){
    let {name} = this;
    console.log(`a customer named ${name} has placed an order`); 
});
customerSchema.post("save",function(data){
    let {name} = data;
    console.log(`the customer data for ${name} is saved successfully`);
})
const Customer = mongoose.model("Customer",customerSchema);

async function deleteCustomer(){
    await Customer.findByIdAndDelete('6a33bfc7f0c23bcce68f3ce6');
}
deleteCustomer();
async function customerAdd(){
    let customer1 = new Customer({
        name : "Niraj",
    });
    let order1 = await Order.findOne({ item: "Samosa"});
    let order2 = await Order.findOne({item : "pakauda"});
    customer1.orders.push(order1);
    customer1.orders.push(order2);
    return await customer1.save();
}

// customerAdd().then(res => console.log(res))
//              .catch(err => console.log(err));
// async function orderFunction(){
//     let result = await Order.insertMany([
//         {item :"Samosa",price :20},
//         {item : "pakauda",price :40},
//     ]);
//     return result;
// }
// orderFunction().then(res=> console.log(res))
//                 .catch(err => console.log(err));