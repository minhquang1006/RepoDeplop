// ====================================== LÝ THUYẾT VỀ COOKIE ===============================================
// - Nếu có nhiều cookie được tạo ra thì các cookie được lưu thành chuỗi các cookie được ngăn cách với nhau bằng dầu ";" như sau:
// "cookie-1; cookie-2; cookie-3;......" Khi đó ta cần lấy cookie thì sẽ chuyển đổi nó thành array băng lệnh "split(";")", ta sẽ được dữ liệu dạng:
// [cookie-1, cookie-2, cookie-3,...] lúc này ta muốn lấy cookie nào thì sẽ lấy theo index của cookie đó với cookie đầu có index là 0
// theo câu lệnh sau: req.get("Cookie").split(";")[1]: lấy giá trị cookie-2 trong mảng cookie
// - Trong câu lệnh dưới "split(";")[0] là để chuyển chuỗi cookie về thành mảng qua việc phân tách các giá trị được cách nhau bởi dấu ";" trong chuỗi cookie
// - Sau đó "split(";")[0]: với [0] là lấy giá trị cookie đầu tiên
// - Trim() là xoá bỏ những khoảng trắng vô nghĩa (nếu có) ở đầu và cuối của giá trị cookie vừa lấy được
// - Giá trị cookie lấy được là: "LoggedIn=true": nên ta dùng split("=") để chuyển chuỗi "LoggedIn=true" về thành mảng dạng: ["LoggedIn", true]
// - Tiếp theo split("=")[1]: là để lấy giá trị "true" có index là [1] trong mảng
// - Với Cookie ngoài việc đặt giá trị cho nó, ta có thể được đặt thêm các thuộc tính khác cho nó như:
// + Ngày hết hạn: Expires = "định dạng ngày theo http", nếu không đặt ngày hết hạn thì cookie sẽ hết hạn khi ta đóng trình duyệt),
// + Thời gian tồn tại "Max-Age=10", thuộc tính này được tính bằng giây, nó là số giây mà cookie tồn tại
// + Địa chỉ nơi gửi cookie đến: "Domain=..."
// + Bảo mật:
//    ++ "Secure"(không cần có dấu "=" kèm theo): đều này nghĩa là cookie chỉ được thiết lập nếu trang được xử lý qua giao thức "https"
//    ++ "HttpOnly": nghĩa là ta vẫn lưu cookie trên trình duyệt, người dùng có thể mở devtool của trình duyệt để đọc được cookie này,
//        nhưng mã javascript (mã độc) được nhúng trên trình duyệt sẽ không thể đọc được những cookie này, đây là một phương thức bảo mật cần thiết khi dùng cookie,
//        khi dùng thiết lập này, tại giá trị cookie ta thấy có một dấu "tick" trên cột "http"
// => Thiết lập đầy đủ cho một cookie như sau:
// res.setHeader("Set-Cookie", "LoggedIn=true; Expires=định dạng ngày theo http; Max-Age=10; Domain=...; Secure/HttpOnly);
// LƯU Ý: - ta sẽ dùng một gói thư viện bên thứ 3 để tạo cookie và thực hiện cơ chế xác thực (ta không sử dụng phương pháp tạo cookie thủ công như trên)
//        - Cookie sẽ được lưu ở "browser" phía "client", nhưng "session" thì được lưu ở "database" phía "server"

const bcrypt = require("bcryptjs"); // Sử dụng gói bcryptjs để mã hoá mật khẩu
const User = require("../models/user");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// ========================= Phần cấu hình để tạo tính năng gửi email trong NodeJS ================
const nodeMailer = require("nodemailer");
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: "phihungkaraoke84@gmail.com",
    pass: "ypox gyzj cpap fbhy",
  },
});

// const mailOptions = {
//   from: "phihungkaraoke84@gmail.com",
//   to: "quanganh1006001@gmail.com",
//   subject: "Sending Email using Node.js",
//   text: "That was easy!",
// };
// =================================================================================================

// // ============================================ Dùng SESSION ====================================================
exports.getLogin = (req, res, next) => {
  let errorInfor = req.flash("login-error"); // === TRUY XUẤT DỮ LIỆU BẰNG FLASH ===: Dòng code này sử dụng flash để truy xuất dữ liệu thông báo lỗi đăng nhập để hiển thị trên view "Login", và khi thực thi dòng code này để lấy dữ liệu đó tại session thì dữ liệu đó cũng đồng thời được xoá luôn khỏi session
  errorInfor = errorInfor.length > 0 ? errorInfor[0] : null;

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorInfor, // ====== LOGIN: GỬI DỮ LIỆU ĐƯỢC TRÍCH XUẤT BỞI FLASH() TỪ SESSION VÀO VIEW "login.ejs" ĐƯỢC RENDER RA ======
    // Thuộc tính "errorMessage" này sẽ được sử dụng ở bên file "login.ejs" để lấy dữ liệu thông báo lỗi login và hiển thị lên form
    oldInputValue: {
      emailValue: "",
      passwordValue: "",
    },
    errorInputArr: [],
  });
};

// =========== Newer funtion =============
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInputValue: {
        emailValue: email,
        passwordValue: password,
      },

      // errors.array(): trả về một mảng các đối tượng mà mỗi đối tượng là một input có lỗi xác thực
      // mỗi đối tượng đó có cấu trúc như sau:
      // {
      //   type: 'field',
      //   value: 'giá trị được người dùng nhập vào input',
      //   msg: 'Đoạn thông báo lỗi do lập trình viên tạo ra bằng hàm "withMessage()" khi sử dụng gói "express-validator",
      //   path: 'tên input có lỗi: name = "email" ',
      //   location: 'body' => input này được lấy ra từ "body" của request: req.body
      // }
      errorInputArr: errors.array(),
    });
  }

  // ================ TRÍCH XUẤT USER THEO EMAIL =================
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Email or password is invalid!",
          oldInputValue: {
            emailValue: email,
            passwordValue: password,
          },
          errorInputArr: [],
        });
      }

      // Dùng "bcryptJS" để kiểm tra "password" người dùng nhập vào có chính xác không
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            // ======== CODE TẠO SESSION VÀ LƯU SESSION VÀO TRONG COLLECTION("SESSION") =========
            // "session" là đối tượng session được "Middleware" ở bên file "app.js" tạo ra theo code // ========= MIDDLEWARE TO CREATE A SESSION ==========
            // Ta có thể thêm một khoá sau "session" với một tên bất kỳ (có thể đặt tên tuỳ ý cho khoá này) là "isLoggedIn"
            req.session.isLoggedIn = true;
            req.session.user = user; // ===== Dùng gói "Express-Session" để lưu dữ liệu của đối tượng "user" vào CSDL "MongoDB" tại thuộc tính "user" trong collection("session"): Collection("session") được xác định theo code // ========= MIDDLEWARE TO CREATE A SESSION ========== bên file "app.js"
            // - User được lưu vào đối tượng session theo cú pháp "req.session.user = user"
            // - Tuy ở đây user một đối tượng mongoose được trích xuất ra từ collection("User") theo code // ===== TRÍCH XUẤT USER THEO EMAIL =====
            //   tức là từ model "User" nên nó có đầy đủ các phương thức mà mongoose cung cấp.
            // - Nhưng vì đối tượng "user" được gói thư viện "Express-Session" lưu vào collection("sessions") do chính gói này tạo ra trong CSDL MongoDB nên nó chỉ lưu dữ liệu thuần tuý của đối tượng "user" như "email", "password" vào trong collection("sessions") thôi
            //   chứ nó không lưu các hàm(find(), findOne(), update(), UpdateOne(), ...) do Mongoose tạo ra cho đối tượng "user", vì vậy trên "req.session.user" không thể gọi các phương thức đó ra để sử dụng theo cú pháp: "req.session.user.findOne(...)" => không gọi "findOne()" theo cú pháp này được
            // - Thế nên để gọi được các hàm đó của "user" thì bên file "app.js" ta phải tạo mới một đối tượng "mongoose" là "user" để gắn nó vào mọi request theo code: // ================ MIDDLEWARE TẠO MỚI MỘT ĐỐI TƯỢNG MONGOOSE LÀ "USER" ĐỂ GẮN VÀO "REQUEST" ================
            // - Thông thường khi ta đã gọi "req.session.user = user" thì gói "express-session" sẽ lưu dữ liệu của "user" vào database "MongoDB" trên collection("sessions") tại thuộc tính "user" nên ta không cần gọi thêm "req.session.save()" như đoạn code bên dưới nữa vì việc lưu sẽ được thực hiện tự động
            // - Nhưng trong tình huống này của ta sau khi login xong cần redirect("/") ngay sang trang "index" để hiển thị danh sách product
            // - Vì việc thực hiện lưu dữ liệu của "user" vào database "MongoDB" và việc redirect("/") sang trang "index" được thực hiện một cách độc lập nhau, nên có thể thao tác lưu dữ liệu của "user" xuống database sẽ lâu hơn, kết thúc sau thao tác redirect("/") sang trang "index"
            //   nên việc hiển thị danh sách sản phẩm lên trang "index" có thể là một danh sách trống không có dữ liệu (hiển thị sai) vì dữ liệu "user" chưa được lưu xong xuống database "MongoDB" nên "Mongoose" chưa thể lấy được dữ liệu "user" dưới database để có được thông tin "user" và không thể trích xuất dữ liệu của product
            //   từ database để hiển thị trên trang "index" cho chính xác, nên sẽ không có dữ liệu product để hiển thị thành danh sách product trên trang "index" thế sẽ hiển thị danh sách trắng
            // - Vậy nên để đảm bảo lưu xong dữ liệu "user" xuống database "MongoDB" rồi mới thực hiện redirect("/") sang trang "index" thì ta phải đưa lệnh res.redirect("/") vào bên trong một hàm callback đặt trong hàm "save()" như dòng code bên dưới.
            // - Điều này có nghĩa là khi hàm "req.session.save()" được thực hiện xong thì hàm callback bên trong "save()" mới được thực hiện và lúc này lệnh redirect("/") mới được gọi và đảm bảo được là sẽ redirect("/") sang trang "index" sau khi đã có dữ liệu của "user" ở dưới database "MongoDB"
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Email or password is invalid!",
            oldInputValue: {
              emailValue: email,
              passwordValue: password,
            },
            errorInputArr: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignup = (req, res, next) => {
  let errorInfor = req.flash("signup-error"); // === TRUY XUẤT DỮ LIỆU BẰNG FLASH ===: Dòng code này sử dụng flash để truy xuất dữ liệu thông báo lỗi đăng nhập để hiển thị trên view "Login", và khi thực thi dòng code này để lấy dữ liệu đó tại session thì dữ liệu đó cũng đồng thời được xoá luôn khỏi session
  errorInfor = errorInfor.length > 0 ? errorInfor[0] : null;

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: errorInfor, // ====== SIGNUP: GỬI DỮ LIỆU ĐƯỢC TRÍCH XUẤT BỞI FLASH() TỪ SESSION VÀO VIEW "login.ejs" ĐƯỢC RENDER RA ======
    // Thuộc tính "errorMessage" này sẽ được sử dụng ở bên file "signup.ejs" để lấy dữ liệu thông báo lỗi signup và hiển thị lên form
    oldInputValue: {
      emailValue: "",
      passwordValue: "",
      confirmPasswordValue: "",
    },

    errorInputArr: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("===== Validation Error =====: ", errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInputValue: {
        emailValue: email,
        passwordValue: password,
        confirmPasswordValue: confirmPassword,
      },

      // errors.array(): trả về một mảng các đối tượng mà mỗi đối tượng là một input có lỗi xác thực
      // mỗi đối tượng đó có cấu trúc như sau:
      // {
      //   type: 'field',
      //   value: 'giá trị được người dùng nhập vào input',
      //   msg: 'Đoạn thông báo lỗi do lập trình viên tạo ra bằng hàm "withMessage()" khi sử dụng gói "express-validator",
      //   path: 'tên input có lỗi: name = "email" ',
      //   location: 'body' => input này được lấy ra từ "body" của request: req.body
      // }
      errorInputArr: errors.array(),
    });
  }

  // ======== Bước tạo Password ========
  // Sử dụng bcrypt.hash() để băm và mã hoá password:
  // tham số đầu "password" là giá trị cần mã hoá, tham số thứ 2 là số vòng băm được áp dụng.
  // Số vòng càng lớn thì càng mất nhiều thời gian nhưng mã hoá mật khẩu càng an toàn.
  // Gần đây 12 được coi là số vòng có độ an toàn cao
  // Và bcrypt.hash() sẽ trả về một promise
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");

      // ===================== Gửi email khi đăng ký thành công ======================
      return transporter.sendMail(
        {
          from: "phihungkaraoke84@gmail.com",
          to: email, // "email" ở đây có thể thay bằng một địa chỉ email thực (VD: daotao@funix.edu.vn) để việc gửi mail được thành công
          subject: "Sending Email using Node.js",
          text: "That was easy!",
        },
        function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
      // =============================================================================
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  // - Khi user click vào logout thì session lưu trên MongoDB (xem trong MongoDB compass) sẽ bị xoá,
  // nhưng cookie lưu trên trình duyệt(xem trong tab Application) sẽ không bị xoá
  // - Khi user click vào login trở lại thì session mới sẽ được tạo ra và lưu trên database và một cookie mới
  //  cũng được tạo ra lưu trên trình duyệt và ghi đè vào cookie cũ
  req.session.destroy((err) => {
    console.log("Error information: ", err);
    res.redirect("/");
  }); // Xoá session
};

exports.getReset = (req, res, next) => {
  let errorInfor = req.flash("error");
  if (errorInfor.length > 0) {
    errorInfor = errorInfor[0];
  } else {
    errorInfor = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: errorInfor, // ====== RESET: GỬI DỮ LIỆU ĐƯỢC TRÍCH XUẤT BỞI FLASH() TỪ SESSION VÀO VIEW "reset.ejs" ĐƯỢC RENDER RA ======
    // Thuộc tính "errorMessage" này sẽ được sử dụng ở bên file "reset.ejs" để lấy dữ liệu thông báo lỗi reset password và hiển thị lên form
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("Error Infomation: ", err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save().then((result) => {
          // res.redirect("/login"); // Trong thực tế sau khi người dùng click vào nút "Reset password thì cần đưa ra thông báo là "Đã gửi link để reset password vào email, hay check mail và truy cập vào link để thực hiện reset password" rồi chuyển người dùng về lại trang "Login" (res.redirect("/login"))
          res.redirect("/reset/" + token); // Nhưng trong bài thực hành này để tiện cho việc theo dõi hoạt động của ứng dụng: khi người dùng click vào nút "Reset password" thì sẽ chuyển luôn người dùng về trang hiển thị form reset password và cho phép người dùng thực hiện ngay việc reset password trên trang này mà không cần phải check email để truy cập vào link trong mail rồi mới tiến hành reset password như trong thực tế
          transporter.sendMail(
            {
              from: "phihungkaraoke84@gmail.com",
              to: req.body.email, // Ở đây có thể thay bằng một địa chỉ email thực (VD: daotao@funix.edu.vn) để việc gửi mail được thành công
              subject: "Reset password",
              html: `
              <p>You requested a password reset </p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a></p>
              `,
            },
            function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            }
          );
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let errorInfor = req.flash("error");
      if (errorInfor.length > 0) {
        errorInfor = errorInfor[0];
      } else {
        errorInfor = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: errorInfor,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
