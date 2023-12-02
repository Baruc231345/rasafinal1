router.get("/ejsrasaVanilla2/:encryptedId", (req, res) => {
  const encryptedId = req.params.encryptedId;
  const universalId = req.session.universalId;
  const decryptedId = decrypt(encryptedId)


  console.log("A");
  console.log("encryptedId =" + encryptedId);
  console.log("decryptedId =" + decryptedId);

  const query1 = "SELECT * FROM inputted_table WHERE id = ?";
  const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";

  db1.query(query1, [decryptedId], (error, data1) => {
    if (error) {
      throw error;
    } else {
      if (data1.length > 0) {
        db1.query(query2, [decryptedId], (error, data2) => {
          if (error) {
            console.error("Error fetching data from inventory_table:", error); // Log the error
            throw error;
          } else {
            if (data2.length > 0) {
              const datainputted = data1[0];
              const datainventory = data2[0];
              res.render("submitrasaCopy", {
                decryptedId,
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