var express = require('express');
var router = express.Router();
const { Client, MessageMedia, LocalAuth  } = require('whatsapp-web.js')
const QRCode = require('qrcode');
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
  let nums = req.files.nums;
  let msg = req.body.msg;
  // moving the images to public folder to access it later
  medMsg.mv('./public/images/'+'medMsg.jpg', function(err) {
    if (err)
      return res.send(err);
  });

  console.log(msg);
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url)=>{
      res.render("success",{image_url : url})
    } )
  });

  num_set = ['9961692453','7356469164']
  client.on('ready', () => {
    console.log('Client is ready!');
    
    const med_msg = MessageMedia.fromFilePath('./public/images/'+'medMsg.jpg')
    num_set.forEach((obj)=>{
      const num_id = '91'+obj+"@c.us"
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