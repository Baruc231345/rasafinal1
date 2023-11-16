const db1 = require("../routes/rasa-db");

const rasatesting = async (req, res) => {
  const {
    full_name,
    event_name,
    event_description,
    event_day,
    start_time,
    required_day,
    requestor_information,
    requestor_type,
    end_time,
    contact_number,
    participants,
    purpose_objectives,
    endorsed,
  } = req.body;

  // Calculate end_date based on event_day and required_day
  const eventDate = new Date(event_day);
  eventDate.setDate(eventDate.getDate() + Number(required_day));
  const end_date = eventDate.toISOString().split("T")[0];

  console.log(full_name);
  console.log(event_name);
  console.log(event_description);
  console.log(event_day);
  console.log(start_time);
  console.log(end_date);
  console.log(required_day);
  console.log(requestor_information);
  console.log(requestor_type);
  console.log(contact_number);
  console.log(purpose_objectives);

  db1.query(
    'INSERT INTO temporary_inputted_table SET ?',
    {
      full_name: full_name,
      event_name: event_name,
      event_description: event_description,
      event_day: event_day,
      start_time: start_time,
      end_time: end_time,
      end_date: end_date, 
      requestor_information: requestor_information,
      requestor_type: requestor_type,
      endorsed: endorsed,
      required_day: required_day,
      contact_number: contact_number,
      purpose_objectives: purpose_objectives,
      participants: participants,
      rasa_status: "Pending",
    },
    (error, results) => {
      if (error) {
        console.error(error);
      } else {
        console.log(results + "TEMPORARY TEMPORARY TEMPORARY TEMPORARY.js"); // Check the entire results object
        const insertedId = results.insertId; // Retrieve the generated ID
        console.log(insertedId); // Verify the generated ID
        return res.json({
          status: "success",
          id: insertedId,
          success: "Date Already Successfully Inputted",
        });
      }
    }
  );
};

module.exports = rasatesting;