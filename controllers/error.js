exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    // isAuthenticated: req.session.isLoggedIn, // Newer code

    // // ==========================================================================================================================================================================================================================================
    // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== GẮN CSRF-TOKEN VÀO VIEW INDEX ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
    // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
    // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    // isAuthenticated: req.session.isLoggedIn, // Newer code

    // // ==========================================================================================================================================================================================================================================
    // // Thuộc tính "isAuthenticated" ở dòng code "Newer code" bên trên được bỏ đi vì bên file "app.js" trong khối code ====== GẮN CSRF-TOKEN VÀO VIEW INDEX ====== đã có thuộc tính "isAuthenticated" để gắn cho mọi view được hiển thị rồi
    // // Nếu không sử dụng khối code ====== MIDDLEWARE GẮN CSRF-TOKEN VÀO VIEW ====== bên file "app.js" thì ta phải uncomment dòng code "Newer code" bên trên để sử dụng thuộc tính "isAuthenticated" cho view khi được render ra
    // // Nhưng do bên file "app.js" đã sử dụng khối code middleware đó để gắn thuộc tính "isAuthenticated" vào các view nên ta không cần sử dụng đến dòng code "Newer code" này nữa
  });
};
