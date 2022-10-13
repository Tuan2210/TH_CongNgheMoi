//npm -v, cài node, cài extension Bootstrap 4 Ultimate Snippets Pack
//npm init -y
//npm i express nodemon ejs aws-sdk multer
//Thêm lệnh start trong script của package.json: "start": "nodemon index.js",
//npm run start
//Tại thư mục gốc của project, tạo folder views => tạo file index.ejs, index.css

////
const express = require('express')
const app = express()
const port = 3000


app.use(express.json({ extended: false }))
app.use(express.static('./views'))
app.set('view engine', 'ejs')
app.set('views', './views')

app.listen(port, () => {
    console.log('sv is running on port 3000');
})

// test run port sv
// app.get("/", (req, res) => {
//   res.send('Hello World!')
// //   return res.render("index"); //index.ejs
// });

// config aws dynamodb
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA3C6VMUGK52QC7WMV',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
})
AWS.config = config

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'NhaBao';
const multer = require('multer');
const upload = multer();

//-- Render data --
app.get('/home', (req, res) => {
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
    // const params = { TableName: tableName };
    // docClient.scan(params, (err, data) => {
    //     if (err)
    //         res.send('Lỗi:' + err)
        return res.render('addBaiBao');
    // })
})

//thêm
app.post('/', upload.fields([]), (req, res) => {
    const { ma_bao, stt, ten_bao, ten_nhom_tac_gia, chi_so_ISBN, so_trang, nam_xuat_ban, link_url_anh } = req.body;
    console.log(req.body);

    const params = {
      TableName: tableName,
      Item: {
        "ma_bao": ma_bao,
        "stt": stt,
        "ten_bao": ten_bao,
        "ten_nhom_tac_gia": ten_nhom_tac_gia,
        "chi_so_ISBN": chi_so_ISBN,
        "so_trang": so_trang,
        "nam_xuat_ban": nam_xuat_ban,
        "link_url_anh": link_url_anh,
      },
    };

    docClient.put(params, (err, data) => {
        if (err)
            return res.send('Lỗi: ' + err);
        return res.redirect('/home');
    })
})

//xóa
app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);
    console.log(listItems)
    if (listItems.length === 0)
        return res.redirect('/home');

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma_bao": listItems[index]
            }
        }

        docClient.delete(params, (err, data) => {
            if (err)
                return res.send('Lỗi: ' +err);
            else {
                if (index > 0)
                    onDeleteItem(index - 1);
                else
                    return res.redirect('/home');
            }
        })
    }

    onDeleteItem(listItems.length - 1);
})