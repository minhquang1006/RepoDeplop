// =========================================== MONGOOSE ======================================================
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true }, // product: { type: Object, required: true } là một tài liệu được nhúng vào collection("order") tại thuộc tính "products"
      quantity: { type: Number, required: true }, // quantity: { type: Number, required: true } là một tài liệu được nhúng vào collection("order") tại thuộc tính "products"
    },
  ],
  user: {
    name: { type: String, require: true }, // name: { type: String, require: true } là một tài liệu được nhúng vào collection("order") tại thuộc tính "user"
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // userId: { type: Schema.Types.ObjectId, ref: "User", required: true } là một tham chiếu liên kết đến collection("user") (tạo mối liên kết giữa collection("order") với collection("user")). Vì nó có sử dụng: ref: "user" tức là tham chiếu đến collection("user") và sử dụng: type: Schema.Types.ObjectId tức là lấy id) của collection("User")
  },
});

module.exports = mongoose.model("Order", orderSchema);
