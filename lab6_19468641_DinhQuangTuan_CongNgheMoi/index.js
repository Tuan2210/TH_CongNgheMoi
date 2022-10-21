//npm -v
//npm init -y
//npm i express nodemon ejs aws-sdk multer
//Thêm lệnh start trong script của package.json: "start": "nodemon index.js",
//npm run start
//Tại thư mục gốc của project, tạo folder views => tạo file index.ejs, index.css

////
const express = require('express')
const app = express()
const port = 3000

const { v4: uuid } = require("uuid");

app.use(express.json({ extended: false }))
app.use(express.static('./views'))
app.set('view engine', 'ejs')
app.set('views', './views')

app.listen(port, () => {
    console.log('sv is running on port 3000');
})

// config aws dynamodb
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA3C6VMUGKWMT7G6UW',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
})
AWS.config = config

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'NhaBao';
const multer = require('multer');
// const { S3 } = require('aws-sdk');
s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const path = require('path');

//data img s3
const storage = multer.memoryStorage({
    destination(req, file, callback) {
        callback(null, '');
    },
})

function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;

    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const minetype = fileTypes.test(file.mimetype);
    if (extname && minetype)
        return cb(null, true);
    return cb('Lỗi: image only');
}
const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, //5mb
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    }
});

//-- Render data --
app.get('/', (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err)
            res.send('Lỗi: ' + err);
        return res.render('index', { nhaBaos: data.Items });
    });
})

// tới page addBaiBao
app.get('/add', (req, res) => {
    const params = { TableName: tableName };
    docClient.scan(params, (err, data) => {
        if (err)
            res.send('Lỗi:' + err)
        return res.render('addBaiBao');
    })
})

//thêm
// const CLOUD_FRONT_URL = 'https://d3rqw08g3229h6.cloudfront.net'; //cũ
const CLOUD_FRONT_URL = "https://upload-s3-img-bucket-tuan6.s3.ap-southeast-1.amazonaws.com"; //mới
// app.post('/', upload.fields([]), (req, res) => {
app.post('/', upload.single('link_url_anh'), (req, res) => {
    const { ma_bao, stt, ten_bao, ten_nhom_tac_gia, chi_so_ISBN, so_trang, nam_xuat_ban } = req.body;
    const link_url_anh = req.file.originalname.split('.');
    console.log(req.file);

    const fileTypes = link_url_anh[link_url_anh.length - 1];

    const filePath = `${uuid() + Date.now().toString()}.${fileTypes}`;

    console.log(req.body);

    const params = {
        Bucket: 'upload-s3-img-bucket-tuan6',
        Key: filePath,
        Body: req.file.buffer
    }

    s3.upload(params, (err, data) => {
        if (err) {
            console.log('Lỗi: ', err);
            return res.send('Lỗi sv');
        } else {
            const newItem = {
                TableName: tableName,
                Item: {
                    ma_bao,
                    stt,
                    ten_bao,
                    ten_nhom_tac_gia,
                    chi_so_ISBN,
                    so_trang,
                    nam_xuat_ban,
                    link_url_anh: `${CLOUD_FRONT_URL}/${filePath}`
                    //sau khi up hình xong thì phải public hình đó trong S3:
                    // - Vô bucket chứa hình đó => chọn hình mới up từ localhost => permissions => edit Access control list (ACL)
                    // - Tích chọn Read trong cột Objects, dòng Everyone (public access)
                    // - Tích chọn I understand the effects...
                },
            }
            docClient.put(newItem, (err, data) => {
                if (err) {
                    console.log('Lỗi: ', err);
                    return res.send('Lỗi sv');
                }
                return res.redirect('/');
            })
        }
    })
})

//xóa
app.post('/del', upload.fields([]), (req, res) => {
    const listItem = Object.keys(req.body);
    if (listItem.length === 0)
        return res.redirect('/');

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma_bao": listItem[index]
            }
        }

        docClient.delete(params, (err, data) => {
            if (err)
                return res.send(err);
            if (index > 0)
                onDeleteItem(index - 1);
            else
                return res.redirect('/');
        })
    }

    onDeleteItem(listItem.length - 1);
})