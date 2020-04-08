const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
// const catchAsync = require("./catchAsync");

//new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Jesus is inviting you <no-reply@gmail.com>`;
    // this.from = `Jesus is inviting you <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //Sendgrid
      return nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
          //In gmail account you will need to activate feature called the less secure app option.
        }
        // return nodemailer.createTransport({
        //   service: "SendGrid",
        //   auth: {
        //     user: process.env.SENDGRID_USERNAME,
        //     pass: process.env.SENDGRID_PASSWORD
        //   }
      })
    }

    return nodemailer.createTransport({
      host: "smtp.mailtrap.io", //EMAIL_HOST
      port: 2525, //EMAIL_PORT
      auth: {
        user: "4a4c0d84df1d93", //EMAIL_USERNAME
        pass: "2ec6a45b756a71" //EMAIL_PASSWORD
      }
    });
  }


  async send(template, subject) {
    //Send the actual email
    //1. Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    //3. Create a transport and send email
    await this.newTransport().sendMail(mailOptions);

  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the God's family!");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your password rest token (valid for only 10 minutes)");
  }
}






// const sendEmail = async options => {
//   //1. Create a transporter  // a service that will send the email
//   var transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "4a4c0d84df1d93",
//       pass: "2ec6a45b756a71"
//     }
//   });
// var transporter = nodemailer.createTransport({
//     // service: "Gmail",
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//         //In gmail account you will need to activate feature called the less secure app option.
//     }
// });
//2. Define the email options
// const mailOptions = {
//   from: "Jesus is inviting you",
//   to: options.email,
//   subject: options.subject,
//   text: options.message
//   // html: 
// };

//3. Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;


// var transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//         user: "4a4c0d84df1d93",
//         pass: "2ec6a45b756a71"
//     }
// });