const db = require("../config/connection");
const userData = require("../models/user");
const adminData = require("../models/admin");
const productData = require("../models/products");
const category = require("../models/category");
const Sub_Category = require("../models/sub_category");
const brands = require("../models/brands");
const ordermodel = require("../models/order");
const couponmodel = require("../models/Coupon");
const Carouselmodel = require("../models/Carousel");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const async = require("hbs/lib/async");
const { reject, promise } = require("bcrypt/promises");
const { status } = require("express/lib/response");
const { request } = require("../app");

module.exports = {
  doadminlogin: (adminDataa) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      const admin = await adminData.findOne({ email: adminDataa.email });
      if (admin) {
        bcrypt.compare(adminDataa.password, admin.password).then((status) => {
          if (status) {
            console.log("admin login true");
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            console.log("login error");
            reject({
              status: false,
              msg: "Your username or password is incorrect",
            });
          }
        });
      } else {
        console.log("Login Failed");
        reject({
          status: false,
          msg: "Your username or password is incorrect",
        });
      }
    });
  },

  salesReport: (data) => {
    let response = {};
    let { startDate, endDate } = data;
    let d1, d2, text;
    if (!startDate || !endDate) {
      d1 = new Date();
      d1.setDate(d1.getDate() - 7);
      d2 = new Date();
      text = "For the Last 7 days";
    } else {
      d1 = new Date(startDate);
      d2 = new Date(endDate);
      text = `Between ${startDate} and ${endDate}`;
    }
    const date = new Date(Date.now());
    const month = date.toLocaleString("default", { month: "long" });
    return new Promise(async (resolve, reject) => {
      let salesReport = await ordermodel.aggregate([
        {
          $match: {
            ordered_on: {
              $lt: d2,
              $gte: d1,
            },
          },
        },
        {
          $match: { payment_status: "placed" },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$ordered_on" },
            total: { $sum: "$grandTotal" },
          },
        },
      ]);
      let brandReport = await ordermodel.aggregate([
        {
          $match: { payment_status: "placed" },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            brand: "$product.productName",
            quantity: "$product.quantity",
          },
        },

        {
          $group: {
            _id: "$brand",
            totalAmount: { $sum: "$quantity" },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]);
      let orderCount = await ordermodel
        .find({ date: { $gt: d1, $lt: d2 } })
        .count();
      let totalAmounts = await ordermodel.aggregate([
        {
          $match: { payment_status: "placed" },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$grandTotal" },
          },
        },
      ]);
      let totalAmountRefund = await ordermodel.aggregate([
        {
          $match: { status: "placed" },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$reFund" },
          },
        },
      ]);
      response.salesReport = salesReport;
      response.brandReport = brandReport;
      response.orderCount = orderCount;
      response.totalAmountPaid = totalAmounts.totalAmount;
      response.totalAmountRefund = totalAmountRefund.totalAmount;
      resolve(response);
    });
  },

  getallusers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await userData.find().lean();
      resolve(users);
    });
  },

  Blockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } },
        { upsert: true }
      );
      resolve(user);
    });
  },

  UnBlockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } },
        { upsert: true }
      );
      resolve(user);
    });
  },

  addBrandname: (data, img1) => {
    return new Promise(async (resolve, reject) => {
      const brandnames = data.BrandName;
      const brand = await brands.findOne({ BrandName: brandnames });
      if (brand) {
        reject({ status: false, msg: "Brand already taiken" });
      } else {
        const addbrand = await new brands({
          BrandName: brandnames,
          Image: img1,
        });
        await addbrand.save(async (err, result) => {
          if (err) {
            reject({ msg: "brand not added" });
          } else {
            resolve({ result, msg: "brand added" });
          }
        });
      }
    });
  },

  getbrands: () => {
    return new Promise(async (resolve, reject) => {
      const brandsdata = await brands.find({}).lean();
      resolve(brandsdata);
    });
  },

  addcategory: (data) => {
    return new Promise(async (resolve, reject) => {
      const categoryname = data.category;
      const categorydata = await category.findOne({ category: categoryname });
      if (categorydata) {
        reject({ status: false, meg: "category already taiken" });
      } else {
        const addcategory = await new category({
          category: categoryname,
        });
        await addcategory.save();
        resolve(addcategory);
      }
    });
  },

  getallcategory: () => {
    return new Promise(async (resolve, reject) => {
      const allcategory = await category.find({}).lean();
      resolve(allcategory);
    });
  },

  addsubcategory: (Data) => {
    return new Promise(async (resolve, reject) => {
      const sub_categoryname = Data.Subcategory;
      const sub_categorydata = await Sub_Category.findOne({
        Sub_category: sub_categoryname,
      });
      const categorydata = await category.findOne({
        category: Data.categoryname,
      });
      if (sub_categorydata) {
        reject({ status: false, meg: "Sub category already taiken" });
      } else {
        const addsubcategory = await new Sub_Category({
          Sub_category: sub_categoryname,
          category: categorydata._id,
        });
        await addsubcategory.save(async (err, result) => {
          if (err) {
            reject({ msg: "sub category not added" });
          } else {
            resolve({ result, msg: "subcategory" });
          }
        });
      }
    });
  },

  getallsubcategory: () => {
    return new Promise(async (resolve, reject) => {
      const allsubcategory = await Sub_Category.find({}).lean();
      resolve(allsubcategory);
    });
  },

  // addProduct: (data, image1, image2, image3, image4) => {
  //   return new Promise(async (resolve, reject) => {

  //     Mrp = parseInt(data.Mrp)
  //     Prize = (Mrp) - (Mrp*data.Discount*0.01).toFixed(0)
  //     console.log(Prize);
  //     const sub_categorydata = await Sub_Category.findOne({
  //       Sub_category: data.Subcategory,
  //     });
  //     const branddata = await brands.findOne({ BrandName: data.brand });
  //     const categorydata = await category.findOne({ category: data.category });
  //     // console.log(sub_categorydata);
  //     // console.log(branddata);
  //     // const categorydata=await category.findOne({category:data.categoryname})
  //     //   console.log(product.productName+'/////////////');.
  //     // console.log(image1);
  //     if (!image2) {
  //       reject({ msg: "upload image" });
  //     } else {
  //       const newproduct = await productData({
  //         productName: data.productName,
  //         Description: data.description,
  //         mrp: data.Mrp,
  //         Price:Prize,
  //         Discount: data.Discount,
  //         Color: data.color,
  //         Stoke: data.stock,
  //         size: data.size,
  //         Sub_Category: sub_categorydata._id,
  //         Category: categorydata._id,
  //         Brand: branddata._id,
  //         Image: { image1, image2, image3, image4 },
  //       });
  //       await newproduct.save(async (err, res) => {
  //         if (err) {
  //         }
  //         resolve({ data: res, msg: "success" });
  //       });
  //     }
  //   });
  // },

  addProduct: (data, imagesData) => {
    return new Promise(async (resolve, reject) => {
      Mrp = parseInt(data.Mrp);
      Prize = Mrp - (Mrp * data.Discount * 0.01).toFixed(0);
      // console.log(Prize);
      // const sub_categorydata = await Sub_Category.findOne({
      //   Sub_category: data.Subcategory,
      // })
      console.log(data.category);
      const branddata = await brands.findOne({ BrandName: data.brand });
      const categorydat = await category.findOne({ category: data.category });
      console.log(categorydat);
      const newproduct = await productData({
        productName: data.productName,
        Description: data.description,
        mrp: data.Mrp,
        Price: Prize,
        Discount: data.Discount, 
        Color: data.color,
        Stoke: data.stock,
        // size: data.size,
        // Sub_Category: sub_categorydata._id,
        Brand: branddata._id,
        Category: categorydat._id,
        Image: imagesData,
      });
      await newproduct.save(async (err, res) => {
        if (err) { 
          resolve()
        }
        resolve({ data: res, msg: "success" });
      });
    });
  },

  getallproducts: () => {
    return new Promise(async (resolve, reject) => {
      const allproducts = await productData.find({}).lean();
      resolve(allproducts);
    });
  },

  deleteproduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      let productid = proId;
      const removedproduct = await productData.findByIdAndDelete({
        _id: productid,
      });
      resolve(removedproduct);
    });
  },

  getproductdetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      const getproductdetails = await productData
        .findOne({ _id: proId })
        .lean()
        .then((getproductdetails) => {
          resolve(getproductdetails);
        });
    });
  },

  updateProduct: (proId, image, data) => {
    return new Promise(async (resolve, reject) => {
      Mrp = parseInt(data.Mrp);
      Prize = Mrp - (Mrp * data.Discount * 0.01).toFixed(0);
      const sub_categorydata = await Sub_Category.findOne({
        Sub_category: data.Subcategory,
      });
      const branddata = await brands.findOne({ BrandName: data.brand });
      const categorydata = await category.findOne({ category: data.category });
      const updateProduct = await productData.findByIdAndUpdate(
        { _id: proId },
        {
          $set: {
            productName: data.productName,
            Description: data.description,
            mrp: data.Mrp,
            Price: Prize,
            Discount: data.Discount,
            Color: data.color,
            Stoke: data.stock,
            size: data.size,
            Sub_Category: sub_categorydata._id,
            Category: categorydata._id,
            Brand: branddata._id,
            Image: image,
          },
        }
      );
      resolve({ updateProduct, msg: "Edited" });
    });
  },

  allorders: () => {
    return new Promise(async (resolve, reject) => {
      const allorders = await ordermodel
        .find({})
        .populate("product.pro_id")
        .sort({ _id: 1 })
        .lean();
      resolve(allorders);
    });
  },

  orderdetails: (orderID) => {
    return new Promise(async (resolve, reject) => {
      const orderdetails = await ordermodel
        .findOne({ _id: orderID })
        .populate("product.pro_id")
        .lean();
      resolve(orderdetails);
    });
  },

  changeOrderStatus: (data) => {
    return new Promise(async (resolve, reject) => {
      const state = await ordermodel.findOneAndUpdate(
        { _id: data.orderId, "product._id": data.proId },
        {
          $set: {
            "product.$.status": data.orderStatus,
          },
        }
      );
      resolve();
    });
  },

  AddCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      const newCoupon = new couponmodel({
        couponName: data.couponName,
        couponCode: data.CoupoCode,
        limit: data.Limit,
        expirationTime: data.ExpireDate,
        discount: data.discount,
      });
      await newCoupon.save();
      resolve();
    });
  },
  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      const AllCoupons = await couponmodel.find({}).lean();
      resolve(AllCoupons);
    });
  },

  deletecoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      const deletecoupon = await couponmodel.findByIdAndDelete({
        _id: couponId,
      });
      resolve(deletecoupon);
    });
  },

  allCarousel: () => {
    return new Promise(async (resolve, reject) => {
      const allCarousel = await Carouselmodel.find({}).lean();
      resolve(allCarousel);
    });
  },

  addCarousel: (data, image) => {
    return new Promise(async (resolve, reject) => {
      const addCarousel = new Carouselmodel({
        CarouselHeading: data.CarouselHeading,
        Sub_heading: data.Subheading,
        Image: image,
      });
      await addCarousel.save();
      resolve();
    });
  },
  deleteCarousel: (Carouselid) => {
    return new Promise(async (resolve, reject) => {
      const deleteCarousel = await Carouselmodel.findOneAndDelete({
        _id: Carouselid,
      });
      resolve();
    });
  },

  getOrderCount: () => {
    return new Promise(async (resolve, reject) => {
      const OrderCount = await ordermodel.find({}).count();
      resolve(OrderCount);
    });
  },
  getProductCount: () => {
    return new Promise(async (resolve, reject) => {
      const ProductCount = await productData.find({}).count();
      resolve(ProductCount);
    });
  },
};
