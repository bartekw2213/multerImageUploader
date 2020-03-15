const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// Serving static files
app.use(express.static('./public'))

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

// Multer init
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        filterFiles(req, file, cb)
    },
    limits: {
        fileSize: 1000000
    }
}).single('multerImg')

// Function filtering files
function filterFiles(req, file, cb) {
    const allowedExtensions = /jpg|png|jpeg|gif/;
    
    const fileName = allowedExtensions.test(path.extname(file.originalname))
    const mimeType = allowedExtensions.test(file.mimetype)

    fileName && mimeType ? cb(null, true) : cb('Error: File needs to be an image')
}

// Setting EJS
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('index'))

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            res.render('index', { msg: err })
        } else if (req.file === undefined) {
            res.render('index', { msg: 'No file selected' })
        } else {
            res.render('index', { 
                msg: 'File was successfully uploaded',
                src: `/uploads/${req.file.filename}`
            })
        }
    })
})

app.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`))