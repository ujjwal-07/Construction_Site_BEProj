
require("dotenv").config();

const path = require("path")
let alert = require('alert'); 
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const multer = require('multer');
const { strictEqual } = require('assert');
const  {spawn } = require("child_process")
const csv = require('csv-parser')
const fs = require('fs')
const csvtojson = require("csvtojson");
const filePath = path.join(__dirname,"Attendancedata.csv")
const worker = fs.readFileSync(filePath,'utf-8').split('\r\n')
var bodyParser = require('body-parser');

let results = []



console.log(results)

app.set("view engine", "ejs");

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);



app.use(express.static('public'));
// app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


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
Attendance : Number,
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


const Adminschema = new mongoose.Schema({
    Admin : String,
    Pass : String
})

const AdminModel = mongoose.model("adminmodel",Adminschema)



const storage = multer.diskStorage({
    destination:"public/Images_of_students",
    

    filename: function(request, file, callback){
        callback(null, file.originalname);
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

app.get('/Home', (req, res)=>{
    res.sendFile(__dirname + "/views/Home.html");
});

app.get('/Admin', (req, res)=>{
    res.sendFile(__dirname + "/views/admin_login.html");
});





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
        Attendance:0,
        image : imageFile,


    });
    blog.save((err,doc)=>{
        if (err) throw err;
    });
    res.redirect("http://localhost:8080/getDataForWorker");

})




app.post('/Adminpost',(req, res)=>{

    AdminModel.find({ $and :[{Admin: req.body.Admin},{ Pass: req.body.Pass}]},(err,data)=>{
        if(data.length > 0){
            res.redirect("http://localhost:8080/getAttendanceDataForAdmin");

        }
        if(data.length == 0){
            alert("Invalid Credentials")
            res.redirect("http://localhost:8080/Admin");

        }
      
    })
   

})




app.get("/seedetail/:email",(req,res)=>{
    email_find = req.params.email
    wallpapermodel.find({email : email_find}, (err,data)=>{
        res.render('see_detail',{
            dataList : data
        })
    })
})


app.get("/delete/:fname",(req,res)=>{
    email_find = req.params.fname;

    console.log(email_find)
    wallpapermodel.deleteOne({fname : email_find}, (err,data)=>{
        res.redirect("http://localhost:8080/getAttendanceDataForAdmin")
    })
})


app.get("/getDataForWorker",  (req,res)=>{
    wallpapermodel.find({device : "Mobile"}, (err,data)=>{
        res.render('WorkerDataShow',{
            dataList : data
        })  
    })
})


// app.get("/deleteWorkerData/:ID",  (req,res)=>{
//     name_of_worker = req.params.ID
//     worker.splice(name_of_worker,1)
//     const newData = worker.join('\r\n')
//     fs.writeFileSync(filePath,newData,{encoding: 'utf-8'})
//     console.log(name_of_worker)

// })






// app.get("/getAttendanceData",  (req,res)=>{
  
//     fs.createReadStream('Attendancedata.csv').pipe(csv({}))
//     .on('data',(data)=> results.push(data))
//     .on('end',()=>{
//         res.render('showAttendance',{
//             dataList : results
//         }) 
//         console.log(results)
//         results.length = 0
 
//     })
// })

app.get("/getAttendanceData",  (req,res)=>{
  
    wallpapermodel.find({}, (err,data)=>{
        res.render('showAttendance',{
            dataList : data
        })
    })
})

app.get("/getAttendanceDataForAdmin",  (req,res)=>{
  
    wallpapermodel.find({}, (err,data)=>{
        res.render('data_delte_update',{
            dataList : data
        })
    })
})
// app.get("/update/:name",(req,res)=>{
//     email_find = req.params.name
//     wallpapermodel.find({fname : email_find}, (err,data)=>{
//         res.send(data)
//         })
//     })


app.get("/update/:name",(req,res)=>{
    email_find = req.params.name
    console.log(email_find)
    var myquery = { fname: email_find };
    var newvalues = { $inc: {Attendance:1}};
   
    wallpapermodel.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
       
      });
    
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