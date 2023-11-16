const db1 = require("../routes/rasa-db");

const rasatesting2 = async (req, res,) => {
  const { full_name, event_name, event_description, event_day, start_time, end_time, user_id, contact_number, authenticated, requestor_information, requestor_type, participants, purpose_objectives, required_day, endorsed } = req.body;

  console.log(full_name);
  console.log(event_name);
  console.log(event_description);
  console.log(event_day);
  console.log(start_time);
  console.log(end_time);
  console.log(user_id); // Debug: Print user_id here to verify

    // Calculate end_date based on event_day and required_day
    const eventDate = new Date(event_day);
    eventDate.setDate(eventDate.getDate() + Number(required_day));
    const end_date = eventDate.toISOString().split("T")[0];

  try {
    const results = await new Promise((resolve, reject) => {
      db1.query('INSERT INTO inputted_table SET ?', {
        full_name: full_name,
        user_id: user_id,
        event_name: event_name,
        event_description: event_description,
        event_day: event_day,
        start_time: start_time,
        end_date: end_date,
        end_time: end_time,
        contact_number: contact_number,
        requestor_information: requestor_information,
        requestor_type: requestor_type,
        endorsed: endorsed,
        participants: participants,
        purpose_objectives: purpose_objectives,
        required_day: required_day,
        rasa_status: "Pending",
        authenticated: authenticated,
      }, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    console.log(results + "OFFICIAL OFFICIAL OFFICIAL OFFICIAL OFFICIAL OFFICIAL OFFICIALOFFICIAL.js"); // Check the entire results object
    const insertedId = results.insertId; // Retrieve the generated ID
    console.log(insertedId); // Verify the generated ID
    return res.json({
      status: "success",
      id: insertedId,
      success: "Rasatesting 2 is sucessfully done"
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = rasatesting2;