const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const csrf = require("csurf"); // Sử dụng gói với tên là "csurf", mẫu thẻ là "csrf" để bảo vệ trang không bị tấn công theo kiểu "giả mạo liên trang - CSRF"
const flash = require("connect-flash"); // Sử dụng gói với tên là "connect-flash", để lưu dữ liệu trên session và truy xuất dữ liệu đó khi cần (khi thực hiện việc truy xuất dữ liệu này trên sesison thì đồng thời dữ liệu này cũng bị xoá luôn khỏi session)
const multer = require("multer");

// ============================================================================================================
const fs = require("fs");

// Tạo sẵn folder trong project "images" để lưu hình ảnh
const imagePath = path.join(__dirname, "images");
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}
// ============================================================================================================

// ====================== Thiết lập lưu session trong CSDL MongoDB ============================
const session = require("express-session"); // import gói quản lý session
const MongoDBStore = require("connect-mongodb-session")(session); // Tạo đối tượng "MongoDBStore" để lưu session vào CSDL "MongoDB". Bản thân câu lệnh "require("connect-mongodb-session")" sẽ trả về một hàm, và ta sẽ truyền vào hàm này đối tượng "session" được import ở ngay dòng code trên

const MONGODB_URL =
  "mongodb+srv://quanganh1006:08032020@clustermongodb.g0asari.mongodb.net/shopAuthentication";

const myStore = new MongoDBStore({
  uri: MONGODB_URL, // Bây giờ session sẽ được lưu trữ trong CSDL có tên là "shopAuthentication", tuy nhiên ta cũng có thể lưu trữ session ở một CSDL khác, nhưng giá trị của "uri" sẽ phải là một chuỗi kết nối khác mà trỏ đến tên CSDL đó
  collection: "sessions", // ta xác định một collection("sessions") trong CSDL "shopAuthentication" để lưu trữ các session, và colleciton đó có tên là "sessions" (tên có thể đặt tuỳ ý)
  expires: 20 * 60 * 1000, // ta có thể thiết lập thêm thời hạn cho session này và khi hết hạn MongoDB sẽ tự động xoá session này khỏi CSDL
});
// ============================================================================================

// Thiết lập bảo vệ bằng gói "csrf"
// Bằng việc gọi "csrf()" như một hàm thì đây chính là cài đặt mặc định, và nó sẽ hoạt động tốt cho việc thực hiện bảo vệ bằng "csrf"
// Để sử dụng ta có thể dùng nó như một "middleware" chạy đằng sau "middleware" tạo session, vì "csrf" nó sẽ sử dụng session được tạo ra từ "middleware" tạo session để gắn "csrf-token" vào session đó và bảo vệ cho session đó
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// ======================================= Các Middleware ======================================================
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// - Thiết lập một session mới với thuộc tính "secret" có giá trị là một chuỗi "my secret", thường giá trị của thuộc tính "secret"
// nên là một chuỗi ký tự dài ngẫu nhiên, thuộc tính "resave = false" có nghĩa là "session" sẽ không được lưu
// với mọi request khi mà request đó đã được respone phản hồi
// - Thuộc tính "saveUnInitialized: false" có nghĩa là đảm bảo không có phiên (session) nào được lưu cho một request khi không có thay đổi nào trong request đó cả và vì thế nó không cần thiết phải được lưu lại
// - Thuộc tính "cookie": có thể thiết lập thành {cookie: {maxAge:10}} hoặc {cookie:{expires}} là để tạo thời hạn tồn tại cho cookie
// - Nếu 2 thuộc tính "saveUninitialized" và "cookie" mà không được thiết lập thì có thể dùng theo mặc định

// - Middleware này để tạo một session (express session) và sử dụng session này trong code
// - Express tạo ra cho ta một session bằng middleware này và đồng thời cũng tự động tạo ra một cookie trong session đó
// và Express cũng sẽ tự động đọc được cookie đó cho ta (nó thực hiện tất cả các công việc phân tích cú pháp và cài đặt cookie cho ta)
// - Ta không cần (hoặc hiếm khi) phải tự quản lý cookie, express sẽ quản lý cookie theo phiên (session), tức là cookie thường gắn với một session (phiên)
// - Ta có thể dùng session (phiên) để lưu trữ bất kỳ loại dữ liệu nào bạn muốn, ví dụ như: trạng thái xác thực, giỏ hàng của người dùng, các dữ liệu thuộc về người dùng,...

// ========= MIDDLEWARE TO CREATE A SESSION ==========
// - Middleware này sẽ tạo một collection("sessions") trong CSDL "shopAuthentication" để lưu các session ngay khi server khởi chạy
// - Nhưng trong collection("sessions") này chưa có dữ liệu nào, nó chỉ là một collection("session") trống đã được
//   cấu hình với những thuộc tính như code bên dưới
// - Chỉ khi user login thì session mới được tạo và lưu vào collection("session") theo code // ======== CODE TẠO SESSION VÀ LƯU SESSION VÀO TRONG COLLECTION("SESSION") ========= ở bên file "auth.js" thuộc folder "controller"
app.use(
  session({
    secret: "my secret", // secret được sử dụng để tạo một mã băm (hash code) cho ID của session đang được tạo và lưu trữ mã băm (hash code) của ID của session đó trong một cookie và cookie này được lưu trên trình duyệt phía client (còn session thì sẽ được lưu ở database bên server)
    resave: false,
    saveUninitialized: false,
    store: myStore, // Sử dụng kho lưu session "myStore" được tạo ra ở trên để lưu một session được tạo ra từ midđleware này. Lúc này dữ liệu session được tạo ra tại middleware này sẽ được lưu trữ ở "myStore" là biến trỏ đến collection("sessions") nằm trên CSDL "shopAuthentication"
  })
);
// =============================================================================================================

// ===== Tạo một middleware sử dụng "csrf" ngay sau middleware tạo session để dùng "csrf" như một middleware để bảo vệ khỏi kiểu tấn công "Giả mạo liên trang - CSRF"
// - Về cơ bản khi đã dùng "csrf" để bảo vệ thì nó sẽ kiểm tra đối với mọi request không phải "get" (vì chúng ta thường dùng request "post" để thay đổi dữ liệu)
// - Nó kiểm tra sự tồn tại của "csrf-token" trong "view", trong "request", về cơ bản là trong phần "body" của "request" xem có "csrf-token" ở đó không
// - Để gắn "csrf-token" vào "view" giả sử là view hiển thị router("/") nằm trong action "getIndex()" bên file "shop.js" ở folder "controller"
// - Ta đi đến "getIndex()" sau đó thêm một thuộc tính mới có tên là "csrfToken" vào phần code render("/shop/index") render ra trang index như tại dòng code ====== GẮN CSRF-TOKEN VÀO VIEW INDEX ======
app.use(csrfProtection); // ====== Đây là MIDDLEWARE tạo "csrf-token" ======

// ====== Sử dụng flash sau khối code tạo session ========= MIDDLEWARE TO CREATE A SESSION ========== bên trên để lưu dữ liệu vào session ====== (lưu ý là phải sử dụng flash() sau khối code tạo session vì flash() sẽ thực hiện lưu dữ liệu vào session nên session phải được tạo ra thì mới sử dụng được flash())
// Từ đây ta có thể sử dụng "middleware flash" này trên đối tượng "req" để truy xuất dữ liệu lưu dưới session ở bất cứ đâu trong ứng dụng
// Trong ứng dụng, ta đang sử dụng "middleware flash" này để truy xuất dữ liệu lưu trong session ở những dòng code có đánh dấu là // === TẠO DỮ LIỆU "ERROR-LOGIN" LƯU TRÊN SESSION BẰNG GÓI CONNECT-FLASH ===
app.use(flash());

// =============== Tạo một middleware để truyền biến cục bộ vào bất kỳ view nào đang được hiển thị trong web ============
// Middleware này sử dụng thuộc tính đặc biệt của đối tượng res đó là locals
// ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ======
app.use((req, res, next) => {
  console.log("======= error in here ========");
  res.locals.isAuthenticated = req.session.isLoggedIn; // Thông qua thuộc tính "locals", khi có bất kỳ request nào được gửi tới server để yêu cầu hiển thị một view nào đó thì thuộc tính "isAuthenticated" sẽ được truyền vào bất cứ view nào đang được hiển thị
  res.locals.csrfToken = req.csrfToken(); // Thông qua thuộc tính "locals", khi có bất kỳ request nào được gửi tới server để yêu cầu hiển thị một view nào đó thì thuộc tính "csrfToken" sẽ được truyền vào bất cứ view nào đang được hiển thị (thuộc tính "csrfToken" sẽ có giá trị là chuỗi "csrf-token" do phương thức "req.csrfToken()" trả về)
  next();
});

// ================ MIDDLEWARE TẠO MỚI MỘT ĐỐI TƯỢNG MONGOOSE LÀ "USER" ĐỂ GẮN VÀO "REQUEST" ================
app.use((req, res, next) => {
  console.log("======================: ", req.session);
  // throw new Error("Dummy"); // Dòng code giả định xảy ra lỗi trong khối code đồng bộ và dòng code này sẽ kích hoạt "MIDDLEWARE ĐẶC BIỆT" bên dưới bắt lỗi xảy ra trong code đồng bộ
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // throw new Error("Dummy"); // Dòng code giả định xảy ra lỗi trong khối code không đồng bộ
      if (!user) {
        next();
      }
      req.user = user; // ===== Tạo mới đối tượng mongoose "user" để gắn vào request: user ở đây là một đối tượng mongoose nó có đầy đủ các phương thức mà mongoose cung cấp. Vì vậy user có thể gọi tất cả các phương thức đó ra để sử dụng.
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error); // Dòng code này kích hoạt "MIDDLEWARE ĐẶC BIỆT" bên dưới bắt lỗi xảy ra trong khối code không đồng bộ
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

// Middleware đặc biệt sẽ lập tức được kích hoạt để xử lý bất kỳ lỗi nào phát sinh,
// và lỗi phát sinh sẽ có 2 trường hợp:
// TH-1: Lỗi phát sinh ở các đoạn code đồng bộ: cũng được middleware đặc biệt này xử lý
// TH-2: Lỗi phát sinh ở các đoạn code không đồng bộ (promise): thì ở những đoạn code không đồng bộ đó ta phải
// có khối catch() để bắt lỗi bằng cách tạo ra một lỗi mới với phương thức "next(error)" như sau:

// Khối code không đồng bộ (promise) có lỗi bên trong:
// Product.find().then(()=>{
//    Lỗi phát sinh ở đây
// }
// ).catch((err) => {
//   const error = new Error(err);
//   error.httpStatusCode = 500;
//   return next(error); // Trong khối catch phải có lệnh gọi next(error) như thế này thì middleware đặc biệt mới nhận biết được có lỗi và được kích hoạt để bắt lỗi xay ra trong code không đồng bộ
// });

// Lưu ý rằng: Middleware đặc biệt này sẽ không xử lý lỗi 404 (lỗi không tìm thấy trang)
// Vì lỗi 404 xảy ra là khi ta truy cập vào một URL nào đó mà không tồn tại, nhưng về mặt kỹ thuật URL đó vẫn là một URL hợp lệ, chỉ đơn giản là nó không tồn tại

// ========== MIDDLEWARE ĐẶC BIỆT XỬ LÝ LỖI TRONG CODE ĐỒNG BỘ VÀ CODE KHÔNG ĐỒNG BỘ ================
app.use((err, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// Gọi phương thức connect của mongoose để tạo kết nối sever với CSDL và tạo một server
mongoose
  .connect(MONGODB_URL)
  .then((connectResult) => {
    app.listen(3000);
  })
  .catch((err) => console.log("Error information: ", err));

// ======================================================================================================
// Để thực hành bài này ta cần giả định:
// - Lỗi 404 hiển thị trang 404: Commend dòng code 99 lại rồi nhập vào URL một địa chỉ không tồn tại: "localhost:3000/abc"
// - Lỗi 500 hiển thị trang 500: Uncommend dòng code 99 và thực hiện reload lại trang sẽ thấy hiển thị trang 500
