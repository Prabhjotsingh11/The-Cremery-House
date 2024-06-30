const express = require("express");
// this is a function returned to us
const app = express();
//        express function is called
const path = require("path");
const secret=process.env.SECRET;
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const { usercred, icecream } = require("./public/pages/DB");
const { jwtMiddleware, generatetoken } = require("./jwt");
// console.log(__dirname);
app.use(express.static(path.join(__dirname, "admin")));


app.post("/signup", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(username, password, role);
    const existingUser = await usercred.findOne({ username });
    if (existingUser) {
      // console.log('User Already Exist')
      return res.send("User Already Exist");
    }
    const newuser = new usercred({ username, password, role });
    await newuser.save();
    // const token=generatetoken({username});
    // res.json({token});
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usercred.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username ");
    }

    if (user.role !== "user") {
      return res.status(403).send("Access denied");
    }
    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }
    const token = generatetoken({ username });
    //   console.log(token);
    res.json({ token });
    // console.log(username,password);
  } catch (err) {
    res.send(err);
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "Adminlogin.html"));
});
app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Received login request:", username, password);
    const user = await usercred.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username ");
    }
    if (user.password !== password) {
      return res.status(401).send("Invalid password");
    }
    const token = generatetoken({ username });
    //   console.log(token);
    res.json({ token });
    // console.log(username,password);
  } catch (err) {
    res.send(err);
  }
});

app.post("/admin/products", async (req, res) => {
  try {
    const { title, description, price, stock } = req.body;
    // THE DATA SEND FROM THE FRONTEND , THE DATA RECIEVED AT BACKEND AND
    //  THE DATA TO BE SEND TO THE DB SHOULD HAVE THE SAME NAME............
    //   console.log(title);
    const existingProd = await icecream.findOne({ title });
    if (existingProd) {
      return res.send("Product Already Exist");
    }
    const newProd = new icecream({ title, description, price, stock });
    await newProd.save();
    res.json("Product added Succesfully");
  } catch (err) {
    console.log(err);
  }
});

app.get("/getInventory", async (req, res) => {
  try {
    const products = await icecream.find();
    // console.log(products);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deleteproduct/:id", jwtMiddleware, async (req, res) => {
  // console.log('hi');
  const id = req.params.id;

  try {
    const products = await icecream.findOneAndDelete({ _id: id });

    res.json({ products });
  } catch (err) {
    console.log(err);
  }
});

app.patch("/updatestock/:id", jwtMiddleware, async (req, res) => {
  const id = req.params.id;
  const newstock = req.body.stock;
  try {
    const products = await icecream.findByIdAndUpdate(id, { stock: newstock });
    res.json({ products });
  } catch (err) {
    console.log(err);
  }
});

app.post('/addtocart', jwtMiddleware, async (req, res) => {
    const { productId ,token} = req.body;
    const username = req.username.username;
    // console.log(username);
    try {
      // Find user by ID and username
      const user = await usercred.findOne({ username: username , role:'user' });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const product = await icecream.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
      const existingProduct = user.cart.find(item => item.productId.toString() === productId);

        if (existingProduct) {
            // If the product exists, increase its quantity
            existingProduct.quantity++;
        } else {
            // If the product doesn't exist, add it to the cart with quantity 1
            user.cart.push({ productId: productId, quantity: 1 });
        }
  
      product.stock -= 1;
      // Save updated user
      await user.save();
      await product.save();
  
      res.json({ success: true, message: 'Ice cream added to cart' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/getCart',jwtMiddleware,async (req, res) => {
    const username = req.username.username;
    try {
        // Find user by username
        const user = await usercred.findOne({ username: username, role: 'user' }).populate('cart.productId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, cart: user.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/removefromcart', jwtMiddleware, async (req, res) => {
  const { productId , quantity} = req.body;
  const username = req.username.username;
  try {
    // Find user by username and update the cart using $pull
    const user = await usercred.findOneAndUpdate(
      { username: username, role: 'user' },
      { $pull: { cart: { productId: productId } } },
    );

    // {
    //   "username": "john_doe",
    //   "role": "user",
    //   "cart": [
    //     { "productId": "123", "quantity": 2 },
    //     { "productId": "456", "quantity": 1 }
    //   ]
    // }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the product by its ID and update the stock
    const product = await icecream.findById(productId);
    if (product) {
      product.stock += quantity; // Add the quantity back to the stock
      await product.save();
    } else {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Item removed from cart and stock updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const Port = process.env.PORT;

app.listen(Port, () => {
  console.log(`Server Started at Port ${Port}`);
});
