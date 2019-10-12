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
  to: 'dsjj.app@gmail.com',
  subject: 'Card to print'
};

admin.initializeApp()


const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
}

exports.getRoles = functions.https.onCall((data, context) => {
  if (["admin"].indexOf(context.auth.token.role) != -1) {
    // return new Promise((resolve, reject) => {
      return Promise.all(data.emails.map(email => {
        return admin.auth().getUserByEmail(email).then((userRecord) => {
          return {role: userRecord.customClaims.role, email: email};
        })
      }))
      // resolve(roles)
    // })
    
    
  }
});

exports.setRole = functions.https.onCall((data, context) => {
  if (["admin"].indexOf(context.auth.token.role) != -1) {
    return admin.auth().getUserByEmail(data.email).then((userRecord) => {
      console.log(userRecord.toJSON())
      admin.auth().setCustomUserClaims(userRecord.uid, {
        role: data.role
      }).then(() => {
        ok: true
      }).catch((error) => {
        if (error.code == "auth/user-not-found") {
          throw new functions.https.HttpsError(400)

        } else {
          throw new functions.https.HttpsError(400)
        }
      });
    })
  } else {
    throw new functions.https.HttpsError(401)
  }

});

exports.sendEmail = functions.https.onCall((data, context) => {
  let recpipientsRef = admin.firestore().collection("participants");
  let recpipients = [];
  const filters = data.filters;

  console.log("FILTERS: ")
  console.log(filters)

  if (filters.dojo) {
    console.log("Filtering by dojo")
    recpipientsRef = recpipientsRef.where('dojo', '==', filters.dojo)
  }
  if (filters.instructor) {
    console.log("Filtering by instructor")
    recpipientsRef = recpipientsRef.where('instructor', '==', filters.instructor)
  }
  if (filters.rank) {
    console.log("Filtering by rank")
    recpipientsRef = recpipientsRef.where("rank", "==", filters.rank)
  }
  if (filters.minAge) {
    console.log("Filtering by minAge")
    recpipientsRef = recpipientsRef.where("birthdate", '<=', filters.minAge)
  }

  if (filters.maxAge) {
    console.log("Filtering by maxAge")
    recpipientsRef = recpipientsRef.where("birthdate", '>=', filters.maxAge)
  }
  recpipientsRef.get().then(recpipientsList => {
    // console.log(recpipientsList.docs[0].data())
    recpipients = [...new Set(recpipientsList.docs.map(r => r.data().email))]
    console.log("to: " + recpipients)
    let config = {
      from: "dsjj.app@gmail.com <" + data.email.from + ">",
      to: "dsjj.app@gmail.com",
      bcc: recpipients,
      subject: data.email.subject,
      text: data.email.body
    };

    console.log(config)

    return transporter.sendMail(config, (err, i) => {
      if (err) {
        console.log(err)
        throw new functions.https.HttpsError(400)
      } else {
        return {
          ok: true
        }
      }
    })
  })



})

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
  console.log(context.auth)

  if (!context.auth.uid)
    throw new functions.https.HttpsError(401)
  const destBucket = storage.bucket(bucketName)
  console.log(destBucket.name)
  // get the name of the participant
  const id = data.id;
  const name = data.name;
  const rank = data.rank;
  const dojo = data.dojo;
  const inst = data.instructor;
  const font_name = rank > 6 ? "white" : "black";

  if(rank > 0) {
    // create the QR code with the link
    const QRpath = path.join(os.tmpdir(), 'qr.png')
    qrcode = qr.image('https://dsjj-5820a.firebaseapp.com/#/participants/' + id, {
      type: 'png',
      size: 2,
      margin: 1
    })
    qrcode.pipe(fs.createWriteStream(QRpath));

    // Set assets
    const cardBasePath = path.join(os.tmpdir(), 'card.jpg');
    const profilePicPath = path.join(os.tmpdir(), 'profile.jpg');
    const fontFntPath = path.join(os.tmpdir(), 'font', 'font.fnt');
    const fontPngPath = path.join(os.tmpdir(), 'font', font_name + '.png');
    const finalCardPath = path.join(os.tmpdir(), id + '_card.jpg')
    const dir = path.join(os.tmpdir(), "font")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    console.log(fs.readdirSync(path.join(os.tmpdir(), 'font')))

    return Promise.all([destBucket.file(path.join('assets', rank + '.jpg')).download({
      destination: cardBasePath
    }), destBucket.file(path.join('assets', font_name + '.fnt')).download({
      destination: fontFntPath
    }), destBucket.file(path.join('assets', font_name + '.png')).download({
      destination: fontPngPath
    }), destBucket.file(path.join("profile_pictures", id)).download({
      destination: profilePicPath
    })]).then(() => {
      console.log(fs.readdirSync(path.join(os.tmpdir(), 'font')))
      Jimp.read(cardBasePath, (err, card) => {
        if (err) throw err;
        Jimp.read(profilePicPath, (err, profile) => {
          if (err) throw err;
          profile.resize(120, Jimp.AUTO)
          card.composite(profile, 310, 140)
          Jimp.read(QRpath, (err, qrImage) => {
            if (err) throw err;
            card.composite(qrImage, 30, 210)
            console.log("here")
            console.log(fontFntPath)
            Jimp.loadFont(fontFntPath).then(font => {
              console.log("inside")
              card.print(font, 160, 170, {
                text: name.split("").reverse().join(""),
                alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
              }, 120);
              card.print(font, 160, 225, {
                text: (dojo + "/ ").split("").reverse().join(""),
                alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
              }, 120);
              card.print(font, 160, 250, {
                text: inst.split("").reverse().join(""),
                alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
              }, 120);
              card.write(finalCardPath)
              mailOptions.attachments = [{
                filename: id + ".png",
                path: finalCardPath
              }]
              mailOptions.cc = context.auth.token.email;
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log("err in mail " + error)
                  return "Fail"
                } else {
                  return "Success"
                }
              });
            }).catch((err) => console.log(err))
          })
        })
      });
    })
  }
});
