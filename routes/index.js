var express = require('express');
var router = express.Router();
const { Client, MessageMedia, LocalAuth  } = require('whatsapp-web.js')
const QRCode = require('qrcode');
const csvToJson = require('convert-csv-to-json');
const fileUpload = require('express-fileupload');
router.use(fileUpload())

const client = new Client({

  // restartOnAuthFail: true,
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
  // authStrategy: new LocalAuth()
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/getqrcode', function(req, res, next) {
  let medMsg = req.files.img;
  let num_csv = req.files.nums;
  let msg = req.body.msg;
  // moving the images to public folder to access it later
  medMsg.mv('./public/images/'+'medMsg.jpg', function(err) {
    if (err)
      return res.send(err);
  });
  num_csv.mv('./public/csvs/'+'nums.csv', function(err) {
    if (err)
      return res.send(err);
  });

  
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url)=>{
      res.render("success",{image_url : url})
    } )
  });
  
  client.on('ready', () => {
    console.log('Client is ready!');
    const med_msg = MessageMedia.fromFilePath('./public/images/'+'medMsg.jpg')
    const nums =  csvToJson.fieldDelimiter(',',' ').getJsonFromCsv('./public/csvs/'+'nums.csv');
    nums.forEach((obj)=>{
      const num_id = obj.Number.substring(1)+"@c.us";
      if (num_id.length > 10){
          client.sendMessage(num_id,msg)
          client.sendMessage(num_id,med_msg)
          // console.log("Done")
      }else{
          console.log(obj.Number + " This is not a registered number");
        }
    })
  });
  client.initialize();
  
});
module.exports = router;