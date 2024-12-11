const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const router = express.Router();
const User = require("../models/user");

// Router for Login
router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("This email is invalid!")
      .normalizeEmail(), // Đưa email về chữ thường
    body(
      "password",
      "Password with only numbers and text and at least 5 characters!"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

// Router for Signup
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        // if (value === "test@test.vn") {
        //   throw new Error("This email address is forbidden!");
        // }
        // return true;

        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists already!");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password", // (Code-1) - tham số này: để tham chiếu đến trường cần kiểm tra trên form "signupForm" là "password"
      "please enter a password with only numbers and text and at least 5 characters" // (Code-2) - tham số này: để thông báo lỗi chung cho tất cả các trình xác thực được sử dụng đầng sau "body()" như: "isLength()" và "isAlphanumeric()"
    )
      .isLength({ min: 5 }) // Xác thực "isLength" thêm một withMessage("...") ngay bên dưới
      // .withMessage(
      //   "please enter a password with only numbers and text and at least 5 characters" // Không cần "withMessage()" này vì đã dùng chung thông báo theo (Code-2)
      // )
      .isAlphanumeric() // Xác thực "isAlphanumeric" thêm một withMessage("...") ngay bên dưới
      .trim(),
    // .withMessage(
    //   "please enter a password with only numbers and text and at least 5 characters" // Không cần "withMessage()" này vì đã dùng chung thông báo theo (Code-2)
    // ),

    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error(
            'Error: "Confirm password" is not match with "Password"!'
          );
        }
        return true;
      }),
  ],
  authController.postSignup
);

// Router for Logout
router.post("/logout", authController.postLogout);

// Router for Reset
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

// Router for Create new password
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

// Export to use
module.exports = router;
