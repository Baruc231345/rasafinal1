const db1 = require("../routes/rasa-db");

function getEvents(event_day, start_time, end_time, callback) {
  const query = `
    SELECT *, 
      SUM(table_quantity) as totalTables, 
      SUM(chair_quantity) as totalChairs 
    FROM calendar_input 
    WHERE event_day = ? AND 
    (
      (CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) OR 
      (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) OR 
      (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time)
    )
  `;

  db1.query(
    query,
    [
      event_day,
      start_time,
      start_time,
      end_time,
      end_time,
      start_time,
      end_time,
    ],
    (error, results) => {
      if (error) {
        callback(error, null);
        return;
      }

      // Extract the sum values from the first result (assuming only one row is returned)
      const totalTables = results.length > 0 ? results[0].totalTables : 0;
      const totalChairs = results.length > 0 ? results[0].totalChairs : 0;

      callback(null, {
        results,
        totalTables,
        totalChairs,
      });
    }
  );
}

// Example usage
getEvents('2023-12-30', '01:00:00', '24:00:00', (error, results) => {
  if (error) {
    console.error(error);
  } else {
    console.log("this is the results2");
    console.log(results);
  }
});
