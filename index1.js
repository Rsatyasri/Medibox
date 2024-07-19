


const express = require('express');
const app = express();
const passwordHash = require('password-hash');
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/" + "j.html");
});

app.post("/signupSubmit", function (req, res) {
  db.collection("usersDemo")
    .where("email", "==", req.body.email)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        res.send("Sorry, this account already exists with email or username.");
      } else {
        db.collection("usersDemo")
          .add({
            userName: req.body.username,
            email: req.body.email,
            password: passwordHash.generate(req.body.password),
          })
          .then(() => {
            res.sendFile(__dirname + "/public/" + "aa.html");
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
            res.send("Something went wrong");
          });
      }
    });
});

app.post("/loginSubmit", function (req, res) {
  db.collection("usersDemo")
    .where("userName", "==", req.body.username)
    .get()
    .then((snapshot) => {
      let verified = false;
      snapshot.forEach((doc) => {
        if (passwordHash.verify(req.body.password, doc.data().password)) {
          verified = true;
        }
      });

      if (verified) {
        res.render("home");
      } else {
        res.send("Fail");
      }
    });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
