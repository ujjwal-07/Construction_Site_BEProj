
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
const bcrypt = require("bcrypt")
let ts = Date.now();

var bodyParser = require('body-parser');
const { name } = require("ejs");


let results = []
const users = [] 


console.log(results)

app.set("view engine", "ejs");

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);



app.use(express.static('public'));
// app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}));


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
birthDate : String,
phone : Number,
Department : String,
Previous_comp : String,
experience : Number,
bond_for_days : Number,
Attendance : Number,
empID: String,
Date:String,
Time: String,
PunchOut: String,
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
        callback(null, file.originalname.toUpperCase());
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

app.get('/Admin_Home', (req, res)=>{
    res.sendFile(__dirname + "/views/admin_HomePage.html");
});
app.get('/Admin', (req, res)=>{
    res.sendFile(__dirname + "/views/admin_login.html");
});

app.get('/add_Admin',(req,res)=>{
    res.sendFile(__dirname + "/views/add_Admin.html");
})
app.get('/about_us',(req,res)=>{
    res.sendFile(__dirname + "/views/about_us.html")
})



app.get("/main_home",(req,res)=>{
    res.sendFile(__dirname+"/views/Homespage.html")
})



app.post('/post', upload.single('file') ,(req, res)=>{
    var imageFile = req.file.filename.toUpperCase();
    var success = req.file.fieldname+ "uploaded succesfully";
    var empID_find = req.body.Department[0]+"-"+req.body.fname[0].toUpperCase()+req.body.lname[0].toUpperCase()+req.body.birthDate.slice(-4)
    var ext = imageFile.split(".")
    ext = ext[1].toLocaleLowerCase()
    var image_emp_name = empID_find+"."+ext
    console.log(imageFile)
    console.log(image_emp_name);
    fs.rename(`public/Images_of_students/${imageFile}`, `public/Images_of_students/${image_emp_name}`,  (error) => {
        if (error) {
            
          // Show the error 
          console.log(error);
        }
        else {
        
          // List all the filenames after renaming
          console.log("\nFile Renamed\n");
         
          // List all the filenames after renaming
        }
    });
    wallpapermodel.find({empID : empID_find}, (err,data)=>{
        if(data.length > 0){
            alert("Worker Data Already Present")
            res.redirect("http://localhost:8080/addworker")
        }
    else{
    var blog = new wallpapermodel({
        fname: req.body.fname.toUpperCase(),
        lname: req.body.lname.toUpperCase(),
        birthDate: req.body.birthDate,
        phone: req.body.phone,
        Department : req.body.Department,
        Previous_comp :  req.body.Previous_comp,
        experience : req.body.experience,
        bond_for_days : req.body.bond_for_days, 
        Attendance:0,
        empID: req.body.Department[0]+"-"+req.body.fname[0].toUpperCase()+req.body.lname[0].toUpperCase()+req.body.birthDate.slice(-4),
        Date : '',
        Time:null,
        PunchOut:null,
        image : image_emp_name,


    });
    var img = imageFile.split(".")
    if(req.body.fname.toUpperCase() === img[0]){
        console.log(req.body.fname.toUpperCase() , img[0])
    blog.save((err,doc)=>{
        if (err) throw err;
    });
    alert("DATA UPLODED SUCCESSFULLY")
    res.redirect("http://localhost:8080/getDataForWorker");
    }
    else{
        console.log(req.body.fname.toUpperCase() , img)
        alert("Name of the file is not same as first name")
        res.redirect("http://localhost:8080/addworker");

    }
}
})
})

app.post('/add_newAdmindata',(req,res)=>{
    AdminModel.find({Admin : req.body.Admin}, (err,data)=>{
        if(data.length > 0){
            alert("Admin is already present");
            res.redirect('http://localhost:8080/add_Admin#');
        }else{
            var new_admin = new AdminModel({
                Admin :  req.body.Admin,
                Pass : req.body.Pass
            })
            new_admin.save((err,doc)=>{
                if (err) throw err;
            });
            alert("ADMIN ADDED SUCCESSFULLY")
            res.redirect('http://localhost:8080/Admin');
        }
    }
)

})



app.post('/Adminpost',async(req, res)=>{
    // try{
    // const hashedpass = await bcrypt.hash(req.body.Password,10)
    // const user = {Admin: req.body.Admin, Pass: hashedpass}
    // users.push(user)
    // console.log(users)
    // res.status(201).send()
    // }catch{
    //     res.send(500).send()
    // }
    // console.log(users)
    AdminModel.find({ $and :[{Admin: req.body.Admin},{ Pass: req.body.Pass}]},(err,data)=>{
        if(data.length > 0){
            res.redirect("http://localhost:8080/Admin_Home");

            // res.redirect("http://localhost:8080/getAttendanceDataForAdmin");

        }
        if(data.length == 0){
            alert("Invalid Credentials")
            res.redirect("http://localhost:8080/Admin");

        }
      
    })
    // AdminModel.find({Admin: req.body.Admin},(err,data)=>{
    //     if(data.length > 0){
    //         console.log(data)
    //     }
    // })
   

})




app.get("/seedetail/:empID",(req,res)=>{
    empID_data = req.params.empID
    wallpapermodel.find({empID : empID_data}, (err,data)=>{
        res.render('see_detail',{
            dataList : data
        })
    })
})


app.get("/search_by_dep",(req,res)=>{
    wallpapermodel.find({},(err,data)=>{
        if (err) throw err
        res.render('search_by_dep',{
            dataList:data
        })
    })
})

app.get('/prac/:empID', (req, res)=>{
    console.log(req.body)
    empID_data = req.params.empID
    wallpapermodel.find({empID : empID_data}, (err,data)=>{
        res.render('practice',{
            dataList : data
        })
    })
});


app.post("/update_tablettendance",(req,res)=>{
    console.log(req.body);
    empID_data = req.body.empID;  
    console.log(req.body)
    var myquery = { empID: empID_data };
    var newvalues = { $set: {phone: req.body.phone, Department: req.body.Department, experience: req.body.experience,bond_for_days:req.body.bond_for_days}};
   
    wallpapermodel.updateMany(myquery, newvalues, function(err, res) {
        if (err) throw err;
        alert("DATA UPDATED SUCCESSFULLY")
        console.log("1 document updated");
      });
      res.redirect("http://localhost:8080/update_table")

})



app.get("/update/:empID",(req,res)=>{
    empID_data = req.params.empID
    wallpapermodel.find({empID : empID_data}, (err,data)=>{
        res.render('update_form',{
            dataList : data
        })
    })
})

app.get("/delete/:fname",(req,res)=>{
    email_find = req.params.fname;

    console.log(email_find)
    wallpapermodel.deleteOne({fname : email_find}, (err,data)=>{
        if (err) throw err
        alert("DATA DElETED SUCCESSFULLY")
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

app.get("/update_table",  (req,res)=>{
  
    wallpapermodel.find({}, (err,data)=>{
        res.render('update_table',{
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




app.get("/punch_out_time/:name",(req,res)=>{

    EmailID = req.params.name
    console.log("update it")
    let date_time = new Date(ts);

    let hours = date_time.getHours();

    // current minutes
    let minutes = date_time.getMinutes();

    let time = hours+":"+minutes
    var time_add = ''
    var store_index_of_date= 0
    wallpapermodel.find({empID:EmailID}, (err,data)=>{
        if(err) throw err;
        if(data[0].PunchOut !== null){
            console.log(data[0].Date)
            // dataa = JSON.parse(data)
            let s = data[0].Date
            console.log(s.length)
            var time_str = data[0].Time.split(',');
            var end_time_str = data[0].PunchOut.split(',');
            console.log("start",time_str, time_str.length)
            console.log("endtime",end_time_str, end_time_str.length)
        if(time_str.length > end_time_str.length && time_str.length !== end_time_str.length){
           var str_date = data[0].Date.split(',');
   
           console.log(str_date,time_str)
           time_add = data[0].PunchOut +","+ time
           console.log("timeadd",time_add)
           var myquery = { empID: EmailID };
           var newvalues = { $set: {PunchOut: time_add}, $inc: {Attendance:1}};
          
           wallpapermodel.updateOne(myquery, newvalues, function(err, res) {
               if (err) throw err;
               console.log("1 document updated");
              
             });

        }
        else
           {
           
            alert('Punch Out already taken')
            console.log("Attendance already taken")
            res.redirect('http://localhost:8080/getAttendanceData')
           }
        
    }else{
        var myquery = { empID: EmailID };
        var newvalues = { $set: {PunchOut: time}, $inc: {Attendance:1}};
        console.log("time",time)

        wallpapermodel.updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");

            });
            res.redirect("http://localhost:8080/getAttendanceData")

    }

           
           
        
           
        
    
    
})

})









app.get("/update_it/:name",(req,res)=>{
    EmailID = req.params.name
    console.log("update it")
    let date_time = new Date(ts);
    let datee = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();
    let date =  year +"-"+month+"-"+datee
        // current hours
    let hours = date_time.getHours();

    // current minutes
    let minutes = date_time.getMinutes();

    let time = hours+":"+minutes
    console.log(date)
    var date_add = ''
    var time_add = ''
    wallpapermodel.find({empID:EmailID}, (err,data)=>{
        if (err) throw err
        // console.log(data,"data")
        // console.log(data[0].Time,"Time")
        if(err) throw err;
        if(data[0].Time !== null){
            console.log(data[0].Date)
            // dataa = JSON.parse(data)
            let s = data[0].Date
            console.log(s.length)
        if(data[0].Date !== null){
           var str_date = data[0].Date.split(',');
           var time_str = data[0].Time.split(',')
           console.log(str_date,time_str)
           if(str_date.includes(date) === true)
           {
            alert('Attendance already taken')
            console.log("Attendance already taken")
            res.redirect('http://localhost:8080/getAttendanceData')
           }
           else{
            date_add = data[0].Date+","+date
            time_add = data[0].Time+','+time
            var myquery = { empID: EmailID };
            var newvalues = { $set: {Date:date_add,Time: time_add}};
           
            wallpapermodel.update(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                var newvalues = { $inc: {Attendance:1}};
           
            
               
              });

          
              res.redirect("http://localhost:8080/getAttendanceData")

           }
        }else{
            var myquery = { empID: EmailID };
            var newvalues = { $set: {Date:date}};
           
            wallpapermodel.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
                res.redirect("http://localhost:8080/getAttendanceData")

              });
           }
           
        }else{
            var myquery = { empID: EmailID };
            var newvalues = { $set: {Time:time,Date:date}};
           
            wallpapermodel.updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");

              });
              res.redirect("http://localhost:8080/getAttendanceData")

        }
    })
    
})


app.post("/updated_data_post",(req,res)=>{
    empID_data = "P-RS1996"   
    console.log(req.body)
    var myquery = { empID: empID_data };
    var newvalues = { $set: {phone: req.body.phone, Department: req.body.Department, experience: req.body.experience,bond_for_days:req.body.bond_for_days}};
   
    wallpapermodel.updateMany(myquery, newvalues, function(err, res) {
        if (err) throw err;
        alert("DATA UPDATED SUCCESSFULLY")
        console.log("1 document updated");
      });
      res.redirect("http://localhost:8080/update_table")

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

app.get("/puchout", async(req, res)=>{
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
            const py = spawn('python',['puchoutcode.py','ujjwal'])
    
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
            const py = spawn('python',['puchoutcode.py','ujjwal'])
    
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


app.get("/attendance_data",(req,res)=>{
    wallpapermodel.find({},(err,data)=>{
        if (err) throw err
        else{
            res.render('attendance_details_admin',{ 
                dataList : data
            })
        }

    })
})





const port = process.env.PORT || 8080;

app.listen(port, console.log(`Listening on port ${port}..`));