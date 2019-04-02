const functions = require('firebase-functions');
const path = require('path');
const os = require('os');
const Jimp = require('jimp')
const qr = require('qr-image')
const fs = require('fs')
const {
  bucketName
} = require("./bucketConfig")
const {
  Storage
} = require('@google-cloud/storage');
const storage = new Storage()
const nodemailer = require('nodemailer')
const admin = require('firebase-admin');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dsjj.app@gmail.com',
    pass: '5AhaUDXnxw'
  }
});

var mailOptions = {
  from: 'dsjj.app@gmail.com',
  to: 'amitkeinan9@gmail.com',
  subject: 'Card to print'
};

admin.initializeApp()


const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
}

exports.createUser = functions.https.onCall((data, context) => {
  if (["super-instructor", "admin"].indexOf(context.auth.token.role) != -1) {
    admin.auth().createUser({
        email: data.email,
        password: generatePassword(),
        displayName: data.fullName,
      })
      .then(function (userRecord) {
        admin.auth().setCustomUserClaims(userRecord.uid, {
          role: 'instructor'
        }).then(() => {
          admin.auth().generatePasswordResetLink(data.email).then(link => {
            let mailOpts = {
              from: 'dsjj.app@gmail.com',
              to: userRecord.email,
              subject: "ברוך הבא!",
              html: `<p>שלום ` + data.fullName + `,</p>
          <p>נרשמת על ידי מאמן אחר בתור מאמן בשיטה.</p>
          <p>כדי לאמת את כתובת האימייל, עליך להיכנס ל<a href='` + link + `'>קישור</a> הזה.</p>
          <p>תודה,</p>
          <p>צוות דניס הישרדות</p>`
            }

            console.log(mailOpts)

            transporter.sendMail(mailOpts, (err, i) => {
              if (err)
                throw new functions.https.HttpsError(500)
              else {
                return "200"
              }
            })

          })
        })
      })
      .catch(function (error) {
        throw new functions.https.HttpsError(500)
      });
  } else {
    throw new functions.https.HttpsError(401)
  }
})

exports.createCard = functions.https.onCall((data, context) => {
  if (!context.auth.uid)
    throw new functions.https.HttpsError(401)
  const destBucket = storage.bucket(bucketName)
  console.log(destBucket.name)
  // get the name of the participant
  const id = data.id;
  const name = data.name;

  // create the QR code with the link
  const QRpath = path.join(os.tmpdir(), 'qr.png')
  qrcode = qr.image('https://dsjj-5820a.firebaseapp.com/#/participants/' + id, {
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
            mailOptions.attachments = [{
              filename: id + ".png",
              path: finalCardPath
            }]
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return "Fail"
              } else {
                return "Success"
              }
            });
          }).catch(() => "Fail")
        })
      })
    });
  })
});
