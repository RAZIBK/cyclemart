const db = require("../config/connection");
const userData = require("../models/user");
const adminData = require("../models/admin");
const productData = require("../models/products");
const couponmodel = require("../models/Coupon");
const cartmodel = require("../models/cart2");
const ordermodel = require("../models/order");
const categorymodel = require("../models/category");
const brandsmodel = require("../models/brands");
const Carouselmodel = require("../models/Carousel");
const moment = require("moment");
const wishlistmodel = require("../models/wishlist");
const nodeMailer = require("nodemailer");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const async = require("hbs/lib/async");
const { reject, promise } = require("bcrypt/promises");
const { status } = require("express/lib/response");
const { response } = require("../app");
const { Promise, default: mongoose, Mongoose } = require("mongoose");
const user = require("../models/user");
const res = require("express/lib/response");
require("dotenv").config();
const Razorpay = require("razorpay");
const { resolve } = require("path");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});

module.exports = {
  doSignup: (userDataa) => {
    console.log(userDataa);
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ email: userDataa.email });
      const usermobail = await userData.findOne({
        phonenumber: userDataa.mobile,
      });
      if (user) {
        reject({ status: false, msg: "Email already taiken" });
      } else {
        if (usermobail) {
          reject({ status: false, msg: "phone number already taiken" });
        } else {
          userDataa.password = await bcrypt.hash(userDataa.password, 10);
          const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
          const newUser = await {
            name: userDataa.name,
            phonenumber: userDataa.mobile,
            email: userDataa.email,
            password: userDataa.password,
            otp: otpGenerator,
          };
          if (newUser) {
            try {
              const mailTransporter = nodeMailer.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 465,
                secure: true,
                auth: {
                  user: process.env.NODEMAILER_USER,
                  pass: process.env.NODEMAILER_PASS,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });
              const mailDetails = {
                from: "razibk144@gmail.com",
                to: userDataa.email,
                subject: "just testing nodemailer",
                text: "just random texts ",
                html:
                  "<p>hi " + userDataa.name + "your otp " + otpGenerator + "",
              };
              mailTransporter.sendMail(mailDetails, (err, Info) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("email has been sent ", Info.response);
                }
              });
            } catch (error) {
              console.log(error.message);
            }
          }
          resolve(newUser);
        }
      }
    });
  },

  dologin: (userDat) => {
    return new Promise(async (resolve, reject) => {
      const loginStatus = false;
      const response = {};
      const user = await userData.findOne({ email: userDat.email });
      if (user) {
        if (user.block) {
          reject({ status: false, msg: "Admin Blocked you" });
        } else {
          bcrypt.compare(userDat.password, user.password).then((status) => {
            if (status) {
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              reject({
                status: false,
                msg: "Your username or password is incorrect",
              });
            }
          });
        }
      } else {
        reject({
          status: false,
          msg: "Your username or password is incorrect",
        });
      }
    });
  },

  doforgetverify: (userDataa) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ email: userDataa.email });
      if (user) {
        const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
        const newUser = await {
          email: userDataa,
          _id: user._id,
          otp: otpGenerator,
        };
        try {
          const mailTransporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
              user: process.env.NODEMAILER_USER,
              pass: process.env.NODEMAILER_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });
          const mailDetails = {
            from: "razibk144@gmail.com",
            to: userDataa.email,
            subject: "just testing nodemailer",
            text: "just random texts ",
            html: "<p>hi " + userDataa.name + "your otp " + otpGenerator + "",
            // html: '<p>hi ' + userDataa.name + 'your otp ' + "http://localhost:3000/emailveriform" + ''
          };
          mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("email has been sent ", Info.response);
            }
          });
        } catch (error) {
          console.log(error.message);
        }
        resolve(newUser);
      } else {
        reject({ status: false, msg: "Email not registerd" });
      }
    });
  },

  newpasswordsetting: (usernewps, userId1) => {
    return new Promise(async (resolve, reject) => {
      const response = {};
      usernewps.newpassword = await bcrypt.hash(usernewps.newpassword, 10);
      const userId = userId1;
      console.log(userId + "userId");
      const resetuser = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { password: usernewps.newpassword } }
      );
      console.log("....");
      resolve(resetuser);
    });
  },

  userprofile: (userid) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ _id: userid }).lean();
      resolve(user);
    });
  },

  Editproflie: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      const Editproflie = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { name: data.name, phonenumber: data.mobile } }
      );
      resolve(Editproflie);
    });
  },

  getCarousel: () => {
    return new Promise(async (resolve, reject) => {
      const Carousel = Carouselmodel.find().sort({ _id: -1 }).limit(3).lean();
      resolve(Carousel);
    });
  },

  getnewproducts: () => {
    return new Promise(async (resolve, reject) => {
      const product = await productData
        .find({})
        .sort({ _id: -1 })
        .limit(8)
        .lean();
      resolve({ product });
    });
  },

  getmensproduct: () => {
    return new Promise(async (resolve, reject) => {
      const product = await productData
        .find({})
        .sort({ _id: -1 })
        .limit(8)
        .lean();
      resolve({ product });
    });
  },

  getproductdetalis: (proId) => {
    return new Promise(async (resolve, reject) => {
      const product = await productData
        .findOne({ _id: proId })
        .lean()
        .then((product) => {
          resolve(product);
        });
    });
  },

  allcategory: () => {
    return new Promise(async (resolve, reject) => {
      const allcategory = await categorymodel.find({}).lean();
      resolve(allcategory);
    });
  },
  allbrands: () => {
    return new Promise(async (resolve, reject) => {
      const allbrands = await brandsmodel.find({}).lean();
      resolve(allbrands);
    });
  },

  allproducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await productData.find({}).lean();
      resolve(products);
    });
  },

  filterbrands: (brandFilter) => {
    return new Promise(async (resolve, reject) => {
      let brandid = mongoose.Types.ObjectId(brandFilter);
      result = await productData.aggregate([
        {
          $match: { Brand: brandid },
        },
      ]);
      resolve(result);
    });
  },

  searchFilter: (brandFilter, categoryFilter, price) => {
    return new Promise(async (resolve, reject) => {
      let result;
      if (brandFilter && categoryFilter) {
        let brandid = mongoose.Types.ObjectId(brandFilter);
        let categoryid = mongoose.Types.ObjectId(categoryFilter);
        result = await productData.aggregate([
          {
            $match: { Brand: brandid },
          },
          {
            $match: { Category: categoryid },
          },
          {
            $match: { Price: { $lt: price } },
          },
        ]);
      } else if (brandFilter) {
        let brandid = mongoose.Types.ObjectId(brandFilter);
        result = await productData.aggregate([
          {
            $match: { Brand: brandid },
          },
          {
            $match: { Price: { $lt: price } },
          },
        ]);
      } else if (categoryFilter) {
        let categoryid = mongoose.Types.ObjectId(categoryFilter);
        result = await productData.aggregate([
          {
            $match: { Category: categoryid },
          },
          {
            $match: { Price: { $lt: price } },
          },
        ]);
      } else {
        result = await productData.aggregate([
          {
            $match: { Price: { $lt: price } },
          },
        ]);
      }
      resolve(result);
    });
  },

  getSearchProducts: (key) => {
    return new Promise(async (resolve, reject) => {
      const products = await productData
        .find({
          $or: [
            { productName: { $regex: new RegExp("^" + key + ".*", "i") } },
            // { Brand: { $regex: new RegExp("^" + key + ".*", "i") } },
            // { Category: { $regex: new RegExp("^" + key + ".*", "i") } },
          ],
        })
        .lean();
      resolve(products);
    });
  },

  addtocart: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      const product = await productData.findOne({ _id: proId });
      const userdt = await cartmodel.findOne({ user: userId });
      if (userdt) {
        const proExist = userdt.products.findIndex(
          (products) => products.pro_id == proId
        );
        if (proExist != -1) {
          cartmodel
            .updateOne(
              {
                "products.pro_id": proId,
                "products.productName": product.productName,
                user: userId,
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve({ msg: "quantity added" });
            });
          // resolve({error:'Product already in cart'})
        } else {
          await cartmodel
            .findOneAndUpdate(
              { user: userId },
              {
                $push: {
                  products: {
                    pro_id: proId,
                    productName: product.productName,
                    price: product.Price,
                  },
                },
              }
            )
            .then(() => {
              resolve({ msg: "'Added', count: res.products.length + 1" });
            });
        }
      } else {
        const cartObj = new cartmodel({
          user: userId,
          products: {
            pro_id: proId,
            productName: product.productName,
            price: product.Price,
          },
        });
        await cartObj.save((err, result) => {
          if (err) {
            resolve({ error: "cart not created" });
          } else {
            resolve({ msg: "cart created", count: 1 });
          }
        });
      }
    });
  },

  cartItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartDetails = await cartmodel
        .findOne({ user: userId })
        .populate("products.pro_id")
        .lean();
      resolve(cartDetails);
    });
  },

  changeproductquantity: (data, user) => {
    cart = data.cartid;
    proId = data.product;
    quantity = parseInt(data.quantity);
    count = parseInt(data.count);
    price = parseInt(data.price);
    const procount = parseInt(count);
    return new Promise(async (resolve, response) => {
      if (count == -1 && quantity == 1) {
        await cartmodel
          .findOneAndUpdate(
            { user: user._id },
            {
              $pull: { products: { _id: cart } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        let subtotalam = price * (quantity + count);
        console.log(subtotalam);
        await cartmodel
          .findOneAndUpdate(
            { user: user._id, "products.pro_id": data.product },
            {
              $inc: { "products.$.quantity": procount },
            }
            // { $set: { "products.$.subtotal":subtotalam}}
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },

  //     const procount = parseInt(count);

  //     let usercart = await cartmodel.findOne({ userId: user._id });
  //     // console.log(usercart);
  //     let product = await productData.findOne({ _id: data.product });
  //     // console.log(product);
  //     if (usercart) {
  //       let newquantity = usercart.product.map((e) => e.quantity);
  //       // console.log(newquantity);
  //       quantity = newquantity.pop();
  //       console.log(quantity);
  //       // console.log(product.Stoke);
  //       // console.log(newquantity);
  //       if (quantity < product.Stoke && quantity != 0) {
  //         await cartmodel.updateOne(
  //           { user: user.email, "product.productID": data.product },
  //           { $inc: { "product.$.quantity": procount } }
  //         );
  //         resolve();
  //       }
  //     } else {
  //       reject({ status: false });
  //     }
  //     // }
  //   });
  // },

  getcartcount: (userid) => {
    return new Promise(async (resolve, reject) => {
      const user = await cartmodel.findOne({ user: userid });
      if (user) {
        count = user.products.length;
        resolve(count);
      } else {
        let count = 0;
        resolve(count);
      }
    });
  },

  subtotal: (user) => {
    let id = mongoose.Types.ObjectId(user);
    return new Promise(async (resolve, reject) => {
      const amount = await cartmodel.aggregate([
        {
          $match: { user: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            id: "$products.pro_id",
            total: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      ]);
      let cartdata = await cartmodel.findOne({ user: id });
      if (cartdata) {
        amount.forEach(async (amt) => {
          await cartmodel.updateMany(
            { "products.pro_id": amt.id },
            { $set: { "products.$.subtotal": amt.total } }
          );
        });
        resolve();
      }
    });
  },

  totalamount: (userData) => {
    const id = mongoose.Types.ObjectId(userData);
    return new Promise(async (resolve, reject) => {
      const total = await cartmodel.aggregate([
        {
          $match: { user: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            quantity: "$products.quantity",
            price: "$products.price",
          },
        },
        {
          $project: {
            productname: 1,
            quantity: 1,
            price: 1,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ]);
      if (total.length == 0) {
        resolve({ status: true });
      } else {
        let grandTotal = total.pop();
        resolve({ grandTotal, status: true });
      }
    });
  },

  DeliveryCharge: (amount) => {
    return new Promise((resolve, reject) => {
      if (amount < 10000) {
        resolve(500);
      } else {
        resolve(0);
      }
    });
  },

  grandTotal: (netTotal, DeliveryCharges) => {
    return new Promise((resolve, reject) => {
      const grandTotal = netTotal + DeliveryCharges;
      resolve(grandTotal);
    });
  },

  removeFromcart: (data, user) => {
    return new Promise(async (resolve, reject) => {
      await cartmodel
        .findOneAndUpdate(
          { user: user._id },
          {
            $pull: { products: { _id: data.cart } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  cartItem: (userId) => {
    return new Promise(async (resolve, reject) => {
      cartmodel
        .findOne({ user: userId })
        .populate("products.pro_id")
        .lean()
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject({ msg: "cart em" });
        });
    });
  },

  validateCoupon: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data.coupon);
      obj = {};
      const coupon = await couponmodel.findOne({ couponCode: data.coupon });
      if (coupon) {
        if (coupon.limit > 0) {
          checkUserUsed = await couponmodel.findOne({
            couponCode: data.coupon,
            usedUsers: { $in: [userId] },
          });
          if (checkUserUsed) {
            obj.couponUsed = true;
            obj.msg = " You Already Used A Coupon";
            console.log(" You Already Used A Coupon");
            resolve(obj);
          } else {
            let nowDate = new Date();
            date = new Date(nowDate);
            if (date <= coupon.expirationTime) {
              await couponmodel.updateOne(
                { couponCode: data.coupon },
                { $push: { usedUsers: userId } }
              );
              await couponmodel.findOneAndUpdate(
                { couponCode: data.coupon },
                { $inc: { limit: -1 } }
              );
              let total = parseInt(data.total);
              let percentage = parseInt(coupon.discount);
              let discoAmount = ((total * percentage) / 100).toFixed();
              obj.discoAmountpercentage = percentage;
              obj.total = total - discoAmount;
              obj.success = true;
              resolve(obj);
            } else {
              obj.couponExpired = true;
              resolve(obj);
            }
          }
        } else {
          obj.couponMaxLimit = true;
          resolve(obj);
        }
      } else {
        obj.invalidCoupon = true;
        resolve(obj);
      }
    });
  },

  placeOrder: (order, products, total, DeliveryCharges, netTotal, user) => {
    return new Promise(async (resolve, reject) => {
      total = parseInt(order.total) + parseInt(DeliveryCharges);
      let id = mongoose.Types.ObjectId(user._id);
      const status = order.paymentMethod === "cod" ? "placed" : "Cancelled";
      const orderObj = await ordermodel({
        user_Id: user._id,
        Total: total,
        ShippingCharge: DeliveryCharges,
        grandTotal: order.mainTotal,
        coupondiscountedPrice: order.discountedPrice,
        couponPercent: order.discoAmountpercentage,
        couponName: order.couponName,
        PaidAmount: order.mainTotal,
        payment_status: status,
        paymentMethod: order.paymentMethod,
        ordered_on: new Date(),
        product: products.products,
        deliveryDetails: {
          name: order.fname,
          number: order.number,
          email: order.email,
          house: order.house,
          localplace: order.localplace,
          town: order.town,
          district: order.district,
          state: order.state,
          pincode: order.pincode,
        },
      });
      await orderObj.save(async (err, res) => {
        const data = await cartmodel.aggregate([
          {
            $match: { user: id },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              quantity: "$products.quantity",
              id: "$products.pro_id",
            },
          },
        ]);
        data.forEach(async (amt) => {
          await productData.findOneAndUpdate(
            {
              _id: amt.id,
            },
            { $inc: { Stoke: -amt.quantity } }
          );
        });
        await cartmodel.remove({ user: order.userId });
        resolve(orderObj);
      });
    });
  },

  cancelorder: (data) => {
    order = mongoose.Types.ObjectId(data.orderId);
    let quantity = parseInt(data.quantity);
    discountPrice =
      parseInt(data.subtotal) -
      ((parseInt(data.couponPercent) * parseInt(data.subtotal)) / 100).toFixed(
        0
      );
    const status = "Cancelled";
    return new Promise(async (resolve, reject) => {
      const cancelorder = await ordermodel.updateMany(
        { _id: data.orderId, "product.pro_id": data.proId },
        {
          $set: {
            "product.$.status": status,
            "product.$.orderCancelled": true,
          },

          $inc: {
            grandTotal: -discountPrice,
            "product.$.subtotal": -parseInt(data.subtotal),
            reFund: discountPrice,
          },
        }
      );
      await productData.findOneAndUpdate(
        { _id: data.proId },
        {
          $inc: {
            Stoke: quantity,
          },
        }
      );
      let products = await ordermodel.aggregate([
        {
          $match: { _id: order },
        },
        {
          $project: {
            _id: 0,
            product: 1,
          },
        },
        {
          $unwind: "$product",
        },
        {
          $match: { "product.orderCancelled": false },
        },
      ]);
      if (products.length == 0) {
        await ordermodel.updateMany(
          { _id: data.orderId },
          {
            $inc: { reFund: 500, grandTotal: -500 },
          }
        );
        resolve({ status: true });
      } else {
        resolve({ status: true });
      }
    });
  },

  addTowishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      const userdt = await wishlistmodel.findOne({ user_id: userId });
      if (userdt) {
        const proExist = userdt.products.findIndex(
          (products) => products.pro_Id == proId
        );
        if (proExist != -1) {
          resolve({ err: "product already in wishlist" });
        } else {
          await wishlistmodel.findOneAndUpdate(
            { user_id: userId },
            { $push: { products: { pro_Id: proId } } }
          );
          resolve({ msg: "added" });
        }
      } else {
        const newwishlist = new wishlistmodel({
          user_id: userId,
          products: { pro_Id: proId },
        });
        await newwishlist.save((err, result) => {
          if (err) {
            resolve({ msg: "not added to wishlist" });
          } else {
            resolve({ msg: "wislist created" });
          }
        });
      }
    });
  },

  getwishlist: (userid) => {
    return new Promise(async (resolve, reject) => {
      const wishlist = await wishlistmodel
        .findOne({ user_id: userid._id })
        .populate("products.pro_Id")
        .lean();
      resolve(wishlist);
    });
  },

  deletewishlist: (proId, user) => {
    return new Promise(async (resolve, response) => {
      const remove = await wishlistmodel.updateOne(
        { user_id: user },
        { $pull: { products: { pro_Id: proId } } }
      );
      resolve({ msg: "comfirm delete" });
    });
  },

  getwishlistcount: (userid) => {
    return new Promise(async (resolve, reject) => {
      const user = await wishlistmodel.findOne({ user: userid });
      if (user) {
        count = user.products.length;
        resolve(count);
      } else {
        let count = 0;
        resolve(count);
      }
    });
  },

  addAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      const user = userData.findOne({ _id: userId });
      await userData.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            address: {
              fname: data.fname,
              lname: data.lname,
              house: data.house,
              towncity: data.towncity,
              district: data.district,
              state: data.state,
              pincode: data.pincode,
              email: data.email,
              mobile: data.mobile,
            },
          },
        }
      );
      resolve();
    });
  },

  getAddresses: (user) => {
    return new Promise(async (resolve, response) => {
      const Addresses = await userData.findOne({ _id: user }).lean();
      resolve(Addresses);
    });
  },

  deleteAddress: (addressId, user) => {
    return new Promise(async (resolve, reject) => {
      const address = await userData.updateOne(
        { _id: user._id },
        { $pull: { address: { _id: addressId } } }
      );
      resolve();
    });
  },

  getAddress: (addressId, userid) => {
    return new Promise(async (resolve, reject) => {
      const address = await userData.aggregate([
        {
          $match: { _id: userid },
        },
        {
          $unwind: "$address",
        },
        {
          $match: { "address._id": addressId },
        },
        {
          $project: {
            address: 1,
            _id: 0,
          },
        },
      ]);
      resolve(address);
    });
  },
  getorderProducts: (orderid) => {
    return new Promise(async (resolve, reject) => {
      const orderdetails = await ordermodel
        .findOne({ _id: orderid })
        .populate("product.pro_id")
        .lean();
      resolve(orderdetails);
    });
  },

  generateRazorpay: (orderid, totalamount) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalamount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderid,
      };
      instance.orders.create(options, function (err, order) {
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "mbtXQ9exuIXP8xgPY3UBKMJ7");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  changePayementStatus: (orderid) => {
    return new Promise(async (resolve, reject) => {
      const changestatus = await ordermodel
        .findOneAndUpdate(
          { _id: orderid },
          {
            $set: { payment_status: "placed" },
          }
        )
        .then((changestatus) => {
          resolve(changestatus);
        });
    });
  },

  changePayementStatusinfailed: (orderid) => {
    return new Promise(async (resolve, reject) => {
      const changestatus = await ordermodel
        .findOneAndUpdate(
          { _id: orderid },
          {
            $set: { payment_status: "Canceld" },
          }
        )
        .then((changestatus) => {
          resolve(changestatus);
        });
    });
  },

  getallorders: (user) => {
    console.log(user);
    return new Promise(async (resolve, reject) => {
      const allorders = await ordermodel
        .find({ user_Id: user })
        .populate("product.pro_id")
        .sort({ _id: -1 })
        .lean();
      console.log(allorders);
      resolve(allorders);
    });
  },
};
