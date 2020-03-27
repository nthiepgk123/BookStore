var express = require("express");
var app = express();

app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("public"));
app.listen(3000);
// cho phep truy cap 
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// body-parser : use upload file
var bodyparser = require('body-parser');

var jsonParser = require('body-parser').json();
app.use(bodyparser.urlencoded({ extended : false}));


// mongoose
const Mongoose= require('mongoose');
Mongoose.set('useFindAndModify',false); 
Mongoose.connect('mongodb+srv://bookstores:Ih2Bbb5WZwrZAtoL@cluster0-hyeah.gcp.mongodb.net/BookStore?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true },function(err){
    if(err){
        console.log("ko the connect");
    }
    else{
        console.log("Connect thanh cong");
    }
});

app.get("/",function(req,res){
    res.render("home");
});

// multer dung de upload file
var multer  = require('multer');
var storage = multer.diskStorage({
    // cau hinh noi chua img khi upload
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    // cach cau hinh ten file
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
}); 
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        // cac dang file upload
        if( file.mimetype=="image/bmp" ||
            file.mimetype=="image/png" ||
            file.mimetype=="image/jpg" ||
            file.mimetype=="image/jpeg"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("fileimg");

// them 2 bang da tao
const Category = require("./models/category");
const Book = require("./models/book")


app.get("/cate",function(req,res){
    res.render("cate");
})

app.post("/cate",function(req,res){
    var newcate = new Category({
        name : req.body.txtcate,
        Books_id : [] 
    });
    newcate.save(function(err){
        if(err){
            console.log("loi");
            res.json({kq:0});
        }
        else{
            console.log("okee");
            res.json({kq:1});
        }
    })
})

app.post('/api/category', (req,res)=>{
    // console.log(req.body.id);
    const id_cate =  req.body.id;
    // Category.find({_id : id_cate})
    // .select('Books_id name')
    // .exec(function(err,items){
    //     console.log(items);
    //     console.log(items[0].name + "===" + items[0]._id);
    //     let s = items[0].Books_id;
    //     console.log(s);
    // });
    console.log(id_cate);
    Category.
    findOne({_id : id_cate}).
    populate('Books_id').
    exec(function(err,items){
        if(err){
            console.log(err);
        }else{
            //console.log(items);
            res.json(items);
        }
    })
});

app.post("/api/cate",function(req,res){
    Category.find(function(err,items){
        if(err){
            res.json({kq:0,"err" : err})
        }
        else{
            res.json(items);
        }
    })
})

app.get("/book",function(req,res){
    Category.find(function(err,items){
        if(err){
            res.send("Looi");
        }
        else{
            console.log(items); 
            res.render("book",{Cates : items});
        }
    });
});

app.post("/book",function(req,res){

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.log("A Multer error occurred when uploading."); 
          res.json({"kq":0,"err" : err});

        } else if (err) {
          console.log("An unknown error occurred when uploading." + err);
          res.json({"kq":0,"err" : err});
        }else{
            console.log("Upload is okay");
            console.log(req.file); // Thông tin file đã 
            res.send({kq : 1 , "fileImg":req.file})
        }

        var book = new Book({
            name : req.body.txtbook,
            image : req.file.filename,
            file : req.body.txtFile
        });
        
        //console.log(book);
        // luu data vao db
        book.save(function(err){
            if(err){
                console.log("them sach khong thanh cong");
            }
            else{
                console.log("them thanh cong");

                Category.findOneAndUpdate(
                    {_id : req.body.selectCate},
                    { $push: {Books_id: book._id}},
                    function(err){
                        if(err){
                            console.log("update ko thanh cong");
                        }
                        else{
                            console.log("update thanh cong");
                        }
                    })
            }
        })
    });

});