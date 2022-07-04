const express = require("express");
const { response } = require("../app");
const router = express.Router();
const userHelper = require("../helpers/user-helpers");
const { find, findOne } = require("../models/user");
const user = require("../models/user");
const products = require("../models/products");
const { route } = require("./admin");
const brandsmodel = require("../models/brands");
const async = require("hbs/lib/async");
const adminHelpers = require("../helpers/admin-helpers");
const moment = require("moment");
const veryfylogin = (req, res, next) => {
  if (req.session.logedIn) {
    let userid=req.session.user._id
    userHelper.userblock(userid).then((user)=>{
      if(user.block !=true){
        next();
      }
else{
  req.session.logedIn=false
  res.redirect('/Login')
}

    })
  } else {
    res.redirect("/Login");
  }
};
let filterResult;
/* GET home page. */
router.get("/", async (req, res, next) => {
  let user = req.session.user;
  userHelper.getnewproducts().then(async (response) => {
    Carouselimage = await userHelper.getCarousel();
    let product = response.product;
    const brands = await userHelper.allbrands();
    let cartcount = null;
    if (req.session.user) {
      cartcount = await userHelper.getcartcount(req.session.user._id);
    }
    res.render("user/home", {
      product,
      brands,
      Carouselimage,
      user,
      cartcount,
    });
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
  userHelper
    .dologin(req.body)
    .then((response) => {
      req.session.logedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    })
    .catch((err) => {
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
        res.redirect("/login");
      });
  } else {
  }
});

router.get("/userprofile", veryfylogin, async (req, res) => {
  const user = await userHelper.userprofile(req.session.user._id);
  cartcount = await userHelper.getcartcount(req.session.user._id);
  res.render("user/userprofile", { user, cartcount });
});

router.get("/edit-profile", veryfylogin, async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user);
  cartcount = await userHelper.getcartcount(req.session.user._id);
  res.render("user/editprofile", { Addresses, cartcount });
});

router.post("/Editproflie", (req, res) => {
  userHelper.Editproflie(req.body, req.session.user._id).then(() => {
    res.redirect("/userprofile");
  });
});

router.get("/address-page", veryfylogin, async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user);
  cartcount = await userHelper.getcartcount(req.session.user._id);
  res.render("user/address", { Addresses, cartcount });
});

router.get("/addAddress", veryfylogin, (req, res) => {
  let user = req.session.user;
  res.render("user/addaddress", { user });
});

router.post("/addAddress", veryfylogin, (req, res) => {
  let user = req.session.user;
  userHelper.addAddress(req.body,user._id).then((response)=>{
    console.log("dsugh");
    res.redirect("/address-page");
  })
});


router.get("/deleteAddress/:id", (req, res) => {
  userHelper.deleteAddress(req.params.id, req.session.user).then((response) => {
    res.redirect("/address-page");
  });
});

router.get("/editAddress/:id", veryfylogin, (req, res) => {
  const getAddress = userHelper
    .getAddress(req.params.id, req.session.user._id)
    .then((response) => {
      res.render("user/editaddress");
    });
});

router.get("/filterbrands/:id", (req, res) => {
  const brandFilter = req.params.id;
  userHelper.filterbrands(brandFilter).then((result) => {
    filterResult = result;
    res.redirect("/filterPage");
  });
});

router.post("/search-filter", (req, res) => {
  let a = req.body;
  let price = parseInt(a.Prize);
  let brandFilter = a.brand;
  let categoryFilter = a.category;
  // for (let i of a.brand) {
  //   brandFilter.push({ 'brand': i })
  // }
  // for (let i of a.category) {
  //   categoryFilter.push({ 'category': i })
  // }
  userHelper.searchFilter(brandFilter, categoryFilter, price).then((result) => {
    filterResult = result;
    res.json({ status: true });
  });
});

router.post("/search", async (req, res) => {
  let key = req.body.key;
  userHelper.getSearchProducts(key).then((response) => {
    filterResult = response;
    res.redirect("/filterPage");
    // res.json(response)
    // filterResult = response
    // res.redirect('/filterPage')
  });
});

router.get("/shop", (req, res) => {
  userHelper.allproducts().then(async (products) => {
    filterResult = products;

    res.redirect("/filterPage");
  });
});

router.get("/filterPage", async (req, res) => {
  let cartcount = "";
  let user = req.session.user;
  if (user) {
    cartcount = await userHelper.getcartcount(req.session.user._id);
  }
  let category = await userHelper.allcategory();
  let brands = await userHelper.allbrands();
  res.render("user/products", {
    filterResult,
    category,
    brands,
    cartcount,
    user,
    layout: false,
  });
});

router.get("/product-details/:id", async (req, res) => {
  let product = await userHelper.getproductdetalis(req.params.id);
  res.render("user/product-details", { product });
});

router.get("/add-tocart/:id", veryfylogin, (req, res) => {
  userHelper
    .addtocart(req.params.id, req.session.user)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      res.json(error);
    });
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
      user,
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
      user,
    });
  }
});

router.post("/change-product-quantity", async (req, res, next) => {
  userHelper
    .changeproductquantity(req.body, req.session.user)
    .then(async (response) => {
      let cartcount = await userHelper.getcartcount(req.session.user._id);
      if (cartcount > 0) {
        const subtotal = await userHelper.subtotal(req.session.user._id);
        const totalamount = await userHelper.totalamount(req.session.user._id);
        const netTotal = totalamount.grandTotal.total;
        const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
        const grandTotal = await userHelper.grandTotal(
          netTotal,
          DeliveryCharges
        );
        res.json({
          response,
          status: true,
          grandTotal,
          DeliveryCharges,
          netTotal,
        });
      } else {
        res.json({ response });
      }
    });
});

router.post("/remove-Product-forcart", (req, res, next) => {
  userHelper.removeFromcart(req.body, req.session.user).then(() => {
    res.json({ status: true });
  });
});

router.get("/checkout-page", async (req, res) => {
  userHelper
    .cartItem(req.session.user._id)
    .then(async (response) => {
      const cartItem = response;
      const Addresses = await userHelper.getAddresses(req.session.user);
      const totalamount = await userHelper.totalamount(req.session.user._id);
      const netTotal = totalamount.grandTotal.total;
      const DeliveryCharges = await userHelper.DeliveryCharge(netTotal);
      const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges);
      const AllCoupons = await adminHelpers.getAllCoupons();
      let cartcount = await userHelper.getcartcount(req.session.user._id);
      const user = req.session.user;
      res.render("user/checkout", {
        Addresses,
        netTotal,
        DeliveryCharges,
        grandTotal,
        AllCoupons,
        cartItem,
        user,
        cartcount,
      });
    })
    .catch((error) => {
      res.redirect("/");
    });
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
  DeliveryCharges = parseInt(req.body.DeliveryCharges);
  let todayDate = new Date().toISOString().slice(0, 10);
  let userId = req.session.user._id;
  userHelper.validateCoupon(req.body, userId).then((response) => {
    req.session.couponTotal = response.total;
    if (response.success) {
      res.json({
        couponSuccess: true,
        total: response.total + DeliveryCharges,
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
  userHelper.getorderProducts(req.session.orderId).then(async(response) => {
    const orderProducts = response;
    const user = req.session.user;
    cartcount = await userHelper.getcartcount(req.session.user._id);
    const ordered_on = moment(orderProducts.ordered_on).format("MMM Do YY");
    res.render("user/order-success", { ordered_on, orderProducts, user,cartcount });
  });
});

router.get("/allorders", veryfylogin, (req, res) => {
  userHelper.getallorders(req.session.user._id).then(async (response) => {
    const orders = response;
    const user = req.session.user;
    cartcount = await userHelper.getcartcount(req.session.user._id);
    orders.forEach((element) => {
      element.ordered_on = moment(element.ordered_on).format("MMM Do YY");
    });
    res.render("user/viewallOrders", { user, cartcount, orders });
  });
});

router.get("/viewOrderProducts/:id", async (req, res) => {
  userHelper.getorderProducts(req.params.id).then(async (response) => {
    const user = req.session.user;
    cartcount = await userHelper.getcartcount(req.session.user._id);
    const order = response;
    const ordered_on = moment(order.ordered_on).format("MMM Do YY");
    res.render("user/orderdetails", { cartcount, order, ordered_on, user });
  });
});

router.post("/cancel-order", (req, res) => {
  userHelper.cancelorder(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.get("/add-Towishlist/:id", veryfylogin, (req, res, next) => {
  userHelper
    .addTowishlist(req.params.id, req.session.user._id)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      res.redirect("/Login");
    });
});

router.get("/wishlist", async (req, res) => {
  let user = req.session.user;
  let wishlistcount = await userHelper.getwishlistcount(user._id);
  let wishlist;
  if (wishlistcount > 0) {
    wishlist = await userHelper.getwishlist(req.session.user);
  } else {
    wishlist = await userHelper.getwishlist(req.session.user);
    let wishlists = wishlist ? products : [];
  }
  cartcount = await userHelper.getcartcount(req.session.user._id);

  res.render("user/wishlist", { wishlist, admin: false, user, cartcount });
});

router.post("/deletewishlist", async (req, res) => {
  const wishlist = req.body.proId;
  userHelper.deletewishlist(wishlist, req.session.user._id).then((response) => {
    res.json({ status: true });
  });
});

router.get("/add-tocartformwishlist/:id", async (req, res) => {
  userHelper
    .addtocart(req.params.id, req.session.user._id)
    .then(async (response) => {
      const deleteproductfromwishlist = await userHelper.deletewishlist(
        req.params.id,
        req.session.user._id
      );
      res.json(response);
    });
});

router.get("/Logout", (req, res) => {
  req.session.logout = true;
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
