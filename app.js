const express = require("express");
const app = express();
// for the profile part
const profile=require("./profile.js")
const authentication=require("./authenticationB.js")
const mongodb=require("./mongodbConnection.js")
const session=require("express-session")
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// for monogodb connection
mongodb();

// for the express session
app.use(
  session({
    secret: "d888c1dd6e2794aa5b3462cea9db1632c79eea4ea51d0025a94b85345161d0e8729e892a00ebd3d9c41c9cc7c6255b5a54217da303ffd92afd39eb33d241b7c4",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true if using HTTPS
  })
);



// FOR PROFILE ROUTING
app.use("/profile",profile)
// FOR AUTHENTICATION
app.use("/authentication",authentication)



app.get("/", (req, res) => {
  if(req.session.username&&req.session.password){
    res.render("index")
  }
  else{
    res.render("authenticationLogin")
    // res.render('index')
  }
});

app.listen(port, (req, res) => {
  console.log(`Server running at http://:${port}`);
});
