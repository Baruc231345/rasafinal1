const db1 = require("../routes/rasa-db");

const calendarInput = async (req, res) => {
  const { id, event_name, event_day, event_description, required_day } = req.body;
  
  try {
    db1.query('INSERT INTO calendar_input SET ?', {
      id: id,
      event_name: event_name,
      event_day: event_day,
      event_description: event_description,
      required_day: required_day,
    }, (error, results) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Failed to insert data" });
      } else {
        res.status(201).json({ message: "Data inserted successfully" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = calendarInput;