const db1 = require("../routes/rasa-db");

function checkSufficient(id, callback) {
  db1.query(
    "SELECT event_day, start_time, end_time FROM inputted_table WHERE id = ?",
    [id],
    (error, result) => {
      if (error) {
        console.error("Error executing the query:", error);
        return callback(error, null);
      }
      const [row] = result;
      if (row) {
        const { event_day, start_time, end_time } = row;

        // Now, perform the third query to get chair_quantity and max_chair from inventory_table
        db1.query(
          "SELECT * FROM inventory_table WHERE inventory_id = ?",
          [id],
          (error, inventoryData) => {
            if (error) {
              console.error("Error executing the query:", error);
              return callback(error, null);
            }

            // Perform the second query to check for overlapping events
            db1.query(
              `SELECT * FROM calendar_input WHERE event_day = ? AND 
           ((CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) OR 
            (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) OR 
            (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time))`,
              [
                event_day,
                start_time,
                start_time,
                end_time,
                end_time,
                start_time,
                end_time,
              ],
              (error, overlappingEvents) => {
                if (error) {
                  console.error("Error executing the query:", error);
                  return callback(error, null);
                }

                console.log(
                  "Overlapping events in calendar_input:",
                  overlappingEvents
                );
                console.log("Inventory data from user's inventory_table:", inventoryData);

                // Calculate the sum of chair_quantity from overlapping events
                const totalChairQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.chair_quantity,0
                );

                const totalSoundSystemQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.sound_system_quantity,0
                );

                const totalMicrophoneQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.microphone_quantity,0
                );

                const totalLcdQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.lcd_quantity,0
                );

                const totalWidescreenQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.widescreen_quantity,0
                );

                const totalTableQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.table_quantity,0
                );

                const totalBlackpanelQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.blackpanel_quantity,0
                );

                const totalWhiteboardQuantity = overlappingEvents.reduce(
                  (total, event) => total + event.whiteboard_quantity,0
                );

                console.log("Total Accumulated Chair from Overlapped Event", totalChairQuantity);
                console.log("Total Accumulated Table from Overlapped Event", totalTableQuantity);
                console.log("Total Accumulated LCD from Overlapped Event", totalLcdQuantity);
                console.log("Total Accumulated Widescreen from Overlapped Event", totalWidescreenQuantity);
                console.log("Total Accumulated Sound System from Overlapped Event", totalSoundSystemQuantity);
                console.log("Total Accumulated Black Panel from Overlapped Event", totalBlackpanelQuantity);
                console.log("Total Accumulated Whiteboard from Overlapped Event", totalWhiteboardQuantity);

                // Calculate total available chairs
                const totalAvailable_Chair = inventoryData[0].chairs_max - totalChairQuantity ; //  1000 max chairs - 900 Accumulated Chairs
                const totalAvailable_Table = inventoryData[0].table_max - totalTableQuantity;
                const totalAvailable_Lcd = inventoryData[0].lcd_max - totalLcdQuantity;
                const totalAvailable_Widescreen = inventoryData[0].widescreen_max - totalWidescreenQuantity;
                const totalAvailable_SoundSystem = inventoryData[0].sound_system_max - totalSoundSystemQuantity;
                const totalAvailable_Blackpanel = inventoryData[0].blackpanel_max - totalBlackpanelQuantity;
                const totalAvailable_Whiteboard = inventoryData[0].whiteboard_max - totalWhiteboardQuantity;
                const totalAvailable_Microphone = inventoryData[0].microphone_max - totalMicrophoneQuantity;

                if (totalAvailable_Chair <= inventoryData[0].chair_quantity) {
                  console.log("Sufficient Chairs");
                  console.log(totalAvailable_Chair ,"<=", inventoryData[0].chair_quantity)
                }

                if (totalAvailable_Table <= inventoryData[0].table_quantity) {
                  console.log("Sufficient Table");
                  console.log(totalAvailable_Table ,"<=", inventoryData[0].table_quantity)
                }

                if (totalAvailable_Lcd <= inventoryData[0].lcd_quantity) {
                  console.log("Sufficient LCD");
                  console.log(totalAvailable_Lcd ,"<=", inventoryData[0].lcd_quantity)
                }

                if (totalAvailable_Widescreen <= inventoryData[0].widescreen_quantity) {
                  console.log("Sufficient Widescreen");
                  console.log(totalAvailable_Widescreen ,"<=", inventoryData[0].widescreen_quantity)
                }

                if (totalAvailable_SoundSystem <= inventoryData[0].sound_system_quantity) {
                  console.log("Sufficient Sound System");
                  console.log(totalAvailable_SoundSystem ,"<=", inventoryData[0].sound_system_quantity)
                }

                if (totalAvailable_Blackpanel <= inventoryData[0].blackpanel_quantity) {
                  console.log("Sufficient Blackpanel");
                  console.log(totalAvailable_Blackpanel ,"<=", inventoryData[0].blackpanel_quantity)
                }

                if (totalAvailable_Whiteboard <= inventoryData[0].whiteboard_quantity) {
                  console.log("Sufficient Whiteboard");
                  console.log(totalAvailable_Whiteboard ,"<=", inventoryData[0].whiteboard_quantity)
                }

                callback(null, {
                  inputData: {
                    eventDay: event_day,
                    startTime: start_time,
                    endTime: end_time,
                  },
                  overlappingEvents: overlappingEvents,
                  inventoryData: inventoryData,
                  totalChairQuantity: totalChairQuantity,
                  totalAvailable_Chair: totalAvailable_Chair,
                  totalSoundSystemQuantity: totalSoundSystemQuantity,
                  totalAvailable_SoundSystem: totalAvailable_SoundSystem,
                  totalMicrophoneQuantity: totalMicrophoneQuantity,
                  totalAvailable_Microphone: totalMicrophoneQuantity,
                  totalLcdQuantity: totalLcdQuantity,
                  totalAvailable_Lcd: totalAvailable_Lcd,
                  totalWidescreenQuantity: totalWidescreenQuantity,
                  totalAvailable_Widescreen: totalAvailable_Widescreen,
                  totalTableQuantity: totalTableQuantity,
                  totalAvailable_Table: totalAvailable_Table,
                  totalBlackpanelQuantity: totalBlackpanelQuantity,

                  totalWhiteboardQuantity: totalWhiteboardQuantity,
                });
              }
            );
          }
        );
      } else {
        // If no row is found, you might want to callback with an error or appropriate message
        const noDataRowError = new Error("No data found for the specified ID.");
        console.error(noDataRowError.message);
        return callback(noDataRowError, null);
      }
    }
  );
}

// Call the function with an example ID
checkSufficient(500, (error, queryResult) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Overlapped Found");
    console.log("Total Chair Quantity from Overlapping Events:", queryResult.totalChairQuantity);
    console.log("Total Available Chair:", queryResult.totalAvailable_Chair);

    console.log(`Chair Quantity from Rasa ${500} = `, queryResult.inventoryData[0].chair_quantity); // Chair Quantity from inputted_table
    console.log(`Total Available Chair from calendar_input = `, queryResult.totalAvailable_Chair ); // Total Available Chair from calendar_input
    
    let resultDifference = queryResult.totalAvailable_Chair - queryResult.inventoryData[0].chair_quantity;
    console.log(resultDifference);
  }
});
