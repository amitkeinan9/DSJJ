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

admin.initializeApp({
  credential: admin.credential.cert(require('./admin.json')),
  databaseURL: "https://dsjj-5820a.firebaseio.com"
})


const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
}

const rankText = (rank) => {
  const nameParts = rank.name.split(" ")
  if (nameParts.length < 2)
    return rank.name;

  const name = nameParts[0] + " " + nameParts[1].split("").reverse().join("")
 
  if (rank.rank < 12)
    return name;
  if (rank.rank < 15)
    return name  + " מאסטר ";
  return name  + " גראנד מאסטר ";
} 

exports.getRoles = functions.https.onCall((data, context) => {
  if (["admin"].indexOf(context.auth.token.role) != -1) {
      return Promise.all(data.emails.map(email => {
        return admin.auth().getUserByEmail(email).then((userRecord) => {
          
          return {role: userRecord.customClaims.role, email: email};
        })
      }))
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
      to: context.auth.token.email,
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
  }).catch((e) => {
    console.error("ERROR")
    console.log(e)
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
  if (!context.auth.uid)
    throw new functions.https.HttpsError(401)
  const destBucket = storage.bucket(bucketName)

  // get the name of the participant
  const id = data.id;
  const name = data.name;
  const rank = data.rank.rank;
  const dojo = data.dojo;
  const inst = data.instructor;

  if(rank > 0) {
    // create the QR code with the link
    const QRpath = path.join(os.tmpdir(), 'qr.png')
    qrcode = qr.image('https://dsjj.org/#/participants/' + id, {
      type: 'png',
      size: 2,
      margin: 1
    })
    qrcode.pipe(fs.createWriteStream(QRpath));

    // Set assets
    const beltPath = path.join(os.tmpdir(), 'belt.jpg');
    const backBasePath = path.join(os.tmpdir(), 'back.jpg');
    const logoPath = path.join(os.tmpdir(), 'logo.jpg');
    const profilePicPath = path.join(os.tmpdir(), 'profile.jpg');
    const nameFontFntPath = path.join(os.tmpdir(), 'name', 'font.fnt');
    const nameFontPngPath = path.join(os.tmpdir(), 'name', 'font.png');
    const boldFontFntPath = path.join(os.tmpdir(), 'bold', 'font.fnt');
    const boldFontPngPath = path.join(os.tmpdir(), 'bold', 'font.png');
    const regFontFntPath = path.join(os.tmpdir(), 'reg', 'font.fnt');
    const regFontPngPath = path.join(os.tmpdir(), 'reg', 'font.png');
    const finalCardPath = path.join(os.tmpdir(), id + '_front_card.jpg');
    const finalBackCardPath = path.join(os.tmpdir(), id + '_back_card.jpg');
    
    if (!fs.existsSync(path.join(os.tmpdir(), "name"))) {
      fs.mkdirSync(path.join(os.tmpdir(), "name"));
    }
    if (!fs.existsSync(path.join(os.tmpdir(), "bold"))) {
      fs.mkdirSync(path.join(os.tmpdir(), "bold"));
    }
    if (!fs.existsSync(path.join(os.tmpdir(), "reg"))) {
      fs.mkdirSync(path.join(os.tmpdir(), "reg"));
    }

    return Promise.all([
      destBucket.file(path.join('assets_new', "belts-" + rank.toString().padStart(2, '0') + '.png')).download({
        destination: beltPath
      }), 
      destBucket.file(path.join('assets_new', 'logo.png')).download({
        destination: logoPath
      }),
       destBucket.file(path.join('assets_new', 'back.jpeg')).download({
        destination: backBasePath
      }),
      destBucket.file(path.join('assets_new/bold/font.fnt')).download({
        destination: boldFontFntPath
      }), 
      destBucket.file(path.join('assets_new/bold/font.png')).download({
        destination: boldFontPngPath
      }), 
      destBucket.file(path.join('assets_new/reg/font.fnt')).download({
        destination: regFontFntPath
      }), 
      destBucket.file(path.join('assets_new/reg/font.png')).download({
        destination: regFontPngPath
      }), 
      destBucket.file(path.join('assets_new/name/font.fnt')).download({
        destination: nameFontFntPath
      }), 
      destBucket.file(path.join('assets_new/name/font.png')).download({
        destination: nameFontPngPath
      }), 
      destBucket.file(path.join("profile_pictures", id)).download({
        destination: profilePicPath
      })
    ]).then(async () => {
      const [front, profile, belt, logo, nameFont, boldFont, regFont, back, qrImage] = await Promise.all([new Jimp(1009, 639, '#FFFFFF'),
                    Jimp.read(profilePicPath),
                    Jimp.read(beltPath),
                    Jimp.read(logoPath),
                    Jimp.loadFont(nameFontFntPath),
                    Jimp.loadFont(boldFontFntPath),
                    Jimp.loadFont(regFontFntPath),
                    Jimp.read(backBasePath),
                    Jimp.read(QRpath),
                  ]);
      
      profile.resize(Jimp.AUTO, 539).quality(100);

      front.composite(profile, 500 - profile.bitmap.width, 50);
      
      belt.resize(Jimp.AUTO, 539).quality(100);
      front.composite(belt, 500, 50);
      
      logo.resize(190, Jimp.AUTO).quality(100);
      front.composite(logo, 425, -40);

      front.print(nameFont, 550, 100, {
        text: (name).split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 400);

      front.print(boldFont, 700, 350, {
        text: ("מועדון: ").split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);
      front.print(boldFont, 700, 400, {
        text: ("מאמן: ").split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);
      front.print(boldFont, 700, 450, {
        text: ("דרגה: ").split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);

      front.print(regFont, 600, 350, {
        text: (dojo).split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);
      front.print(regFont, 618, 400, {
        text: (inst).split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);
      front.print(regFont, 621, 450, {
        text: (rankText(data.rank)).split("").reverse().join(""),
        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
      }, 250);

     

      front.write(finalCardPath);
      qrImage.resize(151, 151);
      back.composite(qrImage, 55, 461);
      back.write(finalBackCardPath)

      mailOptions.subject = "הנפק כרטיס חניך " + name
      mailOptions.attachments = [{
        filename: id + "Front.png",
        path: finalCardPath
      },
      {
        filename: id + "Back.png",
        path: finalBackCardPath
      }]
      console.log("done all promise")
      mailOptions.cc = context.auth ? context.auth.token.email : "amitkeinan9@gmail.com";
      
      try {
        await transporter.sendMail(mailOptions);
        console.log("email sent");
      } catch (error) {
        console.log(error);
      }
      
    }).catch((e) => console.error(e))
  }
});
