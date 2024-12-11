// ======================================== Sử dụng Mongoose đẻ thao tác với CSDL ======================================
const mongoDB = require("mongodb");
const ObjectId = mongoDB.ObjectId;
const Product = require("../models/product");
const Order = require("../models/order");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../util/help");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    errorInputArr: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image!",
      errorInputArr: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      errorInputArr: errors.array(),
    });
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    // userId: req.user, // Code cũ: Chỗ này ta không cần để code là "req.user._id" vì khi ta để code là "req.user" thì bản thân user là một đối tượng trong đó có chứa thuộc tính _id (tức là: user._id) và mongoose sẽ tự động trích xuất thuộc tính "_id" bên trong "req.user" cho chúng ta
    userId: req.user,
  });

  product
    .save() // Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "product" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "product" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "product" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng như sau
    .then(() => res.redirect("/"))
    .catch((err) => {
      // // Cách-1: Xử lý lỗi bằng cách giữ nguyên trang đó cùng với những dữ liệu mà người dùng đã nhập và đưa ra một thông báo lỗi trên trang
      // return res.status(422).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage: "Database operation failed, please try again!",
      //   errorInputArr: [],
      // });

      // // Cách-2: Xử lý lỗi bằng cách chuyển hướng người dùng đến một trang lỗi, kèm thông báo lỗi trên trang
      // res.redirect("/500");

      // Cách-3: Xử lý lỗi bằng cách tạo một đối tượng lỗi rồi truyền vào hàm next(error)
      // Và chính hàm next(error) này sẽ gọi ngay đến một Middleware đặc biệt để xử lý lỗi với 4 tham số: app.use((err, req, res, next)=>{...})
      // Middleware đặt biệt này được định nghĩa bên file "app.js"
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  Product.findById(productId)
    .then((prod) => {
      if (!prod) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: prod,
        hasError: false,
        errorMessage: null,
        errorInputArr: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = async (req, res, next) => {
  // Find product to edit
  const productID = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        _id: productID,
      },
      errorMessage: errors.array()[0].msg,
      errorInputArr: errors.array(),
    });
  }

  // - findById() của mongoose sẽ trả về một đối tượng mongoose có đầy đủ các phương thức mà mongoose cung cấp
  // - Như vậy product trong then(product=>{...}) chính là một đối tượng mongoose có đầy đủ các phương thức mà
  // mongoose cung cấp, trong đó có phương thức save()
  // - Phương thức save() sẽ kiểm tra xem đối tượng "product" đã tồn tại trong CSDL chưa, nếu:
  //   + Đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ product vào CSDL
  //   + Chưa tồn tại thì save() sẽ lưu đối tượng product đó vào CSDL thành một dữ liệu mới được thêm vào
  Product.findById(productID)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }

      product.title = title;
      product.price = price;
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = description;

      return product
        .save() // Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "product" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "product" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "product" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng như sau
        .then(() => res.redirect("/admin/products"));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product is not found!"));
      }
      deleteFile(product.imageUrl);
      // Mongoose còn cung cấp phương thức findByIdAndDelete() để xoá một phần tử nào đó khỏi CSDL
      return Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
          // Xoá sản phẩm có id = prodId trong mọi document trong collection("orders"): tức là tìm đến collection("order") để xoá bỏ các sản phẩm trong collection("order") mà các sản phẩm đó không còn tồn tại trong collection("products")
          return Order.updateMany(
            {}, // Để một document rỗng {}: là để update với mọi document trong collection phù hợp với điều kiện bên dưới ( products: { "product._id": new mongoDB.ObjectId(prodId) } )
            {
              $pull: {
                products: { "product._id": new mongoDB.ObjectId(prodId) },
              }, // $pull (kéo ra): là để xoá bỏ sản phẩm nằm trong items mà có _id = prodID (xoá khỏi "products" array)
            }
          );
        })
        .then(() => {
          // Tìm trong collection("orders") tất cả những document (order item) nào mà có thuộc tính items là array rỗng
          // (là những order item mà ko có sản phẩm nào được đặt hàng) để xoá bỏ những document(order item) như vậy
          return Order.deleteMany({ products: [] });
        })
        .then(() => {
          console.log("Deleted product!");
          res.redirect("/admin/products");
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => next(err));
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) =>
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        // isAuthenticated: req.session.isLoggedIn, // Newer code

        // // ==========================================================================================================================================================================================================================================
        // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
        // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
        // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
