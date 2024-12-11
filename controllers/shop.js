// ======================================== Sử dụng Mongoose đẻ thao tác với CSDL ======================================
const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const PDFDocument = require("pdfkit");

exports.getProducts = (req, res, next) => {
  Product.find() //	find() trong mongoose không trả về một cursor mà trả về các sản phẩm, nhưng chúng ta vẫn có thể dùng find( ).cursor( ) để truy cập vào con trỏ cursor trong trường hợp find( ) trả về một lượng dữ liệu lớn để có thể chỉ định lấy một lượng dữ liệu giới hạn nào đó tránh việc phải truy xuất một lượng lớn dữ liệu một lúc, sau đó dùng async( ) để lặp lại chúng hoặc dùng next( ) để đến phần tử tiếp theo
    // .select("title price -_id") // Sử dụng select("title name -_id") để chỉ định khi phương thức find() trả về dữ liệu thì dữ liệu nào sẽ được lấy ra, dữ liệu nào sẽ bị ẩn đi: như code này thi "title" và "email" sẽ được lấy ra, còn "imageUrl" và "description" sẽ bị ẩn đi (trong chuỗi tham số truyền vào select() tên thuộc tính nào được đưa vào thì dữ liệu thuộc tính đó sẽ được lấy ra, thuộc tính nào không được đưa vào thì dữ liệu thuộc tính đó không được lấy ra, ngoại trừ thuộc tính "_id" nếu không đưa vào thì mặc định mongoose sẽ vẫn lấy dữ liệu của "_id" ra, trừ khi ta phải loại bỏ dữ liệu của "_id" bằng cách trừ bỏ "_id" một cách tường minh như sau: select("title price -_id") thì khi đó mongoose sẽ loại bỏ dữ liệu của thuộc tính "_id")
    // .populate("userId", "username email -_id") // Sử dụng populate("userId", "username email -_id") để chỉ định cho phương thức populate() sẽ lấy những dữ liệu nào từ collection("user") để điền vào vị trí của thuộc tính "userId" trên collection("products"), cụ thể là: populate("userId", "username email -_id") nghĩa là populate() sẽ lấy ra dữ liệu của "username", của "email" từ collection("users") để điền vào vị trí thuộc tính "userId" của collection("products"), nhưng dữ liệu của thuộc tính "_id" thì không được lấy ra vì trong populate() nó bị trừ bỏ (populate("userId", "username email -_id")). Như vậy trong chuỗi truyền vào tham số thứ 2 của populate() tên thuộc tính nào được đưa vào thì dữ liệu thuộc tính đó sẽ được lấy ra, thuộc tính nào không được đưa vào thì dữ liệu thuộc tính đó không được lấy ra, ngoại trừ thuộc tính "_id" nếu không đưa vào thì mặc định mongoose sẽ vẫn lấy dữ liệu của "_id" ra, trừ khi ta phải loại bỏ dữ liệu của "_id" bằng cách trừ bỏ "_id" một cách tường minh như sau: populate("userId", "username email -_id") thì khi đó mongoose sẽ loại bỏ dữ liệu của thuộc tính "_id")
    .then((products) => {
      console.log("PRODUCTS: ", products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        // isAuthenticated: req.session.isLoggedIn, // Newer code

        // // ==========================================================================================================================================================================================================================================
        // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  // findById() là phương thức được mongoose cung cấp và khi ta truyền chuỗi ID "productId" vào phương thức findById()
  // thì mongoose sẽ thực hiện việc chuyển đổi chuỗi string "productId" thành một đối tượng ID giống với đối tượng ID
  // được lưu trong CSDL MongoDB.
  // Nếu không sử dụng findByID() do mongoose cung cấp mà sử dụng phương thức find() do MongoDB cung cấp thì trước khi
  // truyền vào find() một chuỗi productID, ta phải thực hiện việc chuyển đổi nó thành dạng đối tượng được lưu trong
  // CSDL MongoDB theo cú pháp sau: find(_id: new mongoDB.ObjectId(productId))
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        path: "/products",
        pageTitle: "Detail Page",
        product: product,
        // isAuthenticated: req.session.isLoggedIn, // Newer code

        // // ==========================================================================================================================================================================================================================================
        // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find() // -	find() trong mongoose không trả về một cursor mà trả về các sản phẩm, nhưng chúng ta vẫn có thể dùng find( ).cursor( ) để truy cập vào con trỏ cursor trong trường hợp find( ) trả về một lượng dữ liệu lớn để có thể chỉ định lấy một lượng dữ liệu giới hạn nào đó tránh việc phải truy xuất một lượng lớn dữ liệu một lúc, sau đó dùng async( ) để lặp lại chúng hoặc dùng next( ) để đến phần tử tiếp theo
    .then((products) => {
      console.log("PRODUCTS: ", products);
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        // isAuthenticated: req.session.isLoggedIn, // === CODE(1) ===: tạo thuộc tính "isAuthenticated" cho view "index" khi view được render ra
        // csrfToken: req.csrfToken(), // === CODE(2) ===: gắn chuỗi "csrfToken" cho view "index" khi view được render ra ====== GẮN CSRF-TOKEN VÀO VIEW INDEX ======

        // // ==========================================================================================================================================================================================================================================
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng === CODE(1) === và dòng code === CODE(2) === để sử dụng cho việc lấy giá trị "isAuthenticated" và dùng cơ chế bảo vệ "csrf"
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đó để thêm biến locals "isAuthenticated" và gắn "csrf-token" vào các view nên ta không cần sử dụng đến 2 dòng code này nữa
        // // Với dòng === CODE(1) ===: Thuộc tính "isAuthenticated" ở đây được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Với dòng === CODE(2) ===: Thuộc tính "csrfToken" ở đây được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "csrfToken" để gắn cho mọi view được hiển thị rồi

        // GIẢI THÍCH THÊM về việc tạo ra thuộc tính "csrfToken" để gắn cho view "index" khi view được render ra tại dòng === CODE(2) ===:
        // // Ta sẽ nhận được một phương thức "csrfToken()" từ request (req.csrfToken()), phương thức này được cung cấp bởi "middleware" ta thêm vào bởi gói "csurf" bên file "app.js" tại dòng code ====== Đây là MIDDLEWARE tạo "csrf-token" ======
        // // Khi tạo ra được chuỗi "csrf-token" để lưu vào thuộc tính "csrfToken" như code bên dưới. Khi đó chuỗi "csrf-token" sẽ được sử dụng tại form bên file "navigation.ejs" trong folder "views/includes", tại dòng code ====== SỬ DỤNG CSRF ======
        // // Tại dòng CODE(2) được đánh dấu ====== GẮN CSRF-TOKEN VÀO VIEW INDEX ====== ở trên, lệnh "req.csrfToken()" sẽ tạo ra một chuỗi mã băm "csrfToken" ngẫu nhiên
        // // ==========================================================================================================================================================================================================================================
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productItem") // (========= LƯU Ý QUAN TRỌNG-1 ========): Dùng "populate("cart.items.productItem")" để lấy tất cả dữ liệu của một product (dữ liệu này lấy từ bên collection("products") để điền vào vị trí của thuộc tính "productItem" trong collection("users") theo đường dẫn "cart.items.productItem" được truyền vào trong phương thức "populate("cart.items.productItem")". Lưu ý là việc điền dữ liệu đầy đủ của product vào thuộc tính "productItem" chỉ là điền trong bộ nhớ đang làm việc trên javascript, tức là dữ liệu đó tồn tại trên thuộc tính "productItem" trong javascript chứ thực tế không lưu vào thuộc tính "productItem" trên database nằm trên ổ đĩa cứng vật lý
    // .execPopulate() // Trong video udemy nói mongoose có phương thức "execPopulate()" này để trả về một promise, nhưng khi dùng phương thức này trong bài thì lại báo lỗi là "execPopulate()" không phải là một function ???
    .then((currentUser) => {
      const updatedCart = [];
      const productArray = currentUser.cart.items;
      let isUpdatedCart = false;

      productArray.map((prod, index) => {
        if (!prod.productItem) {
          // Nếu trong cart của user mà product này có thuộc tính productItem = null thì tức là trong cart của user này, product này được đưa vào cart nhưng nó không còn tồn tại trong bảng "products" nữa vì product này đã bị xoá khỏi bảng "products", nên không thể đặt hàng cho product này được, vì vậy phải xoá nó khỏi cart
          productArray.splice(index, 1); // Xoá cart-item chứa product này khỏi cart
          isUpdatedCart = true;
        } else {
          // Nếu trong cart của user mà product này có thuộc tính productItem !== null thì tức là product này vẫn còn trong bảng "products", nên ta sẽ tạo một mảng "updatedCart" để chứa các cart-item:{productItem, quantity} để sau đó cập nhập lại mảng "updatedCart" này xuống vị trí cart.items của user trong database
          // Đưa các cart-item:{productId, quantity} có product vẫn còn tồn tại trong bảng "products" vào trong mảng "updatedCart"
          updatedCart.push({
            productItem: prod.productItem, // ================== Do code ở "LƯU Ý QUAN TRỌNG-1" đã dùng "populate("cart.items.productItem.")" nên ở dòng code này ta có thể lấy tất cả dữ liệu của product ra thông qua thuộc tính "productItem" theo code "...prod.productItem._doc": Nếu dùng "productItem: { ...prod.productItem._doc }" thì sẽ lấy được đầy đủ thông tin của product, nếu chỉ dùng "productItem: prod.productItem" thì sẽ chỉ lấy được "id" của product tương tự như việc ta dùng "productItem: prod.productItem._id" cũng sẽ trả về "id" của product
            quantity: prod.quantity,
          });
        }
      });

      if (isUpdatedCart) {
        // isUpdatedCart = true: nghĩa là cart đã có sự thay đổi và đã được update nên phải lưu thay đổi xuống database để cập nhật dữ liệu cart trên database
        req.user.cart.items = updatedCart; // Update phần dữ liệu user.cart.items của user bằng giá trị của mảng "updatedCart"
        req.user.save(); // Lưu xuống database để cập nhật thay đổi vào database. Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "user" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "user" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "user" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng khi cần
      }

      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: productArray,
        // isAuthenticated: req.session.isLoggedIn, // Newer code

        // // ==========================================================================================================================================================================================================================================
        // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
      });
    });
};

exports.postCart = (req, res, next) => {
  const prodID = req.body.productId;
  Product.findById(prodID)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      console.log("Update to cart is successful!");
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodID = req.body.productId;

  req.user
    .deleteItemFromCart(prodID)
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user })
    .then((orderArr) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orderArr,
        // isAuthenticated: req.session.isLoggedIn, // Newer code

        // // ==========================================================================================================================================================================================================================================
        // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productItem") // (========= LƯU Ý QUAN TRỌNG-2 ========): Dùng "populate("cart.items.productItem")" để lấy tất cả dữ liệu của một product (dữ liệu này lấy từ bên collection("products") để điền vào vị trí của thuộc tính "productItem" trong collection("users") theo đường dẫn "cart.items.productItem" được truyền vào trong phương thức "populate("cart.items.productItem")". Lưu ý là việc điền dữ liệu đầy đủ của product vào thuộc tính "productItem" chỉ là điền trong bộ nhớ đang làm việc trên javascript, tức là dữ liệu đó tồn tại trên thuộc tính "productItem" trong javascript chứ thực tế không lưu vào thuộc tính "productItem" trên database nằm trên ổ đĩa cứng vật lý
    .then((user) => {
      const productArr = user.cart.items.map((cartItem) => {
        return {
          // ================== Do code ở "LƯU Ý QUAN TRỌNG-2" đã dùng "populate("cart.items.productItem.")" nên ở dòng code này ta có thể lấy tất cả dữ liệu của product ra thông qua thuộc tính "productItem" theo code "...prod.productItem._doc": Nếu dùng "productItem: { ...prod.productItem._doc }" thì sẽ lấy được đầy đủ thông tin của product, nếu chỉ dùng "productItem: prod.productItem" thì sẽ chỉ lấy được "id" của product tương tự như việc ta dùng "productItem: prod.productItem._id" cũng sẽ trả về "id" của product
          // ================== Lưu ý: Ở đây ta không thể code như thế này "product: cartItem.productItem", bởi vì bản thân "productItem" được định nghĩa bên collection("user") như sau: productItem: {type: Schema.Types.ObjectId, ref: "Product", required: true}. Nên ProductItem là một đối tượng với rất nhiều siêu dữ liệu đính kèm (metadata) mà ngay cả khi ta có ghi ra màn hình console cũng không nhìn thấy được. Vì vậy để lấy được dữ liệu đầy đủ của product vào "productItem", ta phải dùng một thuộc tính đặc biệt do "mongoose" cung cấp đó là "_doc" như code trong bài
          product: { ...cartItem.productItem._doc },
          quantity: cartItem.quantity,
        };
      });

      const order = new Order({
        user: {
          name: req.user.username,
          userId: req.user, // Chỗ này ta không cần dùng "req.user._id" vì khi dùng "req.user" thì nó chứa cả thuộc tính "_id" trong đó và mongoose sẽ tự lấy thuộc tính "_id" trong "req.user" cho chúng ta
        },
        products: productArr,
      });

      return order.save(); // Lưu dữ liệu xuống collection("order") để cập nhật việc thêm mới một orderItem trên database. Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "order" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "order" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "order" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng như sau
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error("No order found!"));
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      // // CÁCH-1: Đọc file theo cách đọc toàn bộ nội dung file rồi chuyển tất cả nội dung đó vào bộ nhớ rồi gửi đến trình duyệt (KHÔNG KHUYẾN KHÍCH)
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);
      //   res.setHeader("Content-Type", "application/pdf");
      //   // res.setHeader("Content-Disposition", "inline; filename=" + invoiceName); // "inline": Mở pdf trên trình duyệt: tuy nhiên nếu trình duyệt đã được cấu hình là download thay vì mở file pdf thì trình duyệt sẽ tự động download file pdf mà ko mở nó

      //   res.setHeader(
      //     "Content-Disposition",
      //     "attachment; filename=" + invoiceName
      //   ); // "attachment": download file
      //   res.send(data);
      // });

      //   // CÁCH-2: Đọc file theo cách đọc từng phần nội dung file đồng thời chuyển từng phần nội dung đó vào bộ nhớ rồi lần lượt gửi đến trình duyệt (KHUYẾN KHÍCH CÁCH NÀY)
      //   const file = fs.createReadStream(invoicePath);
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     "attachment; filename=" + invoiceName
      //   ); // "attachment": download file
      //   file.pipe(res);

      // CÁCH-3: Tạo mới một file PDF dựa theo dữ liệu thực tế của invoice, thay vì chỉ gửi một file PDF có sẵn trong server về client
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); // Tạo và lưu file pdf vào thư mục theo đường dẫn "invoicePath"
      pdfDoc.pipe(res); // Gửi file PDF lên trình duyệt phía client
      pdfDoc.fontSize(26).text("Invoice", { underline: true }); // Ghi nội dung "Invoice" vào file PDF
      pdfDoc.text("------------------------------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              "-" +
              prod.quantity +
              "x" +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("============================");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end(); // Đóng các luồng tạo file PDF để kết thúc việc tạo file PDF
    })
    .catch((err) => next(err));
};

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     path: "/checkout",
//     pageTitle: "Checkout",
//   });
// };
