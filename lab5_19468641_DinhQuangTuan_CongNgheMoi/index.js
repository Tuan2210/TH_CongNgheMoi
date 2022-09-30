const express = require('express')
const app = express()
    // const port = 3000

app.use(express.json({ extended: false }))
app.use(express.static('./views'))
app.set('view engine', 'ejs')
app.set('views', './views')

//config aws dynamodb
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA3C6VMUGKRAIYF6ZO',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
})
AWS.config = config

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'SanPham';

app.get('/', (req, res) => {
    // res.send('Hello World!')
    // return res.render('index'); //index.ejs
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if(err)
            res.send('Internal Server Error');
        return res.render('index', {sanPhams: data.Items});
    });
})

app.listen(3000, () => {
    // console.log(`Example app listening on port ${port}`)
    console.log('sv is running on port 3000');
})