const mongoose = require("mongoose");
// cau truc the loai
const categorySchema = new mongoose.Schema({
    name : String,
    Books_id : [{type: mongoose.Types.ObjectId , ref : 'Book'}]
});
// noi bang 1 - n
module.exports = mongoose.model("Category",categorySchema);