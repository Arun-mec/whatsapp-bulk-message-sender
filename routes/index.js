var express = require('express');
var router = express.Router();
const { Client, MessageMedia, LocalAuth  } = require('whatsapp-web.js')
const QRCode = require('qrcode');

const client = new Client()
//   {
//   // restartOnAuthFail: true,
//   puppeteer: {
//     headless: true,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--no-first-run',
//       '--no-zygote',
//       '--disable-gpu'
//     ],
//   },
//   authStrategy: new LocalAuth()
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/sendmessage', function(req, res, next) {
  
  client.on('ready', () => {
    console.log('Client is ready!');
    client.sendMessage("919961692453@c.us","Hello")
  });
  client.initialize();
  client.on('qr', qr => {
    QRCode.toDataURL(qr, (err, url)=>{
      res.render("success",{image_url : url})
    } )
  });
});
module.exports = router;