var express = require('express');
var router = express.Router();
var fs = require('fs');
const { Client, MessageMedia, LocalAuth  } = require('whatsapp-web.js')
const QRCode = require('qrcode');
const csvToJson = require('convert-csv-to-json');
const fileUpload = require('express-fileupload');

router.use(fileUpload())

// Opening the browser window using puppeteer
const client = new Client({
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// form submission process, a qr code will be generated and that has to ber scanned to login to the whatsapp
router.post('/getqrcodewithimg', function(req, res, next) {
  
  let num_csv = req.files.nums;
  let medMsg = req.files.img;
  let msg = req.body.msg;

  // moving the images to public folder to access it later
  medMsg.mv('./public/images/'+'medMsg.jpg', function(err) {
    if (err)
      return res.send(err);
  });
  // moving the csv file to the pblic folder to acces it later
  num_csv.mv('./public/csvs/'+'nums.csv', function(err) {
    if (err)
      return res.send(err);
  });

  // QRCode is converted to image format.
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url)=>{
      res.render("success",{image_url : url})
    } )
  });
  
  // messages will be sent from here.
  client.on('ready',() => {
    console.log('Client is ready!');
    const med_msg = MessageMedia.fromFilePath('./public/images/'+'medMsg.jpg')
    const nums =  csvToJson.fieldDelimiter(',',' ').getJsonFromCsv('./public/csvs/'+'nums.csv');
    nums.forEach( async (obj)=>{
      const num_id = obj.Number.substring(1)+"@c.us";

      if (num_id.length > 10 ){
          await client.sendMessage(num_id,med_msg) 
          await client.sendMessage(num_id,msg)// media message will be sent first 
           // text messages will be sent later
          // console.log("Done")
      }
    })
  });

  // initialising the client object
  client.initialize();
  fs.unlink('./public/images/medMsg.jpg', (err) => {
    if (err) {
      console.error(err)
      return
    }})
  fs.unlink('./public/csvs/nums.csv', (err) => {
    if (err) {
      console.error(err)
      return
    }})
  
});

// send text messages

router.post('/getqrcode', function(req, res, next) {
  
  let num_csv = req.files.nums;
  let msg = req.body.msg;

  // moving the csv file to the pblic folder to acces it later
  num_csv.mv('./public/csvs/'+'nums.csv', function(err) {
    if (err)
      return res.send(err);
  });

  // QRCode is converted to image format.
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url)=>{
      res.render("success",{image_url : url})
    } )
  });
  
  // messages will be sent from here.
  client.on('ready',() => {
    console.log('Client is ready!');
    const nums =  csvToJson.fieldDelimiter(',',' ').getJsonFromCsv('./public/csvs/'+'nums.csv');
    nums.forEach( async (obj)=>{
      const num_id = obj.Number.substring(1)+"@c.us";

      if (num_id.length > 10 ){ 
          client.sendMessage(num_id,msg)// media message will be sent first 
           // text messages will be sent later
          // console.log("Done")
      }
    })
  });

  // initialising the client object
  client.initialize();
  fs.unlink('./public/csvs/nums.csv', (err) => {
    if (err) {
      console.error(err)
      return
    }})
  
});
module.exports = router;