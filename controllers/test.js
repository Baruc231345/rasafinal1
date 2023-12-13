const db1 = require("../routes/rasa-db");

const rasatesting2 = async () => {
  let event_day = "2023-12-29";
  let start_time = "12:00:00";
  let end_time = "15:00:00";
  console.log("rasatesting2.js");

  let auditorium = 1;
  let foodandbeverage = 0;
  let mainlobby = 0;
  let dancestudio = 0;
  let multihall = 0;
  let gym = 0;
  let kitchen = 1;
  let classroom = 0;

  var venueArray = [
    [auditorium, "auditorium"],
    [foodandbeverage, "foodandbeverage"],
    [mainlobby, "mainlobby"],
    [dancestudio, "dancestudio"],
    [multihall, "multihall"],
    [gym, "gym"],
    [kitchen, "kitchen"],
    [classroom, "classroom"],
  ];

  const selectedArray = venueArray
    .filter(([value]) => value === 1)
    .map(([_, name]) => name);

  console.log("Date:", event_day);
  console.log("Selected venues:", selectedArray);

  try {
    const overlappingVenues = await new Promise((resolve, reject) => {
      const venueConditions = selectedArray.map((venue) => `${venue} = 1`).join(' OR ');

      db1.query(
        `SELECT * FROM calendar_input WHERE event_day = ? AND 
         ((CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) OR 
          (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) OR 
          (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time)) AND 
         (${venueConditions})`,
        [event_day, start_time, start_time, end_time, end_time, start_time, end_time],
        (error, results) => {
          if (error) {
            reject(error);
            console.log("Error executing the query:", error);
          } else {
            console.log("Overlapping events in selected venues:", results);

            // If there are overlapping events, reject the promise with an error message
            if (results.length > 0) {
              reject('Overlapping event found in selected venues. Please choose a different time.');
            } else {
              console.log("Success");
              resolve(results);
            }
          }
        }
      );
    });

    // Do something with the results if needed
    console.log("Results:", results);
  } catch (error) {
    console.error("Error:", error);
    // Handle the error appropriately
  }
};

// Call the function
rasatesting2();
