// =========================================== MONGOOSE ======================================================
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  resetToken: String,
  resetTokenExpiration: Date,

  cart: {
    type: {
      // Khi ta định nghĩa kiểu dữ liệu cho thuộc tính "items", ta có thể để là một mảng string ([string]), mảng dạng số ([number]), hoặc mảng đối tượng [{...}]
      items: [
        {
          productItem: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
  },
});

// Defines a function for collection("user") by using "userSchema"
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productItem.toString() === product._id.toString()
  );

  let newQuantity = 1;
  const updatedCartItems = this.cart.items;

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productItem: product._id, // Ở dòng code này, ta đang sử dụng "mongoose" nên ta không cần sử dụng "ObjectId" để bọc giá trị của thuộc tính "_id" vào một ObjectId như thế này "new mongoDB.ObjectId(product._id)" như khi ta sử dụng "MongoDB" đơn thuần nữa vì "mongoose" sẽ tự động bọc "_id" vào cho chúng ta
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId) {
  const updatedCart = this.cart.items.filter(
    (item) => item.productItem.toString() !== productId.toString()
  );

  this.cart.items = updatedCart;
  return this.save(); // Lưu dữ liệu xuống collection("user") để cập nhật thay đổi cart.items = updatedCart trên database. Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "user" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "user" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "user" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng khi cần
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save(); // Lưu dữ liệu xuống collection("user") để cập nhật thay đổi cart.items = [] trên database. Hàm save() là một hàm được cung cấp từ mongoose, hàm save() sẽ kiểm tra xem đối tượng "user" đã tồn tại trong CSDL chưa, nếu đã tồn tại thì save() sẽ cập nhật những thay đổi mới từ "user" vào CSDL, nếu chưa tồn tại thì save() sẽ lưu đối tượng "user" đó vào CSDL thành một dữ liệu mới được thêm vào. Về mặt kỹ thuật hàm save không trả về một promise cho ta, nhưng trên hàm save(), mongoose vẫn cung cấp cho ta một phương thức then() và catch() để ta có thể sử dụng khi cần
};

// // =============================== Hàm addOrder này không dùng nữa (xoá bỏ) ==================================
// userSchema.methods.addOrder = function () {
//   const orderArr = [];
//   return this.populate("cart.items.productItem")
//     .then((user) =>
//       user.cart.items.map((item) => {
//         const orderItem = {
//           product: item.productItem,
//           quantity: item.quantity,
//         };
//         orderArr.push(orderItem);
//       })
//     )
//     .then(() =>
//       collection("orders").insertOne({ orderItems: orderArr, user: this }) // Phương thức insertOne() do mongoose cung cấp, nó được sử dụng để chèn một document mới (bản ghi mới) vào collection("user") (bảng "users")
//     );
// };
// // ===========================================================================================================

module.exports = mongoose.model("User", userSchema);
