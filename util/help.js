const fs = require("fs");

function deleteFile(filePath) {
  console.log("========= File Path ========: ", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
}

exports.deleteFile = deleteFile;
