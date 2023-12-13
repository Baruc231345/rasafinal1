const db1 = require("../routes/rasa-db");

const calendarInput = async (req, res) => {
  const { id, event_name, event_day, event_description, required_day, start_time, end_time } = req.body;

  console.log("calendarInput.js controller")
  console.log("id:" , id)
  console.log("event_name:" , event_name)
  console.log("event_day:" , event_day)
  console.log("event_description:" , event_description)
  console.log("required_day:" , required_day)
  console.log("id:" , id)


  try {
    for (let i = 1; i <= required_day; i++) {
      const newEventDay = new Date(event_day);
      newEventDay.setDate(newEventDay.getDate() + i);
      const formattedEventDay = newEventDay.toISOString().split("T")[0];
      console.log("formatted Day:", formattedEventDay);
    
      await new Promise((resolve, reject) => {
        db1.query(
          'INSERT INTO calendar_input SET ?',
          {
            id: id,
            event_name: event_name,
            event_day: formattedEventDay,
            event_description: event_description,
            required_day: required_day,
            start_time: start_time,
            end_time: end_time,
          },
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              console.log("Success on calendar_input");
              resolve(results);
            }
          }
        );
      });
    }
    

    // Insert into calendar_input2
    await new Promise((resolve, reject) => {
      db1.query(
        'INSERT INTO calendar_input2 SET ?',
        {
          id: id,
          event_name: event_name,
          event_day: event_day,
          event_description: event_description,
          required_day: required_day,
          start_time: start_time,
          end_time: end_time,
        },
        (error, results) => {
          if (error) {
            console.error("Error:", error);
            reject(error);
          } else {
            console.log("Sucess on calendar_input2 table")
            resolve(results);
          }
        }
      );
    });

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = calendarInput;