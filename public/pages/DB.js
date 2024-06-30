const connectionstring = process.env.CONNECTIONSTRING;
const mongoose = require("mongoose");

mongoose
  .connect(connectionstring)
  .then(() => console.log(`DB CONNECTED`))
  .catch((err) => console.log(err));

const users = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
  },

  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'icecream'
    },
    quantity: {
      type: Number,
      default: 1  // Default quantity to 1 when a product is added to cart
    }
  }]

});
const usercred = mongoose.model("usercred", users);


const products=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    }
});

const icecream=mongoose.model('icecream',products);

const Admin = (module.exports = {
  usercred: usercred,
  icecream: icecream,
});
