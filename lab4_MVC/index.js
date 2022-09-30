//npm init -y
//npm i express
//npm i nodemon
//npm i ejs
//Thêm lệnh script trong package.json: "start": "nodemon index.js"
//npm run start

const express = require("express");
const app = express();
// const port = 3000;

app.use(express.json({extends: false}));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get("/", (req, res) => {
//   res.send("Hello World nodemon!");
    return res.render('index'); //index.ejs
});

app.listen(3000, () => {
  //console.log(`Example app listening on port ${port}`);
  console.log(`Example app listening on port 3000`);
});