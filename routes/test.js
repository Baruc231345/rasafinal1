router.get("/getSignature/:id", async (req, res) => {
  const rasaID = req.params.id;
  const decryptedrasaID = decryptId(rasaID);
  const universalId = req.session.universalId;
  const hashedId = encryptId(decryptedrasaID);
  let redirectToVerification2 = false;
  console.log("----------------------------------------")
  console.log("/getSignature")
  console.log("rasaID : ", rasaID );
  console.log("decryptedrasaID : ", decryptedrasaID );
  console.log("universalId : ", universalId );
  console.log("hashedId : ", hashedId );

  const defaultSignatureid = 8;
  let signature_id;

const accounts = [
    ["Information & Communications Technology: People 1", "10"],
    ["Information & Communications Technology: People 2", "10"],
    ["Business & Management: People 1", "9"],
    ["Business & Management: People 2", "9"],
    ["Hospitality Management: People 1", "11"],
    ["Hospitality Management: People 2", "11"],
  ];

  const query = `SELECT endorsed FROM inputted_table WHERE id = ${decryptedrasaID}`;
  db1.query(query, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching endorsed value" });
    }

    if (results.length > 0) {
      const endorsedValue = results[0].endorsed;

      // Find the email corresponding to the endorsedValue
      for (const account of accounts) {
        if (endorsedValue === account[0]) {
          signature_id = account[1];
          break;
        }
      }
      if (!signature_id && (endorsedValue === null || endorsedValue === "N/A")) {
        signature_id = defaultSignatureid;
      }
      console.log(signature_id);
    } else {
      console.log("No matching record found");
    }
  });
  

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
      "UPDATE inputted_table SET form_sign = (SELECT form_sign FROM signature_table2 WHERE id = {signature_id}) WHERE id = ?";

    db1.query(updateQuery, [decryptedrasaID], async (error, result) => {
      if (error) {
        console.error("Error updating form_sign:", error);
        return res.status(500).json({ error: "Error updating form_sign" });
      }

      console.log("form_sign updated successfully");
      const puppeteer = require("puppeteer");
      const url = `http://154.41.254.18:3306/ejsrasaVanilla/${rasaID}`;

      try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 941, height: 700 }); // Adjust the width and height as needed
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