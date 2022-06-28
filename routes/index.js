const express = require("express");
const { response } = require("../app");
const router = express.Router();
const userHelper = require("../helpers/user-helpers");
const { find, findOne } = require("../models/user");
const user = require("../models/user");
const products = require("../models/products");
const { route } = require("./admin");
const brandsmodel=require('../models/brands')
const async = require("hbs/lib/async");
const adminHelpers = require("../helpers/admin-helpers");
const moment=require('moment')
const veryfylogin = (req, res, next) => {
  if (req.session.logedIn) {
    next();
  } else {
    res.redirect("/Login");
  }
};
let filterResult
/* GET home page. */
router.get("/", async (req, res, next) => {
  let user = req.session.user;
  userHelper.getnewproducts().then(async (response) => {
    Carouselimage=await userHelper.getCarousel()
    // console.log(Carouselimage);
    let product = response.product;
    const brands=await userHelper.allbrands()
    // console.log(brands);
    let cartcount = null;
    if (req.session.user) {
      cartcount = await userHelper.getcartcount(req.session.user._id);

    }

    res.render("user/home", { product,brands,Carouselimage, user, cartcount });
  });
});

router.get("/Login", (req, res) => {
  if (req.session.logedIn) {
    res.redirect("/");
  } else {
    res.render("user/Login", { err: req.session.loggErr, layout: false });
    req.session.loggErr = null;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup", { err: req.session.loggErr2, layout: false });
  req.session.loggErr2 = null;
});

router.post("/Signup", (req, res, next) => {
  userHelper
    .doSignup(req.body)
    .then((response) => {
      req.session.userotp = response.otp;
      req.session.userdetails = response;
      res.redirect("/otp");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/signup");
    });
});

router.get("/otp", (req, res) => {
  let user = req.session.userdetails;
  // console.log(user);
  res.render("user/otp", { layout: false });
});

router.post("/otpverify", async (req, res) => {
  if (req.session.userotp == req.body.otpsignup) {
    let userData = req.session.userdetails;
    const adduser = await new user({
      name: userData.name,
      phonenumber: userData.phonenumber,
      email: userData.email,
      password: userData.password,
    });
    await adduser.save();
    res.redirect("/login");
  } else {
    res.redirect("/otp");
  }
});

router.post("/login", (req, res) => {
  // console.log(req.body);
  userHelper
    .dologin(req.body)
    .then((response) => {
      req.session.logedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      req.session.loggErr = err.msg;
      res.redirect("/login");
    });
});

router.get("/forgetpass", (req, res) => {
  res.render("user/forgetpassword", {
    err: req.session.emailerr,
    layout: false,
  });
  req.session.emailerr = null;
});

router.get("/forgetotp", (req, res) => {
  res.render("user/forgetotp", { layout: false });
});

router.post("/forget", (req, res, next) => {
  userHelper
    .doforgetverify(req.body)
    .then((response) => {
      req.session.userotp = response.otp;
      console.log(req.session.userotp);
      req.session.userdetails = response;
      req.session.userid = response._id;
      res.redirect("/forgetotp");
    })
    .catch((err) => {
      req.session.emailerr = err.msg;
      res.redirect("/forgetpass");
    });
});

router.post("/forgetotpverify", async (req, res) => {
  if (req.session.userotp == req.body.otpsignup) {
    res.redirect("/emailveriform");
  } else {
    res.redirect("/forgetotp");
  }
});

router.get("/emailveriform", (req, res) => {
  res.render("user/emailveriform", { layout: false });
});

router.post("/newpasswordsetting", (req, res) => {
  if (req.body.newpassword == req.body.rpassword) {
    userHelper
      .newpasswordsetting(req.body, req.session.userid)
      .then((response) => {
        console.log(response);
        res.redirect("/login");
        console.log("email updated");
      });
  } else {
    console.log("password mismatch");
  }
}); 

router.get("/userprofile", async (req, res) => {
  const user = await userHelper.userprofile(req.session.user._id);
  cartcount=await userHelper.getcartcount(req.session.user._id)
  res.render("user/userprofile", { user,cartcount});
});

router.get("/edit-profile", async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user);
  cartcount=await userHelper.getcartcount(req.session.user._id)
  res.render("user/editprofile", { Addresses,cartcount });
});

router.post("/Editproflie", (req, res) => {

  userHelper.Editproflie(req.body, req.session.user._id).then(() => {
    res.redirect("/userprofile");
  });
});

router.get("/address-page", async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user);
  cartcount=await userHelper.getcartcount(req.session.user._id)
  res.render("user/address", { Addresses,cartcount });
});


router.get("/addAddress", (req, res) => {
  let user = req.session.user;
  res.render("user/addAddress", { user });
});

router.post("/addAddress/:id", (req, res) => {
  userHelper.addAddress(req.params.id, req.body).then((response) => {
    res.redirect("/address-page");
  });
});
router.get("/deleteAddress/:id", (req, res) => {
  userHelper.deleteAddress(req.params.id, req.session.user).then((response) => {
    res.redirect("/address-page");
  });
});

router.get("/editAddress/:id", (req, res) => {
  // const getAddress=userHelper.getAddress(req.params.id,req.session.user._id)
  res.render("user/editaddress");
});

router.get('/filterbrands/:id',(req,res)=>{
  const brandFilter=req.params.id
  userHelper.filterbrands(brandFilter).then((result) => {
    // console.log(result);
    filterResult = result
    res.redirect("/filterPage")
  })

})


router.post('/search-filter', (req, res) => {
  // console.log("gjhdukhjlsd;===================");
  // console.log(req.body);
  let a = req.body
  let price = parseInt(a.Prize)
  let brandFilter =a.brand
  let categoryFilter = a.category

  // for (let i of a.brand) {
  //   brandFilter.push({ 'brand': i })
  // }
  // for (let i of a.category) {
  //   categoryFilter.push({ 'category': i })
  // }
  userHelper.searchFilter(brandFilter, categoryFilter, price).then((result) => {
    filterResult = result
    // console.log("==============================================");
// console.log(result);
    res.json({ status: true })
  })

})

router.post("/search", async (req, res) => {
  // console.log("=============================================");
  // console.log(req.body);
  // console.log("[[[[[[[[");
  let key = req.body.key;
  // console.log(key);
  userHelper.getSearchProducts(key).then((response)=>{
    // console.log(";;;;;;;;;;;;;;");
    filterResult=response
    res.redirect("/filterPage")
// res.json(response)
    // filterResult = response
    // res.redirect('/filterPage')

  })
});

router.get('/shop', (req, res) => {
  userHelper.allproducts().then(async (products) => {
    filterResult = products

    res.redirect('/filterPage')
  })

})

router.get('/filterPage', async (req, res) => { 
  let cartcount = ''
  let user = req.session.user
  if (user) {
    cartcount=await userHelper.getcartcount(req.session.user._id)
// console.log(cartcount);
  }
  let category =await userHelper.allcategory();
  let brands =await userHelper.allbrands()
  // console.log(filterResult);
  // console.log();
  res.render('user/products', { filterResult, category, brands, cartcount, user,layout:false })

})

router.get("/product-details/:id", async (req, res) => {
  let product = await userHelper.getproductdetalis(req.params.id);
  // console.log(product);
  res.render("user/product-details", { product });
});



router.get("/add-tocart/:id", veryfylogin, (req, res) => {
  // console.log("call");
  // console.log(req.session.user);
  userHelper.addtocart(req.params.id, req.session.user).then((response) => {
    console.log(response);
    res.json(response);
  }).catch((error)=>{
    res.json(error)
  })
});

router.get("/cart", veryfylogin, async (req, res) => {
  const user = req.session.user;
  let cartcount = await userHelper.getcartcount(req.session.user._id);
  if (cartcount > 0) {
    const subtotal = await userHelper.subtotal(req.session.user._id);

    const totalamount = await userHelper.totalamount(req.session.user._id);

    const netTotal = totalamount.grandTotal.total;
    const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
    const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges);

    let cartItem = await userHelper.cartItems(req.session.user._id);
    res.render("user/cart", {
      layout: false,
      cartItem,
      netTotal,
      cartcount,
      DeliveryCharges,
      grandTotal,
      user
    });
  } else {
    let cartItem = await userHelper.cartItems(req.session.user._id);
    let cartItems = cartItem ? products : [];
    netTotal = 0;
    cartcount = 0;
    DeliveryCharges = 0;
    grandTotal = 0;
    res.render("user/cart", {
      layout: false,
      cartItem,
      netTotal,
      cartcount,
      DeliveryCharges,
      grandTotal,
    });
  }
});

router.post("/change-product-quantity", async(req, res, next) => {
  console.log("rgisugiojsiodgr");
  userHelper.changeproductquantity(req.body, req.session.user).then(async(response) => {
    let cartcount = await userHelper.getcartcount(req.session.user._id);
    if (cartcount > 0) {
    const subtotal = await userHelper.subtotal(req.session.user._id);
    const totalamount = await userHelper.totalamount(req.session.user._id);
    const netTotal = totalamount.grandTotal.total;
    const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
    const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges);
    res.json({ response,status: true,grandTotal,DeliveryCharges,netTotal });
    }else{
 
      res.json({ response})
    }

  });  
});

router.post("/remove-Product-forcart", (req, res, next) => {
  console.log("shfshfjkdshfshfsh");
  userHelper.removeFromcart(req.body, req.session.user).then(() => {
    res.json({ status: true });
  });
});

router.get("/checkout-page", async (req, res) => {
  userHelper.cartItem(req.session.user._id).then(async(response)=>{
    const cartItem=response
    const Addresses = await userHelper.getAddresses(req.session.user);
    const totalamount = await userHelper.totalamount(req.session.user._id);
    const netTotal = totalamount.grandTotal.total;
    const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
    const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges);
    const AllCoupons = await adminHelpers.getAllCoupons();
    let cartcount = await userHelper.getcartcount(req.session.user._id);
    const user=req.session.user;
    res.render("user/checkout", { 
      Addresses,
      netTotal,
      DeliveryCharges,
      grandTotal, 
      AllCoupons,
      cartItem,
      user,
      cartcount
    });
  }).catch((error)=>{
    console.log("====================");
    res.redirect('/') 
  })
  // console.log(AllCoupons);

});

router.post("/place-order", async (req, res) => {

  const cartItem = await userHelper.cartItems(req.session.user._id);

  const totalamount = await userHelper.totalamount(req.session.user._id);
  const netTotal = totalamount.grandTotal.total;
  const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
  const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges);
  userHelper
    .placeOrder(
      req.body,
      cartItem,
      grandTotal,
      DeliveryCharges,
      netTotal, 
      req.session.user
    )
    .then((response) => {
      req.session.orderId = response._id;
      if (req.body["paymentMethod"] == "cod") {

        res.json({ codSuccess: true });
      } else {

        userHelper
          .generateRazorpay(response._id, req.body.mainTotal)
          .then((response) => {

            res.json(response);
          });
      }
    });
});

router.post("/couponApply", async (req, res) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  let userId = req.session.user._id;
  userHelper.validateCoupon(req.body, userId).then((response) => {

    req.session.couponTotal = response.total;
    if (response.success) {
      res.json({
        couponSuccess: true,
        total: response.total,
        discountpers: response.discoAmountpercentage,
      });
    } else if (response.couponUsed) {
      res.json({ couponUsed: true });
    } else if (response.couponExpired) {
      res.json({ couponExpired: true });
    } else if (response.couponMaxLimit) {
      res.json({ couponMaxLimit: true });
    } else {
      res.json({ invalidCoupon: true });
    }
  });
});

router.post("/verify-Payment", (req, res) => {
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper
        .changePayementStatus(req.body["order[receipt]"])
        .then((response) => {
          res.json({ status: true });
        });
    })
    .catch((err) => {
      res.json({ status: false });
    });
}); 

router.get("/viewOrderDetails", async (req, res) => {

  userHelper.getorderProducts(req.session.orderId).then((response) => {
    const orderProducts = response;
    const user=req.session.user
    // orderProducts.forEach(element => {
    //   element.ordered_on = moment(element.ordered_on).format("MMM Do YY");
  
    //     });
    const ordered_on=moment(orderProducts.ordered_on).format("MMM Do YY");     
      console.log(ordered_on);
    res.render("user/order-success", { ordered_on,orderProducts,user});
  });
});  

router.get("/allorders", (req, res) => {
  userHelper.getallorders(req.session.user._id).then((response) => {
    const orders = response;
    // console.log(orders.deliveryDetails);
    orders.forEach(element => {
    element.ordered_on = moment(element.ordered_on).format("MMM Do YY");

      });
      console.log(orders);
    res.render("user/viewallOrders", { orders });
  });
});

router.get("/viewOrderProducts/:id", (req, res) => {
  console.log(req.params.id);
  userHelper.getorderProducts(req.params.id).then((response) => {
    // console.log(response.product.status);
    const order = response;
    // if (order.product[0].status == "Cancelled") {
    //   order.product[0].Cancelled = true;
    // } 
    // console.log(order);
    res.render("user/orderdetails", { order });
  });
});

router.post("/cancel-order", (req, res) => {
  // console.log("klfjsdhkjsdgsioj");
  userHelper.cancelorder(req.body).then((response) => { 
    res.json({ status: true });
  });
});

router.get("/add-Towishlist/:id",veryfylogin, (req, res, next) => {
  console.log(req.params.id);
  userHelper.addTowishlist(req.params.id, req.session.user._id).then((response)=>{
    // console.log("lllllllllllll");
    res.json(response)
  }).catch((error)=>{
    res.redirect("/Login")

  })

  

});
  
router.get("/wishlist", async (req, res) => {
  let wishlist = await userHelper.getwishlist(req.session.user);


  let user = req.session.user;
  cartcount = await userHelper.getcartcount(req.session.user._id);

 

  if (wishlist) res.render("user/wishlist", { wishlist,admin:false, user, cartcount });
});

router.post("/deletewishlist", async (req, res) => {
  // console.log("fsdfgshfk");
  console.log(req.body);
  const wishlist=req.body.proId
  userHelper.deletewishlist(wishlist, req.session.user._id).then((response) => {
    res.json({ status: true });
  });    
});         

router.get("/add-tocartformwishlist/:id",async (req,res)=>{
  console.log("fghgkgjkj");
  // console.log(req.params.id);
  userHelper.addtocart(req.params.id,req.session.user._id).then(async(response)=>{
  const deleteproductfromwishlist=await userHelper.deletewishlist(req.params.id, req.session.user._id)
    res.json(response)
  })
})

router.get("/Logout", (req, res) => {
  req.session.logout = true;
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
 