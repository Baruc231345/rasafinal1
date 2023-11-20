const express = require("express");
const csrfProtection = require("csurf");
const register = require("./register");
const login = require("./login");
const editUserView = require("./editUserView");
const rasatesting = require("./rasatesting");
const rasatesting2 = require("./rasatesting2");
const rasatesting2_inventory = require("./rasatesting2_inventory");
const rasatesting_inventory = require("./rasatesting_inventory");
const insertSign = require("./insertSign");
const calendarInput = require("./calendarInput");
const rasa_view = require("./rasa_view");

const router = express.Router();
const csrfMiddleware = csrfProtection();
router.post("/register", register)
router.post("/rasa_view", rasa_view)
router.post("/calendarInput", calendarInput)
router.post("/editUserView", editUserView)
router.post("/login", login)
router.post("/rasatesting", rasatesting);
router.post("/api/rasatesting2", csrfMiddleware, (req, res, next) => {
    const csrfToken = req.body._csrf;
  
    if (usedCsrfTokens.has(csrfToken)) {
      // If the token has already been used, reject the request
      res.status(403).send("CSRF token already used");
    } else {
      // Proceed with the next middleware (or route handler)
      usedCsrfTokens.add(csrfToken); // Mark the token as used
      next();
    }
  });
  
  // Clear used CSRF tokens after a certain period or based on your requirements
  setInterval(() => {
    usedCsrfTokens.clear();
  }, 24 * 60 * 60 * 1000); // Clear tokens every 24 hours, adjust as needed


router.post("/rasatesting2_inventory", rasatesting2_inventory)
router.post("/rasatesting_inventory", rasatesting_inventory)
router.post("/insertSign", insertSign)

module.exports = router; 