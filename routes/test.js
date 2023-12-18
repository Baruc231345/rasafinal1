const db1 = require("../routes/rasa-db");

async function checkOverlapped(id) {
  try {
    // First query to get selectedArray
    const selectedArray = await new Promise((resolve, reject) => {
      db1.query(`SELECT * FROM inventory_table where inventory_id = ${id}`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          const selectedColumns = [];
          const columns = ['auditorium', 'foodandbeverage', 'multihall', 'dancestudio', 'gym', 'classroom', 'kitchen', 'mainlobby'];
          columns.forEach(column => {
            const hasValueOne = results.some(row => row[column] === 1);
            if (hasValueOne) {
              selectedColumns.push(column);
            }
          });
          resolve(selectedColumns);
        }
      });
    });

    console.log(selectedArray + " === selected array ");

    // Second query to get event_day, start_time, and end_time from inputted_table
    const resultsFromSecondQuery = await new Promise((resolve, reject) => {
      db1.query(`SELECT event_day, start_time, end_time FROM inputted_table WHERE id = ${id}`, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (resultsFromSecondQuery.length > 0) {
      const { event_day, start_time, end_time } = resultsFromSecondQuery[0];
      console.log("Event Day:", event_day);
      console.log("Start Time:", start_time);
      console.log("End Time:", end_time);

      // Third query
      const venueConditions = selectedArray.map(venue => `${venue} = 1`).join(' OR ');

      db1.query(
        `SELECT * FROM calendar_input WHERE event_day = ? AND 
         ((CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) OR 
          (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) OR 
          (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time)) AND 
         (${venueConditions})`,
        [event_day, start_time, start_time, end_time, end_time, start_time, end_time],
        (error, overlappingResults) => {
          if (error) {
            console.error("Error executing the query:", error);
          } else {
            console.log("Overlapping events in calendar_input:", overlappingResults);

            if (overlappingResults.length > 0) {
              console.log("Overlapping events found. Aborting insertion.");
              return;
            } else {
              console.log("No overlapping events found. Proceed with insertion.");
            }
          }
        }
      );
    } else {
      console.log("No records found in inputted_table for id:", id);
    }
  } catch (error) {
    console.error(error);
    // Handle or log the error as needed
    //res.status(500).send("An error occurred while checking the overlapping of the venue");
  }
}

// Usage
const idToCheck = 504;
checkOverlapped(idToCheck);

