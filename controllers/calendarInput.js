const db1 = require("../routes/rasa-db");

const calendarInput = async (req, res) => {
  const { id, event_name, event_day, event_description, required_day } = req.body;

  try {
    for (let i = 0; i < required_day; i++) {
      const newEventDay = new Date(event_day);
      newEventDay.setDate(newEventDay.getDate() + i);
      const formattedEventDay = newEventDay.toISOString().split("T")[0];

      await new Promise((resolve, reject) => {
        db1.query(
          'INSERT INTO calendar_input SET ?',
          {
            id: id,
            event_name: event_name,
            event_day: formattedEventDay,
            event_description: event_description,
            required_day: required_day,
          },
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = calendarInput;