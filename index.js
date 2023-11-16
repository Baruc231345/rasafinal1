const express = require("express");
const db = require("./routes/rasa-db.js");
const app = express();
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const PORT = process.env.PORT;
const session = require('express-session');

app.use(session({
  secret: "capstone", 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set secure to true if using HTTPS
}));


app.use(bodyParser.urlencoded({extended:true}))

app.get("/dashboardRegular/css/dashboard1.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/dashboard1.css");
});

app.get("/rasa/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/rasa/js/rasa.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/rasa.js");
});

app.get("/ejsrasa/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/ejsrasaVanilla/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/ejsrasaVanilla2/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/verification2/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/dashboarRegular/js/dashboard1.css", (req, res) => {
  res.sendFile(__dirname + "/public/js/dashboard1.js");
  });


app.get("/rasaview/css/rasa_view.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa_view.css");
});

app.get("/rasa_viewAdmin/css/rasa_view.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa_view.css");
});

app.get("/rasa_viewAdmin/js/rasa_view.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/rasa_view.js");
});

app.get("/calendar/css/calendar.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/calendar.css");
});

app.get("/calendar/js/calendar.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/calendar.js");
});

app.get("/rasaview/js/rasa_view.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/rasa_view.js");
});


app.get("/editUserView/css/editUserView.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/editUserView.css");
});

app.get("/ejsrasa_copy/:id1/css/rasa.css", (req, res) => {
    res.sendFile(__dirname + "/public/css/rasa.css");
  });

app.get("/ejsrasa_copy/:id1/js/rasa.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/rasa.js");
});

app.get("/ejsrasa_copy2/:id/js/rasa.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/rasa.js");
});
app.get("/ejsrasa_copy2/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
});

app.get("/ejsrasa_copy/css/rasa.css", (req, res) => {
    res.sendFile(__dirname + "/public/css/rasa.css");
  });


app.get("/getSignature/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
  });
  
app.get("/getSignature2/css/rasa.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/rasa.css");
  });  

  app.get("/inventory/js/inventory.js", (req, res) => {
    res.sendFile(__dirname + "/public/js/inventory.js");
    });  
  

app.get("/dashboardRegular/js/dashboard1.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/dashboard1.js");
  });


app.get("/testSignature/js/insertSign.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/insertSign.js");
  });

app.get("/testSignature/css/insertSign.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/insertSign.css");
  });

app.use("/js", express.static(__dirname + "/public/js"))
app.use("/css", express.static(__dirname + "/public/css"))
app.set("view engine" , "ejs")
app.set("views" , "./views")
app.use(cookie())
app.use(express.json())
db.connect((err)=>{
    if(err)throw err;
    console.log("database connected");
})

const router = require("./routes/pages")
app.use("/", router);
app.use("/api", require("./controllers/auth")); 
app.listen(PORT);
