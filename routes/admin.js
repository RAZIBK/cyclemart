const { Router } = require("express");
const express = require("express");
const async = require("hbs/lib/async");
const { response, request } = require("../app");
const router = express.Router();
const adminhelpers = require("../helpers/admin-helpers");
const Storage = require("../middleware/multer");
const fs = require("fs");
const moment = require("moment");
const veryfyadminlogin = (req, res, next) => {
  if (req.session.adminlogin) {
    next();
  } else {
    res.redirect("/Login");
  }
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  if (req.session.adminlogin) {
    res.redirect("/admin/adminhome");
  } else {
    res.render("admin/adminlogin", {
      layout: false,
      err: req.session.adminloggErr,
    });
    req.session.adminloggErr = null;
  }
});

router.post("/adminlogin", (req, res) => {
  adminhelpers
    .doadminlogin(req.body)
    .then((response) => {
      req.session.adminlogin = true;
      req.session.admin = response.admin;
      res.redirect("/admin/adminhome");
    })
    .catch((err) => {
      req.session.adminloggErr = err.msg;
      res.redirect("/admin");
    });
});

router.get("/adminhome", veryfyadminlogin, async function (req, res, next) {
  let admin = req.session.admin;
  [OrderCount, ProductCount] = await Promise.all([
    adminhelpers.getOrderCount(),
    adminhelpers.getProductCount(),
  ]);
  res.render("admin/ad", { OrderCount, ProductCount, layout: false, admin });
});

router.post("/getData", async (req, res) => {
  const date = new Date(Date.now());
  const month = date.toLocaleString("default", { month: "long" });
  adminhelpers.salesReport(req.body).then((data) => {
    let pendingAmount = data.pendingAmount;
    let salesReport = data.salesReport;
    let brandReport = data.brandReport;
    let orderCount = data.orderCount;
    let totalAmountPaid = data.totalAmountPaid;
    let totalAmountRefund = data.totalAmountRefund;

    let dateArray = [];
    let totalArray = [];
    salesReport.forEach((s) => {
      dateArray.push(`${month}-${s._id} `);
      totalArray.push(s.total); 
    });
    let brandArray = [];
    let sumArray = [];
    brandReport.forEach((s) => {
      brandArray.push(s._id);
      sumArray.push(s.totalAmount);
    });
    console.log("totalAmountRefund",sumArray)

    res.json({
      totalAmountRefund,
      dateArray,
      totalArray,
      brandArray,
      sumArray,
      orderCount,
      totalAmountPaid,
      pendingAmount,
    });
  });
});

router.get("/usermangement", veryfyadminlogin, (req, res) => {
  adminhelpers.getallusers().then((user) => {
    res.render("admin/usermangement", { user, layout: false, admin: true });
  });
});
router.get("/Blockuser/:id", (req, res) => {
  const userid = req.params.id;
  adminhelpers.Blockuser(userid).then((response) => {
    res.json({ msg: "you blocked", status: true });
  });
});
router.get("/UnBlockuser/:id", (req, res) => {
  const userid = req.params.id;
  adminhelpers.UnBlockuser(userid).then((response) => {
    res.json({ msg: "you unblocked", status: true });
  });
});

router.get("/addbrands", (req, res) => {
  res.render("admin/AddBrands", { layout: false });
});
router.post(
  "/addBrandname",
  Storage.fields([{ name: "image1", maxCount: 1 }]),
  (req, res) => {
    const img1 = req.files.image1[0].filename;
    adminhelpers
      .addBrandname(req.body, img1)
      .then((response) => {
        res.redirect("/admin/productmangement");
      })
      .catch((error) => {
        res.redirect("/admin/addbrands");
      });
  }
);
router.get("/addcategory", (req, res) => {
  adminhelpers.getallcategory().then((allcategory) => {
    res.render("admin/addcategory", { allcategory, layout: false });
  });
});

router.post("/addcategory", (req, res) => {
  adminhelpers
    .addcategory(req.body)
    .then((response) => {
      res.redirect("/admin/addcategory");
    })
    .catch((error) => {
      req.session.loggE = error.msg;
      res.redirect("/admin/addcategory");
    });
});

// router.post("/addsubcategory", (req, res) => {
//   console.log(req.body);
//   adminhelpers
//     .addsubcategory(req.body)
//     .then((response) => {
//       res.redirect("/admin/addcategory");
//     })
//     .catch((err) => {
//       req.session.loge = err.msg;
//       res.redirect("/admin/addcategory");
//     });
// });

router.get("/productmangement", async (req, res) => {
  const products = await adminhelpers.getallproducts();
  const alert = req.flash("msg");
  res.render("admin/productmanegement", { alert, products, layout: false });
});

router.get("/addproduct", async (req, res) => {
  const category = await adminhelpers.getallcategory();
  const brandname = await adminhelpers.getbrands();
  const subcategory = await adminhelpers.getallsubcategory();
  res.render("admin/addproduct", {
    category,
    subcategory,
    brandname,
    admin: true,
    layout: false,
  });
});

// router.post(
//   "/addProduct",
//   Storage.fields([
//     { name: "image1", maxCount: 1 },
//     { name: "image2", maxCount: 1 },
//     { name: "image3", maxCount: 1 },
//     { name: "image4", maxCount: 1 },
//   ]),
//   function (req, res) {
//     // console.log(req.body);
//     // console.log(req.files);
//     const img1 = req.files.image1[0].filename;
//     const img2 = req.files.image2[0].filename;
//     const img3 = req.files.image3[0].filename;
//     const img4 = req.files.image4[0].filename;
//     // console.log(img1, img2, img3, img4);
//     adminhelpers
//       .addProduct(req.body, img1, img2, img3, img4)
//       .then((response) => {
//         // console.log(response);
//         req.flash("msg", "You add product successfully!");
//         res.redirect("/admin/productmangement");
//       });
//   }
// );

// router.post(
//   "/addProduct",
//   Storage.array('file'),
//   function (req, res) {
//     // console.log(req.body);
//     console.log(req.files);
//     let image = req.files.image1
//     // console.log(img1, img2, img3, img4);
//     adminhelpers
//       .addProduct(req.body, image)
//       .then((response) => {
//         // console.log(response);
//         req.flash("msg", "You add product successfully!");
//         res.redirect("/admin/productmangement");
//       });
//   }
// );

router.post("/addProduct", Storage.array("file"), (req, res) => {
  console.log(req.body);
  // console.log(req.files.image1);

  // let image = req.files.image1
  // image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
  //   if (!err) {
  //     res.redirect('/admin/add-product')
  //   } else {
  //     console.log(err)
  //   }
  // })
  const { files } = req;

  if (!files) {
    const error = new Error("please select file");
    error.httpStatusCode = 400;
    return next(error);
  }
  const imgArray = files.map((file) => {
    const img = fs.readFileSync(file.path);
    return (encode_image = img.toString("base64"));
  });

  const finalImg = [];
  imgArray.map((src, index) => {
    const result = finalImg.push({
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
    });
    return result;
  });

  adminhelpers
    .addProduct(req.body, finalImg)
    .then((status) => {
      req.session.added = true;
      res.redirect("/admin/addproduct");
    })
    .catch((error) => {});
});

router.get("/deleteproduct/:id", (req, res) => {
  const proId = req.params.id;
  adminhelpers.deleteproduct(proId).then((response) => {
    res.json({ productdeleted: true });
    req.flash("msg", "You Deleted successfully!");
  });
});

router.get("/Editproduct/:id", async (req, res) => {
  let product = await adminhelpers.getproductdetails(req.params.id);
  const category = await adminhelpers.getallcategory();
  const brandname = await adminhelpers.getbrands();
  const subcategory = await adminhelpers.getallsubcategory();
  res.render("admin/editproduct", {
    subcategory,
    category,
    product,
    brandname,
    admin: true,
    layout: false,
  });
});

router.post("/editproduct/:id", Storage.array("files", 3), async (req, res) => {
  let file = req.files;
  const imgArray = file.map((file) => {
    const img = fs.readFileSync(file.path);
    return (encode_image = img.toString("base64"));
  });
  const finalImg = [];
  await imgArray.map((src, index) => {
    const result = finalImg.push({
      filename: file[index].originalname,
      contentType: file[index].mimetype,
      imageBase64: src,
    });
    return result;
  });
  adminhelpers.updateProduct(req.params.id, finalImg, req.body).then(() => {
    res.redirect("/admin/productmangement");
  });
});

// router.post(
//   "/editproduct/:id",
//   Storage.fields([
//     { name: "image1", maxCount: 1 },
//     { name: "image2", maxCount: 1 },
//     { name: "image3", maxCount: 1 },
//     { name: "image4", maxCount: 1 },
//   ]),
//   function (req, res) {
//     const proId = req.params.id;
//     const img1 = req.files.image1
//       ? req.files.image1[0].filename
//       : req.body.image1;
//     const img2 = req.files.image2
//       ? req.files.image2[0].filename
//       : req.body.image2;
//     const img3 = req.files.image3
//       ? req.files.image3[0].filename
//       : req.body.image3;
//     const img4 = req.files.image4
//       ? req.files.image4[0].filename
//       : req.body.image4;

//     console.log(img1, img2, img3, img4);
//     adminhelpers
//       .updateProduct(req.body, proId, img1, img2, img3, img4)
//       .then((response) => {
//         console.log(response);
//         req.flash("msg", response.updateProduct.productName, response.msg);
//         res.redirect("/admin/productmangement");
//       });
//   }
// );

router.get("/order-manegement", (req, res) => {
  adminhelpers.allorders().then((response) => {
    const allorders = response;
    allorders.forEach((element) => {
      element.ordered_on = moment(element.ordered_on).format("MMM Do YY");
    });
    res.render("admin/order-manegement", { layout: false, allorders });
  });
});

router.get("/viewOrderProducts/:id", (req, res) => {
  adminhelpers.orderdetails(req.params.id).then((response) => {
    const order = response;
    const ordered_on = moment(order.ordered_on).format("MMM Do YY");
    res.render("admin/Order-Details", { ordered_on, admin: true, order });
  });
});

router.post("/changeOrderStatus", (req, res) => {
  adminhelpers.changeOrderStatus(req.body).then((response) => {
    res.json({ modified: true });
  });
});

router.get("/coupon-manegement", (req, res) => {
  adminhelpers.getAllCoupons(req.body).then((response) => {
    const AllCoupons = response;
    res.render("admin/coupon-manegement", { AllCoupons, layout: false });
  });
});

router.get("/deletecoupon/:id", (req, res) => {
  adminhelpers.deletecoupon(req.params.id).then((response) => {
    res.json({ coupondeleted: true });
  });
});

router.get("/addcoupon", (req, res) => {
  res.render("admin/addcoupon", { layout: false });
});

router.post("/AddCoupon", (req, res) => {
  adminhelpers.AddCoupon(req.body).then(() => {
    res.redirect("/admin/coupon-manegement");
  });
});

router.get("/Carousel-manegement", (req, res) => {
  adminhelpers.allCarousel().then((response) => {
    const Carousel = response;
    res.render("admin/Carousel-manegement", { layout: false, Carousel });
  });
});

router.get("/addCarousel", (req, res) => {
  res.render("admin/AddCarousel", { admin: true });
});
router.post(
  "/AddCarousel",
  Storage.fields([{ name: "image1", maxCount: 1 }]),
  (req, res) => {
    const img1 = req.files.image1[0].filename;
    adminhelpers.addCarousel(req.body, img1).then(() => {
      res.redirect("/admin/Carousel-manegement");
    });
  }
);
router.delete("/deleteCarousel/:id", (req, res) => {
  adminhelpers.deleteCarousel(req.params.id).then(() => {
    res.json({ deleteCarousel: true });
  });
});
router.get("/logout", (req, res) => {
  req.session.adminlogout = true;
  req.session.destroy();
  res.redirect("/admin");
});

module.exports = router;
