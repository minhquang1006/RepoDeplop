const path = require("path");
const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const isAuth = require("../middleware/isAuth"); // Import middleware "isAuth" để bảo vệ các router cần phải xác thực mới được truy cập (luồng đi của request trong các router là nó sẽ đi qua các middleware từ trái sang phải: isAuth => getAddProduct )
const { body } = require("express-validator");

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 600 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 600 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

module.exports = router;
