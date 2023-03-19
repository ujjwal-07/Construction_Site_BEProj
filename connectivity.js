const mongoose = require('mongoose');
require("dotenv").config();
const express = require('express');
const app = express();
const multer = require('multer');
var path = require('path');
const { strictEqual } = require('assert');
const  {spawn } = require("child_process")
const csv = require('csv-parser')
const fs = require('fs')
let results = []
const csvtojson = require("csvtojson");



console.log(results)

app.set("view engine", "ejs");

app.use(express.static('public'));
// app.use(express.static(__dirname + "/public"));



var router = express.Router();


var mongoDB = 'mongodb://127.0.0.1/workerdata';
mongoose.connect(mongoDB).then(()=>{
    console.log('db connected');
}).catch(err=>{
    console.log(err)
})

const uploadWallpaperschema = new mongoose.Schema({
fname : String,
lname : String,
phone : Number,
email : String,
Department : String,
Previous_comp : String,
experience : Number,
bond_for_days : Number,
image: String
})

const wallpapermodel = mongoose.model("model", uploadWallpaperschema)


const attendanceschema = new mongoose.Schema({
    Name : String,
    Time : String,
    Date : String,
    Attedance : Number
})

const attendanceModel = mongoose.model("newmodel",attendanceschema)

const storage = multer.diskStorage({
    destination:"./public/upload/",
    

    filename: function(request, file, callback){
        callback(null, Date.now() + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3,
    },
});

app.get('/addworker',(req,res)=>{
    res.render("mean");

})

app.post('/post', upload.single('file') ,(req, res)=>{
    var imageFile = req.file.filename;
    var success = req.file.fieldname+ "uploaded succesfully";

    var blog = new wallpapermodel({
        fname: req.body.fname,
        lname: req.body.lname,
        phone: req.body.phone,
        email : req.body.email,
        Department : req.body.Department,
        Previous_comp :  req.body.Previous_comp,
        experience : req.body.experience,
        bond_for_days : req.body.bond_for_days,
        image : imageFile

    });
    blog.save((err,doc)=>{
        if (err) throw err;
    });
    res.redirect("http://localhost:8080/getDataForWorker");

})






app.get("/seedetail/:email",(req,res)=>{
    email_find = req.params.email
    wallpapermodel.find({email : email_find}, (err,data)=>{
        res.render('see_detail',{
            dataList : data
        })
    })
})



app.get("/getDataForWorker",  (req,res)=>{
    wallpapermodel.find({device : "Mobile"}, (err,data)=>{
        res.render('WorkerDataShow',{
            dataList : data
        })  
    })
})


app.get("/getAttendanceData",  (req,res)=>{
  
    fs.createReadStream('Attendancedata.csv').pipe(csv({}))
    .on('data',(data)=> results.push(data))
    .on('end',()=>{
        res.render('showAttendance',{
            dataList : results
        }) 
        results.length = 0
 
    })
})

app.get("/deleteData/:Name",(req,res)=>{
    email_find = req.params.Name
    wallpapermodel.find({email : email_find}, (err,data)=>{
        res.render('see_detail',{
            dataList : data
        })
    })
})






// app.get("/demo",  (req,res)=>{
//     fs.createReadStream('Attendancedata.csv').pipe(csv({}))
//     .on('data',(data)=> results.push(data))
//     .on('end',()=>{
//         console.log(results[0].Name);
//             res.render('demo',{
//             dataList : results
//         })
//     })

// })


app.get("/getDataForPlumber",  (req,res)=>{
    wallpapermodel.find({ Department : "Plumber"}, (err,data)=>{
        res.render('WorkerDataShow',{
            dataList : data
        })
    })
})
app.get("/getDataForCarpenter",  (req,res)=>{
    wallpapermodel.find({ Department : "Carpenter"}, (err,data)=>{
        res.render('WorkerDataShow',{
            dataList : data
        })
    })
})
app.get("/getDataForElectrician",  (req,res)=>{
    wallpapermodel.find({ Department : "Electrician"}, (err,data)=>{
        res.render('WorkerDataShow',{ 
            dataList : data
        })
    })
})


// Face Detetction and Liveliness detection part

app.get("/takeAttendance", async(req, res)=>{
    const py = spawn('python',['blinkdetectiontest.py','ujjwal'])
    res = ''
    py.stdout.on('data',(data)=>{
        // console.log(data.toString());
        res = data.toString()

})

py.on('open',(code)=>{
        console.log(`stored result is  ${res}`);
        res = "detection Passed"
        if (res === "detection Passed"){
            console.log("Hii")
            const py = spawn('python',['AttendanceProject.py','ujjwal'])
    
            py.stdout.on('data',(data)=>{
                // console.log(data.toString());
                res = data.toString()
            })
            
        }
        else{
            console.log("noo");
        }
    
    })


    py.on('close',(code)=>{
        console.log(`stored result is  ${res}`);
        res = "detection Passed"
        if (res === "detection Passed"){
            console.log("Hii")
            const py = spawn('python',['AttendanceProject.py','ujjwal'])
    
            py.stdout.on('data',(data)=>{
                // console.log(data.toString());
                res = data.toString()
            })
            
        }
        else{
            console.log("noo");
        }
    
    })
})


app.post("/add", async (req,res)=>{
    csvtojson()
    .fromFile("Attendancedata.csv")
    .then(csvData =>{
        console.log(csvData);
        attendanceModel.insertMany(csvData).then(function(){
            console.log("Data Inserted")
            res.json({success: 'success'});
        }).catch(function(error){
            console.log(error)
        });
    });
});






const port = process.env.PORT || 8080;

app.listen(port, console.log(`Listening on port ${port}..`));