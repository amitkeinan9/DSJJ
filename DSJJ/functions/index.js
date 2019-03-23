const functions = require('firebase-functions');
const path = require('path');
const os = require('os');
const Jimp = require('jimp')
const qr = require('qr-image')
const fs = require('fs')
const {bucketName} = require("./bucketConfig")
const {Storage} = require('@google-cloud/storage');
const storage = new Storage()

exports.createCard = functions.https.onCall((data, context) => {
  const destBucket = storage.bucket(bucketName) 
    console.log(destBucket.name)
  // get the name of the participant
  const id = data.id;
  const name = data.name;

  // create the QR code with the link
  const QRpath = path.join(os.tmpdir(), 'qr.png')
  qrcode = qr.image('http://localhost:8080/#/participants/' + id, {
    type: 'png',
    size: 1,
    margin: 1
  })
  qrcode.pipe(fs.createWriteStream(QRpath));

  // Set assets
  const cardBasePath = path.join(os.tmpdir(), 'card.jpg');
  const profilePicPath = path.join(os.tmpdir(), 'profile.jpg');
  const fontFntPath = path.join(os.tmpdir(), 'font', 'font.fnt');
  const fontPngPath = path.join(os.tmpdir(), 'font', 'font.png');
  const finalCardPath = path.join(os.tmpdir(), id + '_card.jpg')
  const dir = path.join(os.tmpdir(), "font")
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  return Promise.all([destBucket.file(path.join('assets', 'card.jpg')).download({
    destination: cardBasePath
  }), destBucket.file(path.join('assets', 'font.fnt')).download({
    destination: fontFntPath
  }), destBucket.file(path.join('assets', 'font.png')).download({
    destination: fontPngPath
  }), destBucket.file(path.join("profile_pictures", id)).download({
    destination: profilePicPath
  })]).then(() => {
      console.log("hopa")
    Jimp.read(cardBasePath, (err, card) => {
      if (err) throw err;
      Jimp.read(profilePicPath, (err, profile) => {
        if (err) throw err;
        profile.resize(60, Jimp.AUTO)
        card.composite(profile, 10, 10)
        Jimp.read(QRpath, (err, qrImage) => {
          if (err) throw err;
          card.composite(qrImage, 190, 10)
          Jimp.loadFont(fontFntPath).then(font => {
            card.print(font, 80, 100, {
              text: name.split("").reverse().join(),
              alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
            }, 90);
            card.write(finalCardPath)
            return destBucket.upload(finalCardPath, {
              destination: path.join("cards", id + '_card.jpg')
            })
          }).catch((e) => console.log(e))
        })
      })
    });
  })
});


// exports.onImageUpload = functions.storage.object().onFinalize(e => {
//   if (e.name.startsWith("profile_pictures/")) {
//     console.log(e)
//     const bucket = e.bucket;
//     const destBucket = storage.bucket(bucket) //gcs().bucket(bucket);

//     // get the name of the participant
//     const id = path.basename(e.name).split("_")[0];
//     const name = path.basename(e.name).replace(id + "_", "");

//     // create the QR code with the link
//     const QRpath = path.join(os.tmpdir(), 'qr.png')
//     qrcode = qr.image('http://localhost:8080/#/participants/' + id, {
//       type: 'png',
//       size: 1,
//       margin: 1
//     })
//     qrcode.pipe(fs.createWriteStream(QRpath));

//     // Set assets
//     const cardBasePath = path.join(os.tmpdir(), 'card.jpg');
//     const profilePicPath = path.join(os.tmpdir(), 'profile.jpg');
//     const fontFntPath = path.join(os.tmpdir(), 'font', 'font.fnt');
//     const fontPngPath = path.join(os.tmpdir(), 'font', 'font.png');
//     const finalCardPath = path.join(os.tmpdir(), id + '_card.jpg')
//     const dir = path.join(os.tmpdir(), "font")
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }

//     return Promise.all([destBucket.file('card.jpg').download({
//       destination: cardBasePath
//     }), destBucket.file('font.fnt').download({
//       destination: fontFntPath
//     }), destBucket.file('font.png').download({
//       destination: fontPngPath
//     }), destBucket.file(e.name).download({
//       destination: profilePicPath
//     })]).then(() => {
//       Jimp.read(cardBasePath, (err, card) => {
//         if (err) throw err;
//         Jimp.read(profilePicPath, (err, profile) => {
//           if (err) throw err;
//           profile.resize(60, Jimp.AUTO)
//           card.composite(profile, 10, 10)
//           Jimp.read(QRpath, (err, qrImage) => {
//             if (err) throw err;
//             card.composite(qrImage, 190, 10)
//             Jimp.loadFont(fontFntPath).then(font => {
//               card.print(font, 80, 100, {
//                 text: name.split("").reverse().join(),
//                 alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
//               }, 90);
//               card.write(finalCardPath)
//               return destBucket.upload(finalCardPath, {
//                 destination: path.join("cards", id + '_card.jpg')
//               })
//             }).catch((e) => console.log(e))
//           })
//         })
//       });
//     })
//   }
// })
