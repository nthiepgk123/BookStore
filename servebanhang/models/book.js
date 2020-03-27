const mongoose = require("mongoose");
// cau truc cua 1 cuon sach
const BookSchema = new mongoose.Schema({
    name : String,
    image : String,
    file : String
});
// noi bang 1 - n
module.exports = mongoose.model("Book",BookSchema);