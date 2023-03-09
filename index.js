let express= require('express');
let fs = require('fs');
let path = require('path')
let multer = require('multer')
let mongoose = require('mongoose')
let methodOverride = require('method-override')
let app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(methodOverride('_method'))

mongoose.connect(process.env.MONGO_URI)
// let myschema = mongoose.Schema({
//         Picture : {
//             type:String
//         }
//     })
// let mymodel = mongoose.model('table', myschema)
const mymodel = require("./model/model")

//Storage Setting
let storage = multer.diskStorage({
    destination:'./public/upload', //directory (folder) setting
    filename:(req, file, cb)=>{
        var name= file.originalname
        var fileExtensiion = name.split(".")[1]
        // console.log(fileExtensiion)
        cb(null,Date.now()+"."+ fileExtensiion) // file name setting
        
    }
})

// //Upload Setting
// let upload = multer({
//    storage: storage,
//    fileFilter:(req, file, cb)=>{
//     if(
//         file.mimetype == 'application/png'||
//         file.mimetype == 'application/jpeg'

//     ){
//         cb(null, true)
//     }
//     else{
//         cb(null, false);
//         cb(new Error('Only image file allow'))
//     }
//    }
// })

// //Upload Setting
// let upload = multer({
//     storage: storage,
//     fileFilter:(req, file, cb)=>{
//      if(
//          file.mimetype == 'image/jpeg' ||
//          file.mimetype == 'image/jpg' ||
//          file.mimetype == 'image/png' ||
//          file.mimetype == 'image/gif'
 
//      ){
//          cb(null, true)
//      }
//      else{
//          cb(null, false);
//          cb(new Error('Only jpeg,  jpg , png, and gif Image allow'))
//      }
//     }
//  })

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => { // setting destination of uploading files        
//       if (file.fieldname === "resume") { // if uploading resume
//         cb(null, 'resumes');
//       } else { // else uploading image
//         cb(null, 'images');
//       }
//     },
//     filename: (req, file, cb) => { // naming file
//       cb(null, file.fieldname+"-"+uuidv4()+path.extname(file.originalname));
//     }
//   });
  
//   const fileFilter = (req, file, cb) => {
//     if (file.fieldname === "folder") { // if uploading resume
//       if (
//         file.mimetype === 'application/zip'
//       ) { // check file type to be pdf, doc, or docx
//         cb(null, true);
//       } else {
//         cb(null, false); // else fails
//       }
//     } else { // else uploading image
//       if (
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'image/jpg' ||
//         file.mimetype === 'image/jpeg'
//       ) { // check file type to be png, jpeg, or jpg
//         cb(null, true);
//       } else {
//         cb(null, false); // else fails
//       }
//     }
//   };




const upload = multer({ storage: storage });




//SINGALE IMAGE UPLODING
app.post('/singlepost', upload.fields([{name:'image',maxCount:1},{name:'folder',maxCount:1}]), (req, res)=>{
    req.files
    console.log(req.files)
    mymodel.create({Picture:req.files.image.filename,
        Path:`images/${req.files.image.path}`,
        Folder:req.files.folder.filename,
        folderPath:`images/${req.files.folder.path}`,
        title:req.body.title,
        desc:req.body.desc
    })
    if(!req.files){
        return console.log('You have not Select file on Your Computer')
    }
    mymodel.findOne({Picture:`${req.files.image} + ${Date.now()}`})
    .then((a)=>{
        if(a){
            console.log("Your Image Dulicate, Please Try anoter Images")
        }
        else{

         console.log({Sucess:req.files})
            mymodel.create({Picture:req.files.image.filename,
                Path:`images/${req.files.image.path}`,
                Folder:req.files.folder.filename,
                folderPath:`images/${req.files.folder.path}`,
                title:req.body.title,
                desc:req.body.desc
            })
            .then((x)=>{
                
                res.status(200).send({Succes:req.files})
            })
                // .then((x)=>{
                //     res.redirect('/view')

                // })
                .catch((y)=>{
                    console.log(y)
                })
        }
    })
                
    
    //res.send(req.file.filename)
})

// //SINGALE FOLDER UPLODING
// app.post('/singlepost', upload.single('folder'), (req, res)=>{
//     req.file
//     if(!req.file){
//         return console.log('You have not Select any Image, Please Select any Image on Your Computer')
//     }
//     mymodel.findOne({Folder:`${req.file.filename} + ${Date.now()}`})
//     .then((a)=>{
//         if(a){
//             console.log("Your Image Dulicate, Please Try anoter Images")
//         }
//         else{
//             mymodel.create({Folder:req.file.filename,
//                 folderPath:`images/${req.file.filename}`
//             })
//             .then((x)=>{
                
//                 res.status(200).send({Succes:"Success"})
//             })
//                 // .then((x)=>{
//                 //     res.redirect('/view')

//                 // })
//                 .catch((y)=>{
//                     console.log(y)
//                 })
//         }
//     })
                
    
//     //res.send(req.file.filename)
// })

//mULTIPLE IMAGE UPLODING
app.post('/multiplepost', upload.array('multiple_input', 3), (req, res)=>{

 
    if(!req.files){
        return console.log('You have not Select any Image, Please Select any Image on Your Computer')
    }
    
    req.files.forEach((singale_image)=>{
        
        mymodel.findOne({Picture: singale_image.filename})
        .then((a)=>{
            if(a){
                console.log("Your Image Dulicate, Please Try anoter Images")
            }
            else{
                mymodel.create({Picture: `${singale_image.filename}+ ${Date.now()}`})
                .then((x)=>{
                    res.redirect('/view')
                })
                .catch((y)=>{
                    console.log(y)
                })
            }
        })
        .catch((b)=>{
            console.log(b)
        })

                


    })
})

app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/edit/:id', (req, res)=>{
    let readquery ={_id:req.params.id};
    //console.log(readquery)
    res.render('edit-file', {readquery})
})

app.put('/edit/:id',upload.single('single_input'), (req, res)=>{
   

    mymodel.updateOne({_id:req.params.id}, {
        Picture : req.file.filename
    })
    .then((x)=>{
        res.redirect('/view')
    })
    .catch((y)=>{
        console.log(y)
    })
})


app.delete('/delete/:id', (req, res)=>{
    let curretn_img_url = (__dirname+'/public/images/'+req.params.id);
   //console.log(curretn_img_url)
   fs.unlinkSync(curretn_img_url)
    mymodel.deleteOne({Picture:req.params.id})
    .then(()=>{
        res.redirect('/view')
    })
    .catch((y)=>{
        console.log(y)
    })
})

app.get('/view', (req, res)=>{
    mymodel.find({})
    .then((x)=>{
        // console.log(x)
        res.status(200).send(x)
        // res.render('privew', {x}) // Using for return with inbuild css and html

        //console.log(x)
    })
    .catch((y)=>{
        console.log(y)
    })

    
})

app.listen(3000, ()=>{
    console.log('3000 Port Working')
})