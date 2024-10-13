const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodoveride = require("method-override");
const mongoose = require("mongoose");
const Users = require("./models/users");
const cron = require("node-cron");
// const fetch = require('node-fetch')

mongoose
  .connect(
    "mongodb+srv://j67506219:TyuZSUjPtMq6Ih6F@cluster0.xnyjepo.mongodb.net/?retryWrites=true&w=majority"
  )
  // .connect("mongodb://127.0.0.1:27017/Newsletter")
  // mongoose.connect(dbUrl)
  .then(() => {
    console.log("CONNECTION OPEN");
  })
  .catch((err) => {
    console.log("oh no error");
    console.log(err);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // this is for parsing the body
app.use(methodoveride("_method")); // using the method override
app.use(express.static(path.join(__dirname, "public"))); // to serve our public file

//   defining the routes

app.get("/", (req, res) => {
  res.render("contact");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/otp", (rq, res) => {
  res.render("otp", { msg: "" }); // you will need to pass msg in get route also
});

// sending mails

let email;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: "j67506219@gmail.com",
    pass: "mqnhgqztvontdmqa",
  },
});

// genrarting a otp

const otp = Math.floor(1000 + Math.random() * 9000); // to always get a 4 digit number
console.log(otp);

// this will be called when a user submits a form and send otp to him

app.post("/send", (req, res) => {
  email = req.body.email;

  // sending mail to the mail id
  const mailOptions = {
    to: req.body.email,
    subject: "Otp for registration is: ",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otp +
      "</h1>",
  };

  // this is for error handling

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    res.render("otp", { msg: "" }); // rendering the otp entering page
  });
});

// this route is resending the otp

app.post("/resend", (req, res) => {
  const mailOptions = {
    to: email,
    subject: "Otp for registration is: ",
    html: `<h3>OTP for account verification is </h3><h1 style='font-weight:bold;'>${otp}</h1>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log(`Message sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    res.render("otp", { msg: "Otp has been resent" });
  });
});

app.get("/verified", (req, res) => {
  res.render("verified");
});

// verifying if the otp submitted by the user is correct

app.post("/verify", async (req, res) => {
  if (req.body.otp == otp) {
    // the otp entered is match with the generated otp

    // saving the email id to our database after verifying it
    const user = new Users({
      email: email,
    });
    await user.save();
    res.render("verified");
  } else {
    res.render("otp", { msg: "OTP is incorrect" });
  }
});

//  // sending Mails to all the users that have registered it

//   const sendEmail = async(to,subject,html)=>{
//     const sendingMails ={
//       form:'j67506219@gmail.com',
//       to:to,
//       subject:subject,
//       html:html
//     }

//   try {
//     const info = await transporter.sendMail(sendingMails);
//     console.log(`Email sent to ${to}: ${info.response}`);
//   } catch (error) {
//     console.error(`Error sending email to ${to}:`, error);
//   }
// };

// // sending mail to every mail

// app.post('/sendtoall', async (req, res) => {
//   const mailSubject = req.body.subject;
//   const mailHtml = req.body.html;

//   try {
//     // Retrieve all email addresses from the database
//     const allEmails = await Users.find({}, 'email');

//     if (allEmails.length === 0) {
//       return res.send('No email addresses found.');
//     }

//     // Send email to each email address
//     allEmails.forEach(emailData => {
//       sendEmail(emailData.email, mailSubject, mailHtml);
//     });

//     return res.send('Emails sent successfully to all addresses.');
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send('An error occurred while sending emails.');
//   }
// });

// *********************** trying to send leetcode question with api

const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
const DAILY_CODING_CHALLENGE_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        title
        content
        difficulty
        acRate
        topicTags {
          name
        }
      }
    }
  }`;

const fetchDailyCodingChallenge = async () => {
  console.log("Fetching daily coding challenge from LeetCode API.");

  try {
    const response = await fetch(LEETCODE_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
    });

    const data = await response.json();
    const challenge = data.data.activeDailyCodingChallengeQuestion;

    const challengeDetails = {
      date: challenge.date,
      link: challenge.link,
      title: challenge.question.title,
      description: challenge.question.content,
      difficulty: challenge.question.difficulty,
      acceptanceRate: challenge.question.acRate,
      topicTags: challenge.question.topicTags.map((tag) => tag.name).join(", "),
    };

    return challengeDetails;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
};

const sendEmail = async (to, subject, html) => {
  const sendingMail = {
    from: "j67506219@gmail.com",
    to: to,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(sendingMail);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

// Your code for setting up the "transporter" variable for sending emails

// Your code for setting up database models and connections

// app.post("/sendtoall", async (req, res) => {
  cron.schedule("0 10 * * *", async (req, res) => {
  const mailSubject = req.body.subject;
  const mailHtml = req.body.html;

  try {
    // Retrieve all email addresses from the database
    const allEmails = await Users.find({}, "email");

    if (allEmails.length === 0) {
      return res.send("No email addresses found.");
    }

    // Fetch daily coding challenge details
    const challengeDetails = await fetchDailyCodingChallenge();

    if (!challengeDetails) {
      return res.status(500).send("Error fetching daily coding challenge.");
    }

    // Send email to each email address
    allEmails.forEach((emailData) => {
      const personalizedHtml = `
      <h4>${challengeDetails.title}</h4>
      <h6><a href="https://leetcode.com${challengeDetails.link}">VISIT</a></h6>
      <h5 style="color: ${
        challengeDetails.difficulty === "Hard"
          ? "#FF2D55"
          : challengeDetails.difficulty === "Medium"
          ? "#FFB800"
          : "#00AF9B"
      }">${challengeDetails.difficulty}</h5>
      <p>Description: ${challengeDetails.description}</p>
      <h6>Related Topics:</h6>
      <p>${challengeDetails.topicTags}</p>
      
      <p>To unsubscribe visit <a href="https://leetcode-yw2q.onrender.com/delete">Unsubscribe</a></p>`;
      const mailSubject = `${challengeDetails.title}`;
      sendEmail(emailData.email, mailSubject, personalizedHtml);
    });

    return res.send("Emails sent successfully to all addresses.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred while sending emails.");
  }
});

// deleting a user when he unsuscribe from the newsletter

app.get("/delete", (req, res) => {
  res.render("delete", { msg: "" });
});

app.delete("/delete", async (req, res) => {
  const { email } = req.body;

  try {
    const deletedEmail = await Users.findOneAndDelete({ email });

    if (deletedEmail) {
      res.render("delete", { msg: `Successfully unsubscribed: ${email}` });
    } else {
      res.render("delete", { msg: `Email ${email} not found.` });
    }
  } catch (error) {
    console.error(error);
    res.render("delete", {
      msg: "An error occurred while processing your request.",
    });
  }
});

app.listen(3000, () => {
  console.log("SERVING YOUR APP");
});
