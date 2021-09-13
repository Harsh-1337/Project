//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb://localhost:27017/studentDB", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://Divyansh_Jain:Divy2000@cluster0.5aalj.mongodb.net/internDB", {useNewUrlParser: true, useUnifiedTopology: true });


const studentSchema = new mongoose.Schema ({
  name: String,
  clgname: String,
  gender: String,
  phn: String,
  email: String,
  password: String,
  googleId: String,
  courses:[{
    coursename: String
  }]
  // course: [String]
});

const courseSchema = new mongoose.Schema ({
  name: String,
  students:[{
    studname: String
  }]
  // course: [String]
});

studentSchema.plugin(passportLocalMongoose);
studentSchema.plugin(findOrCreate);

const Student = new mongoose.model("Student", studentSchema);
const Course = new mongoose.model("Course", courseSchema);

passport.use(Student.createStrategy());

passport.serializeUser(function(student, done) {
  done(null, student.id);
});

passport.deserializeUser(function(id, done) {
  Student.findById(id, function(err, student) {
    done(err, student);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    Student.findOrCreate({ googleId: profile.id }, function (err, student) {
      return cb(err, student);
    });
  }
));

// const DSA = new Course({
//   name: "Data Structures And Algorithms"
// })
// DSA.save();
//
// const WD = new Course({
//   name: "Web Development"
// })
// WD.save();
//
// const ML = new Course({
//   name: "Machine Learning"
// })
// ML.save();
//
// const AD = new Course({
//   name: "App Development"
// })
// AD.save();
//
// const CS = new Course({
//   name: "Cloud Services"
// })
// CS.save();

app.get("/", function(req, res){
  res.render("landing");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/home",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {

    res.redirect("/home");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get("/landing", function(req, res){
  res.render("landing");
});
//passport has isAuthenticate() through which we can check wether user is logged in or not
app.get("/home", function(req, res){
  if (req.isAuthenticated()){
  res.render("home",{name: req.user.name});
} else {
  res.redirect("/landing");
}

});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/landing");
});

app.post("/signup", function(req, res){

  Student.register({
    name: req.body.name,
    clgname: req.body.clgname,
    gender: req.body.gender,
    username: req.body.username,
    phn: req.body.phn
  }, req.body.password, function(err, student){
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });

});

app.post("/dsa",function(req,res){
  // var course = ;
  var desc="A self-paced course that has been divided into 8 weeks where you will learn the basics of DSA and can practice questions & attempt the assessment tests from anywhere in the world. This will further help you to prepare for interviews with top-notch companies like Microsoft, Amazon, Adobe etc. You will also learn algorithmic techniques for solving various problems with full flexibility of time. This course does not require any prior knowledge of Data Structure and Algorithms, but a basic knowledge of any programming language ( C++ / Java) will be helpful."
  Course.find({"name":req.body.sub},function(err,students){
    console.log(students);
    if (err){
      console.log(err);
      console.log(students);
    }else{
      res.render("course",{name: req.user.name,coursename: req.body.sub, desc: desc, studs: students[0].students});
    }

  })
   // res.render("course",{coursename: req.body.sub, desc: desc});
})

// app.post("/ML",function(req,res){
//   var desc="";
//   res.render("course",{coursename: req.body.sub, desc: desc});
// })

app.post("/ML",function(req,res){
  var desc="If you want to explore cutting-edge data science and acquire skills needed for the future of ML, this is an excellent place to start. This is an introductory course that does not require any special knowledge. Mastering crowdsourcing will help you excel in your career and meet the rising demand for data labeling expertise. ";
  // res.render("course",{coursename: req.body.sub, desc: desc});
  Course.find({"name":req.body.sub},function(err,students){
    console.log(students);
    if (err){
      console.log(err);
      console.log(students);
    }else{
      res.render("course",{name: req.user.name,coursename: req.body.sub, desc: desc, studs: students[0].students});
    }

  })
})

app.post("/webd",function(req,res){
  var desc="This course is designed to start you on a path toward future studies in web development and design, no matter how little experience or technical knowledge you currently have. The web is a very big place, and if you are the typical internet user, you probably visit several websites every day, whether for business, entertainment or education. But have you ever wondered how these websites actually work? How are they built? How do browsers, computers, and mobile devices interact with the web? What skills are necessary to build a website? With almost 1 billion websites now on the internet, the answers to these questions could be your first step toward a better understanding of the internet and developing a new set of internet skills.";
  Course.find({"name":req.body.sub},function(err,students){
    console.log(students);
    if (err){
      console.log(err);
      console.log(students);
    }else{
      res.render("course",{name: req.user.name,coursename: req.body.sub, desc: desc, studs: students[0].students});
    }

  })
  // res.render("course",{coursename: req.body.sub, desc: desc});
})

app.post("/appd",function(req,res){
  var desc="This Specialization enables learners to successfully apply core Java programming languages features & software patterns needed to develop maintainable mobile apps comprised of core Android components, as well as fundamental Java I/O & persistence mechanisms. ";
  Course.find({"name":req.body.sub},function(err,students){
    console.log(students);
    if (err){
      console.log(err);
      console.log(students);
    }else{
      res.render("course",{name: req.user.name,coursename: req.body.sub, desc: desc, studs: students[0].students});
    }

  })
  // res.render("course",{coursename: req.body.sub, desc: desc});
})

app.post("/cloud",function(req,res){
  var desc="This course is intended for anyone who wants to learn about Cloud Computing, and that may have NO or very little of it knowledge of it currently. It’s for those of you who are looking to learn more about the Cloud to decide if it's something you want to adopt within your business, or those of you that may be seeking a career move and want to learn the foundation of Cloud principles, then this course is certainly for you.";
  Course.find({"name":req.body.sub},function(err,students){
    console.log(students);
    if (err){
      console.log(err);
      console.log(students);
    }else{
      res.render("course",{name: req.user.name,coursename: req.body.sub, desc: desc, studs: students[0].students});
    }

  })
  // res.render("course",{coursename: req.body.sub, desc: desc});
})


app.post("/purchase", function(req,res){
  const update= {$push:{"courses": {coursename: req.body.purchase}} }
  console.log(update);
  Student.findOneAndUpdate({_id: req.user.id},update,function(err){
        console.log(err);
  });


  const update1= {$push:{"students": {studname: req.user.name}} }
  Course.findOneAndUpdate({name: req.body.purchase},update1,function(err){
        console.log(err);
  });

  res.redirect("/home");
})

app.post("/login", function(req, res){

  const student = new Student({
    username: req.body.username,
    password: req.body.password
  });

  req.login(student, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      });
    }
  });

});


app.post("/save",function(req,res){
  const update={"name": req.body.name, "clgname": req.body.clgname, "username": req.body.username, "phn": req.body.phn, "gender":req.body.gender}
  Student.findOneAndUpdate({_id: req.user.id},update,function(err){
    if (err){
      console.log(err);
    }else{
      res.redirect("/profile1")
    }
  })
})


app.get("/profile",function(req,res){
  res.render("profile",{name:req.user.name, gender: req.user.gender, phn: req.user.phn, clgname: req.user.clgname, username: req.user.username});
})

app.get("/profile1",function(req,res){
  res.render("profile1",{name:req.user.name, gender: req.user.gender, phn: req.user.phn, clgname: req.user.clgname, username: req.user.username});
})






app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
