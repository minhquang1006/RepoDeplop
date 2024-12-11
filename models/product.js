// =========================================== MONGOOSE ======================================================
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId, // Đây là một tham chiếu đến collection("users") (bảng user hay model user), nhưng vì nó là một đối tượng ID chung chung chứ nó không rõ là đối tượng ID của collection (bảng hay model) nào. Nên ta cần có thêm thuộc tính {ref: "User"} bên dưới để mô tả rõ rằng type này là tham chiếu đến collection("users")
    ref: "User", // Ta chỉ sử dụng thuộc tính "ref" này khi ta thiết lập mối quan hệ từ collection này tới collection khác bằng việc dùng tham chiếu, tức là lưu ID của collection khác trên collection này. Nếu ta thiết lập mối quan hệ giữa các collection bằng việc nhúng trực tiếp document có dữ liệu của collection khác trên collection này thì ta không cần dùng "ref" để xác định là nó liên kết đến collection nào vì nó đã có một mối quan hệ ngầm xác định bên trong document được nhúng trên collection này
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
