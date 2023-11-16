const express = require("express");
const app = express();
const PORT = process.env.PORT;
const PORT1 = process.env.PORT1;
const loggedIn = require("../controllers/loggedin");
const login = require("../controllers/login");
const logout = require("../controllers/logout");
const newreg = require("../controllers/newreg");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
app.use(cors());
const router = express.Router();
const multer = require("multer");
const db1 = require("../routes/rasa-db");
const { default: puppeteer } = require("puppeteer");
let universalId = null;
const storage = multer.memoryStorage();
router.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

console.log(__dirname);

const crypto = require('crypto');

// Create a single encryption key and IV when your application starts
const encryptionKey = crypto.randomBytes(32); // 32-byte (256-bit) random key
const iv = crypto.randomBytes(16); // Initialization vector
function encryptId(id) {
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encryptedId = cipher.update(id.toString(), 'utf8', 'hex');
  encryptedId += cipher.final('hex');
  return encryptedId;
}
function decryptId(encryptedId) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decryptedId = decipher.update(encryptedId, 'hex', 'utf8');
  decryptedId += decipher.final('utf8');
  return decryptedId;
}

router.get("/", loggedIn, (req, res, next) => {
  if (req.user) {
    const status = "loggedIn";
    res.render("index", { status: status, user: req.user });
    console.log(status);
  } else {
    const status = "Status is not logged in. Log in first";
    res.render("index", { status: status, user: "nothing" });
    console.log(status);
  }
});




// Middleware to restrict access to /dashboard if not logged in
const dashboardAccessMiddleware = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    res.redirect("/");
  }
};

const adminMiddleware = (req, res, next) => {
  const userId = req.user.id;
  db1.query("SELECT * FROM user WHERE id = ?", [userId], (err, results) => {
    if (err) throw err;

    const user = results[0];
    if (user.role === "admin") {
      return next();
    } else {
      console.log("You're not Admin!");
      res.clearCookie("userRegistered");
      res.redirect("/dashboardRegular");
    }
  });
};

router.get(
  "/dashboardAdmin",
  /*loggedIn, adminMiddleware */ (req, res) => {
    const universalId = req.session.universalId; // Retrieve the universalId from the session
    if (!universalId) {
      return res.status(400).send("Universal ID not found in the session");
    }
    res.sendFile("dashboard_admin.html", { root: "./public/" });
    console.log(universalId + " route /dashboardAdmin");
  }
);

router.get(
  "/dashboardRegular/:id",
  loggedIn,
  dashboardAccessMiddleware,
  (req, res) => {
    const id = req.params.id;
    req.session.universalId = id;
    res.render("dashboard_regular", { id });
    console.log(id + " route /dashboardRegular/:id");
  }
);

// Middleware to check for the presence of universalId in the session
const checkUniversalCodeMiddleware = (req, res, next) => {
  const universalCode = req.session.universalId;
  console.log("----------------------------------------")
  console.log("checkUniversalCodeMiddleware middleware")
  console.log(universalCode);
  console.log("test");

  // If universalCode is not present, redirect to the root path
  if (!universalCode) {
    req.session.universalId = null;
    return res.redirect("/");
  }

  // If universalCode is present, continue to the next middleware or route handler
  next();
};


router.get("/ejsrasa/:id", (req, res) => {
  const rasaID = req.params.id;
  const universalId = req.session.universalId;
  console.log(rasaID);
  const query = "SELECT * FROM inputted_table WHERE id = ?";
  db1.query(query, [rasaID], function (error, data) {
    if (error) {
      throw error;
    } else {
      if (data.length > 0) {
        const inputted_table = data[0];
        res.locals.rasaID = rasaID;
        res.render("submitrasa", {
          inputted_table: inputted_table,
          universalId,
        });
      } else {
        res.status(404).send("Rasa not found");
      }
    }
  });
});

router.get("/ejsrasaVanilla/:id", (req, res) => {
  const rasaID = req.params.id;
  const universalId = req.session.universalId;
  const query1 = "SELECT * FROM inputted_table WHERE id = ?";
  const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";
  db1.query(query1, [rasaID], (error, data1) => {
    if (error) {
      throw error;
    } else {
      if (data1.length > 0) {
        db1.query(query2, [rasaID], (error, data2) => {
          if (error) {
            console.error("Error fetching data from inventory_table:", error); // Log the error
            throw error;
          } else {
            if (data2.length > 0) {
              const datainputted = data1[0];
              const datainventory = data2[0];
              res.locals.rasaID = rasaID;
              res.render("submitrasaCopy", {
                rasaID,
                datainputted,
                datainventory,
                universalId,
              });
            } else {
              res.status(404).send("Data from second table not found");
            }
          }
        });
      } else {
        res.status(404).send("Data from first table not found");
      }
    }
  });
});


router.get("/ejsrasaVanilla2/:encryptedId", (req, res) => {
  const hashedId = req.params.encryptedId; 
  const universalId = req.session.universalId;
  
  const rasaID = decryptId(hashedId);
  console.log("A");
  console.log("hashedId =" + hashedId);
  console.log("original id from parameters = " + rasaID);
  
  const query1 = "SELECT * FROM inputted_table WHERE id = ?";
  const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";
  
  db1.query(query1, [rasaID], (error, data1) => {
    if (error) {
      throw error;
    } else {
      if (data1.length > 0) {
        db1.query(query2, [rasaID], (error, data2) => {
          if (error) {
            console.error("Error fetching data from inventory_table:", error); // Log the error
            throw error;
          } else {
            if (data2.length > 0) {
              const datainputted = data1[0];
              const datainventory = data2[0];
              res.locals.rasaID = rasaID; 
              res.render("submitrasaCopy", {
                rasaID: rasaID,
                datainputted,
                datainventory,
                universalId,
              });
            } else {
              res.status(404).send("Data from second table not found");
            }
          }
        });
      } else {
        res.status(404).send("Data from the first table not found");
      }
    }
  });
});

router.get("/ejsrasa_copy/:id/:id2", (req, res) => {
  const rasaID = req.params.id;
  const universalId = req.session.universalId;

  // Define queries for both tables
  const query1 = "SELECT * FROM temporary_inputted_table WHERE id = ?";
  const query2 =
    "SELECT * FROM temporary_inventory_table WHERE rasa_inventory_id = ?";

  // Execute the first query
  db1.query(query1, [rasaID], (error, data1) => {
    if (error) {
      throw error;
    } else {
      if (data1.length > 0) {
        db1.query(query2, [rasaID], (error, data2) => {
          if (error) {
            throw error;
          } else {
            if (data2.length > 0) {
              const datainputted = data1[0];
              const datainventory = data2[0];
              res.locals.rasaID = rasaID;
              res.render("submitrasa", {
                rasaID,
                datainputted,
                datainventory,
                universalId,
              });
            } else {
              res.status(404).send("Data from second table not found");
            }
          }
        });
      } else {
        res.status(404).send("Data from first table not found");
      }
    }
  });
});

router.get("/ejsrasa_copy2/:id", (req, res) => {
  const rasaID = req.params.id;
  const universalId = req.session.universalId;
  console.log(rasaID);
  const query = "SELECT * FROM inputted_table WHERE id = ?";
  db1.query(query, [rasaID], function (error, data) {
    if (error) {
      throw error;
    } else {
      if (data.length > 0) {
        const inputted_table = data[0];
        res.locals.rasaID = rasaID;
        res.render("submitrasaCopy", { rasaID, inputted_table, universalId });
      } else {
        res.status(404).send("Rasa not found");
      }
    }
  });
  
});

router.get("/editUserView", adminMiddleware, (req, res) => {
  res.sendFile("editUserView.html", { root: "./public" });
});

router.get("/rasa",  (req, res) => {
  const universalId = req.session.universalId;
  res.render("rasa", { id: universalId });
});


app.get("/fetch-data", (req, res) => {
  const month = req.query.month;
  const year = req.query.year;

  const inputtedQuery = `
    SELECT
      it.id AS id,
      it.event_day,
      it.event_name,
      it.event_description,
      it.required_day,
      inventory_table.*
    FROM inputted_table it
    LEFT JOIN inventory_table ON it.id = inventory_table.inventory_id
    WHERE MONTH(it.event_day) = ? AND YEAR(it.event_day) = ?;`;

  db1.query(inputtedQuery, [month, year], (inputtedError, inputtedResults) => {
    if (inputtedError) {
      console.error(inputtedError);
      res.status(500).json({ error: "An error occurred while fetching data" });
    } else {
      // Process the fetched data to extend it with required dates
      const extendedData = [];

      inputtedResults.forEach((row) => {
        // Parse the required_day as an integer
        const requiredDay = parseInt(row.required_day);

        // Subtract 1 day from the event_day
        const eventDate = new Date(row.event_day);
        eventDate.setDate(eventDate.getDate() - 1); // Subtract 1 day

        // Iterate over the range of days and create new rows for each day
        for (let i = 0; i < requiredDay; i++) {
          const newRow = { ...row }; // Clone the original row
          eventDate.setDate(eventDate.getDate() + 1); // Add 1 day
          newRow.event_day = eventDate.toISOString().slice(0, 10); // Format as YYYY-MM-DD
          extendedData.push(newRow);
        }
      });
      res.json(extendedData);
    }
  });
});

router.get("/inventory12", (req, res) => {
  res.sendFile("inventory.html", { root: "./public/" });
});

router.get("/inventory123", loggedIn, dashboardAccessMiddleware, (req, res) => {
  const query1 = "SELECT * FROM inputted_table";
  const query2 = "SELECT * FROM inventory_table";

  Promise.all([
    new Promise((resolve, reject) => {
      db1.query(query1, (error, inputtedData) => {
        if (error) {
          reject(error);
        } else {
          resolve(inputtedData);
        }
      });
    }),
    new Promise((resolve, reject) => {
      db1.query(query2, (error, inventoryData) => {
        if (error) {
          reject(error);
        } else {
          resolve(inventoryData);
        }
      });
    }),
  ])
    .then(([inputtedData, inventoryData]) => {
      // Combine data and send as JSON
      const combinedData = {
        inputtedData: inputtedData,
        inventoryData: inventoryData,
      };
      res.json(combinedData);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("An error occurred while fetching data");
    });
});

router.get("/newregister", (req, res) => {
  res.sendFile("newregister.html", { root: "./public/" });
});

router.get("/userview", loggedIn, adminMiddleware, (req, res) => {
  var query = "SELECT * FROM user ORDER BY id DESC";
  db1.query(query, function (error, data) {
    if (error) {
      throw error;
    } else {
      res.render("user-view", {
        title: "Node.js MySQL CRUD Application",
        action: "list",
        sampleData: data,
      });
    }
  });
});

// http://localhost:3005/rasaview
router.get("/rasaview", loggedIn, adminMiddleware, (req, res) => {
  const itemsPerPage = 15;
  const currentPage = parseInt(req.query.page) || 1; 
  const offset = (currentPage - 1) * itemsPerPage;

  const query = `SELECT * FROM inputted_table WHERE authenticated = 0 ORDER BY id DESC LIMIT ?, ?`;
  db1.query(query, [offset, itemsPerPage], (error, data) => {
    if (error) {
      throw error;
    } else {
      res.render("rasa_viewAdmin", {
        title: "Node.js MySQL CRUD Application",
        action: "list",
        sampleData: data,
        currentPage: currentPage,
        itemsPerPage: itemsPerPage,
      });
    }
  });
});

router.post("/api/updateAuthenticated/:id", (req, res) => {
  const id = req.params.id;

  const query = "UPDATE inputted_table SET authenticated = 1 WHERE id = ?";

  db1.query(query, [id], (error, results) => {
    if (error) {
      console.error("Error updating authenticated:", error);
      res.status(500).json({ message: "Error updating authenticated" });
    } else {
      console.log("Authenticated successfully");
      
      // Send a success response to the client
      res.json({ message: "Authenticated updated successfully" });
    }
  });
});

router.get("/rasaview/:id", checkUniversalCodeMiddleware,(req, res) => {
  const hashedId = req.params.id; 
  const universalId = req.session.universalId;
  const encryptedId = encryptId(hashedId); // Encrypt the hashedId
  const originalId = decryptId(encryptedId);

  try {
    console.log("hashedId:", hashedId);
    console.log("encryptedId", encryptedId);
    
    if (isNaN(hashedId) || hashedId !== universalId) {
      res.status(403).send("Access denied: You do not have permission to view this page.");
      return;
    }
    
    const query = "SELECT * FROM inputted_table WHERE user_id = ?";
    db1.query(query, [hashedId], (error, data) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data.");
      } else {
        // Process and render data
        const sampleData = data.map(item => {
          // Encrypt each data.id before sending it to the template
          return {
            ...item,
            encryptedId: encryptId(item.id),
          };
        });
        
        res.render("rasa_view", {
          title: "Node.js MySQL CRUD Application",
          action: "list",
          sampleData: sampleData,
          id: hashedId,
          encryptedId: encryptedId,
        });
      }
    });

  } catch (error) {
    console.error("Decryption error:", error);
    console.log("error");
    console.log("hashedId:", hashedId);
    console.log("originalId after decryption:", originalId);
    console.log("userid: ", userId)
    res.status(500).send("Error decrypting the ID.");
  }
});

router.get("/calendar", (req, res) => {
  if (req.user) {
    res.sendFile("calendar.html", { root: "./public/" });
  } else {
    const message = "You need to log in to access the calendar.";
    res.render("login", { message: message });
  }
});

router.get("/calendar12", loggedIn, dashboardAccessMiddleware, (req, res) => {
  res.render("calendar", { id: universalId });
});

router.get(
  "/calendarAdmin",
  loggedIn,
  dashboardAccessMiddleware,
  adminMiddleware,
  (req, res) => {
    res.sendFile("calendarAdmin.html", { root: "./public/" });
  }
);

router.get(
  "/accesorAdmin",
  /*loggedIn, adminMiddleware,*/ (req, res) => {
    res.sendFile("accesor_admin.html", { root: "./public/" });
  }
);

router.get("/accesorRegular", loggedIn, (req, res) => {
  if (req.user) {
    res.sendFile("accesor_regular.html", { root: "./public/" });
  } else {
    // Render a login page with a message
    const message = "You need to log in to access the accessor regular page.";
    res.render("login", { message: message });
  }
});

router.get("/editUserView/:id", (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  const query = "SELECT * FROM user WHERE id = ?";
  db1.query(query, [userId], function (error, data) {
    if (error) {
      throw error;
    } else {
      if (data.length > 0) {
        const user = data[0];
        res.locals.userId = userId;
        res.render("editUserView1", { user: user });
      } else {
        res.status(404).send("Rasa form is not found");
      }
    }
  });
});

router.get("/pdf1/:id", async (req, res) => {
  const puppeteer = require("puppeteer");
  const rasaID = req.params.id;
  const url = `http://154.41.254.18:3306/ejsrasaVanilla/${rasaID}`;

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });
    const pdfBuffer = await page.pdf();
    await browser.close();

    const pdfFileName = `rasa_${rasaID}.pdf`;
    const filePath = path.join(__dirname, "public", "pdf-folders", pdfFileName);
    const directoryPath = path.join(__dirname, "public", "pdf-folders");
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfBuffer);
    res.download(filePath, (error) => {
      console.log(filePath);
      fs.unlinkSync(filePath);
    });
    /*
     const sql = "UPDATE inputted_table SET pdf = ? WHERE id = ?";
    db1.query(sql, [pdfFileName, rasaID], function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred while updating the table");
      } else {
        console.log(
          `PDF successfully generated and saved in pdf-folders. RasaId = ${rasaID}`
        );
        res.download(filePath);
    });
      }*/
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating PDF");
  }
});

router.get("/pdf2/:encryptedId", async (req, res) => {
  const puppeteer = require("puppeteer");
  const encryptedId = req.params.encryptedId;
  const decryptedId = decryptId(encryptedId);

  if (decryptedId === null) {
    return res.status(400).send("Invalid encrypted ID");
  }

  const url = `http://154.41.254.18:3306/ejsrasaVanilla/${decryptedId}`;

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });
    const pdfBuffer = await page.pdf();
    await browser.close();

    const pdfFileName = `rasa_${decryptedId}.pdf`;
    const filePath = path.join(__dirname, "public", "pdf-folders", pdfFileName);
    const directoryPath = path.join(__dirname, "public", "pdf-folders");
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfBuffer);
    res.download(filePath, (error) => {
      console.log(filePath);
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating PDF");
  }
});

router.get("/delete_rasa_request/:id", async (req, res) => {
  const rasaID = req.params.id;
  try {
    const selectSql = "SELECT * FROM inputted_table WHERE id = ?";
    db1.query(selectSql, [rasaID], function (error, result) {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .send("An error occurred while fetching the data to be deleted");
      }
      if (!result.length) {
        return res
          .status(404)
          .send("The provided ID does not exist in the inputted_table");
      }
      const data = result[0];
      const insertSql =
        "INSERT INTO archieved_inputted_table2 (rasa_id, full_name, event_day, event_name, event_description, start_time, end_time, rasa_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      db1.query(
        insertSql,
        [
          data.id,
          data.full_name,
          data.event_day,
          data.event_name,
          data.event_description,
          data.start_time,
          data.end_time,
          data.rasa_status,
        ],
        function (error, result) {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .send(
                "An error occurred while transferring the data to the archieve_inputted_table"
              );
          }
          const deleteSql = "DELETE FROM inputted_table WHERE id = ?";
          db1.query(deleteSql, [rasaID], function (error, result) {
            if (error) {
              console.error(error);
              return res
                .status(500)
                .send(
                  "An error occurred while deleting the data from the inputted_table"
                );
            }
            res
              .status(200)
              .send(
                "Data successfully deleted from inputted_table and transferred to archieve_inputted_table"
              );
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the request");
  }
});

router.get("/approve/:id", (req, res) => {
  const userId = req.params.id;
  db1.query(
    "UPDATE user SET pending = 1 WHERE id = ?",
    [userId],
    (error, results) => {
      if (error) {
        return res.json({
          status: "error",
          error: "Error approving user",
        });
      }
      return res.redirect("/userview"); // Redirect to the '/userview' route after updating the 'user.pending' value
    }
  );
});

async function generatePDF(id) {
  const puppeteer = require("puppeteer");
  const url = `http://154.41.254.18:3306/ejsrasaVanilla/${id}`;

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Set a larger viewport size to capture the entire page
    await page.setViewport({ width: 3000, height: 1080 }); // Adjust the width and height as needed

    await page.goto(url, { waitUntil: "load" });

    // Scroll to the bottom of the page to ensure all content is visible
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    const pdfBuffer = await page.pdf();
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error(error);
    throw Error("An error occurred while generating PDF");
  }
}

router.get("/verification/:id", async (req, res) => {
  const id = req.params.id;
  const hashedId = encryptId(id); // Convert id to a cryptographic hash
  const nodemailer = require("nodemailer");
  const email = "nekins213@gmail.com";
  const pdfFileName = `rasa_${id}.pdf`;

  const html = `
    <h1>Rasa for Approval Email</h1>
    <a href="http://154.41.254.18:3306/getSignature/${hashedId}" style="background-color: green; color: white; padding: 10px; text-decoration: none;">Approve</a>
  `;

  try {
    // Update rasa_status
    const updateSql = "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
    const sendEmail = async () => {
      return new Promise((resolve, reject) => {
        db1.query(
          updateSql,
          [`Step 1: Waiting for approval of ${email}`, id],
          (error, result) => {
            if (error) {
              console.error(error);
              const updateErrorSql =
                "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
              db1.query(
                updateErrorSql,
                [`Error 500: Sending Rasa to Email is Failed`, id],
                (error) => {
                  if (error) {
                    console.error(error);
                    reject("Error updating rasa_status");
                  }
                  reject(
                    "Error sending email. rasa_status updated to Error 500: Sending Rasa to Email is Failed"
                  );
                }
              );
            } else {
              console.log(
                `rasa_status updated to waiting for email of ${email} for ID: ${id}`
              );
              resolve();
            }
          }
        );
      });
    };

    await sendEmail();
    const pdfBuffer = await generatePDF(id);

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "processtest2@outlook.ph",
        //pass: "VTMUS-AD5RG-KUSCA-JMF5K-TRDNB",
        pass: "cwbomrdgiphyvvnz",
        //pass: "Capstone2!",
      },
    });

    transporter.sendMail(
      {
        from: "STI-Building Administration <processtest2@outlook.ph>",
        to: email,
        subject: "First Signature:",
        html: html,
        attachments: [
          {
            filename: `Rasa_File_${id}.pdf`,
            content: pdfBuffer, // Attach the PDF buffer
          },
        ],
      },
      (error, info) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .send("An error occurred while sending the email");
        }
        console.log("Message Sent: " + info.messageId);
        return res.redirect("/rasaview");
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while updating rasa_status and sending email");
  }
});

router.get("/verification2/:hashedId", async (req, res) => {

  const hashedId1 = req.params.hashedId; 
  const originalId = decryptId(hashedId1);
  const hashedId = encryptId(originalId);
  const universalId = req.session.universalId;
  console.log("verification2 route" + originalId + "    " + hashedId + "    " + hashedId1)

  const query1 = "SELECT * FROM inputted_table WHERE id = ?";
  const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";

  db1.query(query1, [originalId], (error, data1) => {
    if (error) {
      throw error;
    } else {
      if (data1.length > 0) {
        db1.query(query2, [originalId], (error, data2) => {
          if (error) {
            console.error("Error fetching data from inventory_table:", error);
            throw error;
          } else {
            if (data2.length > 0) {
              const datainputted = data1[0];
              const datainventory = data2[0];
              res.render("submitrasaCopy", {
                rasaID: originalId,
                datainputted,
                datainventory,
                universalId,
              });
            } else {
              res.status(404).send("Data from the second table not found");
            }
          }
        });
      } else {
        res.status(404).send("Data from the first table not found");
      }
    }
  });

  const nodemailer = require("nodemailer");
  const fs = require("fs");
  const email = "miguelbaruc12@gmail.com";

  const html = `
    <h1>Rasa for Approval Email</h1>
    <a href="http://154.41.254.18:3306/getSignature2/${hashedId}" style="background-color: green; color: white; padding: 10px; text-decoration: none;">Approve</a>
  `;

  try {
    const updateSql = "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
    db1.query(
      updateSql,
      [`Step 4: Sending email to ${email}`, originalId],
      (error, result) => {
        if (error) {
          console.error(error);
          const updateErrorSql =
            "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
          db1.query(
            updateErrorSql,
            [`Step 4.5 / Signature 2 - Error 500: Sending Rasa to Email is Failed`, originalId],
            (error) => {
              if (error) {
                console.error(error);
                return res
                  .status(500)
                  .send("An error occurred while updating rasa_status");
              }
              return res
                .status(500)
                .send(
                  "An error occurred while sending email. rasa_status updated to Error 500: Sending Rasa to Email is Failed"
                );
            }
          );
        } else {
          console.log(
            "Step 5: This is Signature 2: rasa_status updated to " +
              "waiting for an email from " +
              email +
              " for ID: " +
              originalId
          );

          // Generate PDF using the provided function
          generatePDF(originalId)
            .then((pdfBuffer) => {
              const transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                  user: "processtest2@outlook.ph",
                  //pass: "VTMUS-AD5RG-KUSCA-JMF5K-TRDNB",
                  pass: "cwbomrdgiphyvvnz",
                  //pass: "Capstone2!",
                },
              });

              transporter.sendMail(
                {
                  from: "STI-Building Administration <processtest2@outlook.ph>",
                  to: email,
                  subject: "Second Signature:",
                  html: html,
                  attachments: [
                    {
                      filename: `Rasa_File_${originalId}.pdf`,
                      content: pdfBuffer,
                    },
                  ],
                },
                (error, info) => {
                  if (error) {
                    console.error(error);
                    return res
                      .status(500)
                      .send("An error occurred while sending the email");
                  }
                  console.log("Message Sent: " + info.messageId);
                  res.redirect(`/rasaview`);
                }
              );
            })
            .catch((pdfError) => {
              console.error(pdfError);
              return res
                .status(500)
                .send("An error occurred while generating PDF");
            });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while updating rasa_status and sending email");
  }
});

router.get("/getSignature/:id", async (req, res) => {
  const rasaID = req.params.id;
  const decryptedrasaID = decryptId(rasaID);
  const universalId = req.session.universalId;
  const hashedId = encryptId(decryptedrasaID);
  let redirectToVerification2 = false;

  const checkFormSignQuery = "SELECT form_sign FROM inputted_table WHERE id = ?";

  db1.query(checkFormSignQuery, [decryptedrasaID], async (error, result) => {
    if (error) {
      console.error("Error checking form_sign:", error);
      res.status(500).json({ error: "Error checking form_sign" });
    }

    const formSignValue = result[0] && result[0].form_sign;

    if (formSignValue) {
      console.log("Already Signed");
      return res.status(200).send("Already Signed");
    }

    const updateQuery =
      "UPDATE inputted_table SET form_sign = (SELECT form_sign FROM signature_table2 WHERE id = 4) WHERE id = ?";

    db1.query(updateQuery, [decryptedrasaID], async (error, result) => {
      if (error) {
        console.error("Error updating form_sign:", error);
        return res.status(500).json({ error: "Error updating form_sign" });
      }

      console.log("form_sign updated successfully");
      const puppeteer = require("puppeteer");
      const url = `http://154.41.254.18:3306/ejsrasaVanilla/${rasaID}`;

      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "load" });
        const pdfBuffer = await page.pdf();
        await browser.close();

        const updateSql = "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
        db1.query(updateSql, ["Step 3: First Signature Approved: sending email to miguelbaruc12@gmail.com", decryptedrasaID], (error, result) => {
          if (error) {
            console.error("An error occurred while updating rasa_status:", error);
            return res.status(500).json({ error: "An error occurred while updating rasa_status" });
          }

          else {
            console.log("rasa_status updated to First Signature Approved: waiting for approval of miguelbaruc12@gmail.com");
            if (!redirectToVerification2) {
              redirectToVerification2 = true;
              res.redirect(`/verification2/${hashedId}`);
            }
          }

          const selectInventoryQuery = "SELECT * FROM inventory_table WHERE id = ?";
          db1.query(selectInventoryQuery, [decryptedrasaID], function (error, dataInventory) {
            if (error) {
              console.error("Error querying inventory_table:", error);
              return res.status(500).json({ error: "Error querying inventory_table" });
            }

            const selectInputtedQuery = "SELECT * FROM inputted_table WHERE id = ?";
            db1.query(selectInputtedQuery, [decryptedrasaID], function (error, dataInputted) {
              if (error) {
                console.error("Error querying inputted_table:", error);
                return res.status(500).json({ error: "Error querying inputted_table" });
              }

              if (dataInputted.length > 0 && dataInventory.length > 0) {
                const datainputted = dataInputted[0];
                const datainventory = dataInventory[0];
                res.locals.rasaID = decryptedrasaID;
                res.render("submitrasaCopy", {
                  inputted_table: datainputted,
                  inventory_table: datainventory,
                  universalId,
                });
              } else {
                console.log("res.redirect(`/ejsrasaVanilla2/${hashedId}`)");
              }
            });
          });
        });
      } catch (error) {
        console.error("An error occurred while generating PDF:", error);
        return res.status(500).json({ error: "An error occurred while generating PDF" });
      }
    });
  });
});


router.get("/getSignature2/:hashedId", async (req, res) => {
  const rasaID = req.params.id;
  const hashedId = req.params.hashedId;
  const decryptedrasaID = decryptId(hashedId);
  const universalId = req.session.universalId;
  //const hashedId = encryptId(decryptedrasaID);
  let redirectToVerification2 = false;

  // Checking the form_sign2 column if it has values
  const checkFormSignQuery = "SELECT form_sign2 FROM inputted_table WHERE id = ?";
  db1.query(checkFormSignQuery, [decryptedrasaID], async (error, result) => {
    if (error) {
      console.error("Error checking form_sign:", error);
      res.status(500).json({ error: "Error checking form_sign" });
    }
    const formSignValue = result[0] && result[0].form_sign;
    if (formSignValue) {
      console.log("Already Signed");
      return res.status(200).send("Already Signed");
    }

    const updateQuery =
      "UPDATE inputted_table SET form_sign2 = (SELECT form_sign FROM signature_table2 WHERE id = 5) WHERE id = ?";

    db1.query(updateQuery, [decryptedrasaID], async (error, result) => {
      if (error) {
        console.error("Error updating form_sign:", error);
        return res.status(500).json({ error: "Error updating form_sign" });
      }

      console.log("form_sign updated successfully");
      const puppeteer = require("puppeteer");
      const url = `http://154.41.254.18:3306/ejsrasaVanilla/${decryptedrasaID}`;

      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "load" });
        const pdfBuffer = await page.pdf();
        await browser.close();

        const updateSql = "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
        db1.query(updateSql, ["Step 6: 2/2 Signature: sending email to @gmail.com", decryptedrasaID], (error, result) => {
          if (error) {
            console.error("An error occurred while updating rasa_status:", error);
            return res.status(500).json({ error: "An error occurred while updating rasa_status" });
          }

          else {
            console.log("rasa_status updated to Step 6: 2/2 Signature: sending email to @gmail.com");
            /*
            if (!redirectToVerification2) {
              redirectToVerification2 = true;
              res.redirect(`/verification2/${hashedId}`);
            }
            */
          }

          const selectInventoryQuery = "SELECT * FROM inventory_table WHERE id = ?";
          db1.query(selectInventoryQuery, [decryptedrasaID], function (error, dataInventory) {
            if (error) {
              console.error("Error querying inventory_table:", error);
              return res.status(500).json({ error: "Error querying inventory_table" });
            }

            const selectInputtedQuery = "SELECT * FROM inputted_table WHERE id = ?";
            db1.query(selectInputtedQuery, [decryptedrasaID], function (error, dataInputted) {
              if (error) {
                console.error("Error querying inputted_table:", error);
                return res.status(500).json({ error: "Error querying inputted_table" });
              }

              if (dataInputted.length > 0 && dataInventory.length > 0) {
                const datainputted = dataInputted[0];
                const datainventory = dataInventory[0];
                res.locals.rasaID = decryptedrasaID;
                res.render("submitrasaCopy", {
                  inputted_table: datainputted,
                  inventory_table: datainventory,
                  universalId,
                });
              } else {
                console.log("res.redirect(`/ejsrasaVanilla2/${hashedId}`)");
              }
            });
          });
        });
      } catch (error) {
        console.error("An error occurred while generating PDF:", error);
        return res.status(500).json({ error: "An error occurred while generating PDF" });
      }
    });
  });
});

/*
router.get("/getSignature2/:hashedId", (req, res) => {
  const rasaID = req.params.hashedId;
  const originalId = decryptId(rasaID);
  const decryptedrasaID = decryptId(rasaID);
  const hashedId = encryptId(originalId);

  const query1 = "SELECT * FROM inputted_table WHERE id = ?";
  const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";


  console.log("This is getSignature2 route")
  console.log(rasaID);
  console.log(originalId);
  console.log("this is headhs " + decryptedrasaID);
  

  const checkFormSignQuery = "SELECT form_sign2 FROM inputted_table WHERE id = ?";

  db1.query(checkFormSignQuery, [decryptedrasaID], async (error, result) => {
    if (error) {
      console.error("Error checking form_sign:", error);
      res.status(500).json({ error: "Error checking form_sign" });
    }

    const formSignValue = result[0] && result[0].form_sign;
    const formSignValue2 = result[0] && result[0].form_sign2;

    if (formSignValue && formSignValue2 ) {
      console.log("Already Signed");
      return res.status(200).send("Signed 1 and Signature 2 is Already Signed");
    }

  const updateQuery =
    "UPDATE inputted_table SET form_sign2 = (SELECT form_sign FROM signature_table2 WHERE id = 2) WHERE id = ?";

  db1.query(updateQuery, [decryptedrasaID], function (error, result) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error updating form_sign2" });
    } else {
      console.log("form_sign2 updated successfully");

      const updateSql =
        "UPDATE inputted_table SET rasa_status = ? WHERE id = ?";
      db1.query(
        updateSql,
        [`Step 6: Second Signatuure is done, sending email to @gmail.com`, decryptedrasaID],
        (error, result) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .send("An error occurred while updating rasa_status");
          } else {
            console.log("All Signature Approved");
            const selectQuery = "SELECT * FROM inputted_table WHERE id = ?";
            db1.query(selectQuery, [rasaID], function (error, data) {
              if (error) {
                throw error;
              } else {
                if (data.length > 0) {
                  const inputted_table = data[0];
                  res.locals.rasaID = decryptedrasaID;
                  res.render("submitrasaCopy", {
                    rasaID: decryptedrasaID,
                    inputted_table: inputted_table,
                    universalId,
                  });
                } else {
                  res.status(404).send("Rasa not found");
                }
              }
            });
          }
        }
      );
    }
  });
});
});
*/

router.get("/api/calendarFinal", (req, res) => {
  const query =
    "SELECT * FROM calendar_input WHERE id = ? AND event_day = ? AND event_name = ? AND event_description = ? AND required_day = ?";
  const params = [id, event_day, event_name, event_description, required_day];

  db1.query(query, params, (error, results) => {
    if (error) {
      console.error("Error fetching data from the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
});

router.get("/api/calendarInputData", (req, res) => {
  const query = "SELECT * FROM calendar_input";
  db1.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching data from the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
});

router.get("/insertSign", async (req, res) => {
  res.sendFile("insertSign.html", { root: "./public/" });
});



router.get("/logout", logout);
router.get("/newreg", newreg);

app.listen(PORT1);
module.exports = router;
