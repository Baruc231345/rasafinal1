router.get("/ejsrasaVanilla/:id", (req, res) => {
    const id = req.params.id;
    const universalId = req.session.universalId;
    const query1 = "SELECT * FROM inputted_table WHERE id = ?";
    const query2 = "SELECT * FROM inventory_table WHERE inventory_id = ?";
    const query3 = `SELECT * FROM calendar_input WHERE event_day = ? AND 
      ((CAST(? AS TIME) >= start_time AND CAST(? AS TIME) < end_time) OR 
      (CAST(? AS TIME) > start_time AND CAST(? AS TIME) <= end_time) OR 
      (CAST(? AS TIME) <= start_time AND CAST(? AS TIME) >= end_time))
    `;
  
    db1.query(query1, [id], (error, data1) => {
      if (error) {
        throw error;
      } else {
        if (data1.length > 0) {
          const { event_day, start_time, end_time } = data1[0];
          db1.query(
            query3,
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
                console.error(
                  "Error fetching data from calendar_input:",
                  error
                );
                throw error;
              }
              
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

                db1.query(query2, [id], (error, data2) => {
                  if (error) {
                    console.error(
                      "Error fetching data from inventory_table:",
                      error
                    );
                    throw error;
                  }
  
                  if (data2.length > 0) {
                    const totalAvailable_Chair = data2[0].chairs_max - totalChairQuantity ; //  1000 max chairs - 900 Accumulated Chairs
                    const totalAvailable_Table = data2[0].table_max - totalTableQuantity;
                    const totalAvailable_Lcd = data2[0].lcd_max - totalLcdQuantity;
                    const totalAvailable_Widescreen = data2[0].widescreen_max - totalWidescreenQuantity;
                    const totalAvailable_SoundSystem = data2[0].sound_system_max - totalSoundSystemQuantity;
                    const totalAvailable_Blackpanel = data2[0].blackpanel_max - totalBlackpanelQuantity;
                    const totalAvailable_Whiteboard = data2[0].whiteboard_max - totalWhiteboardQuantity;
                    const totalAvailable_Microphone = data2[0].microphone_max - totalMicrophoneQuantity;

  
                    // Data retrieval successful, render the template
                    const datainputted = data1[0];
                    const datainventory = data2[0];
                    res.locals.id = id;
                    res.render("submitrasaCopy", {
                      id,
                      datainputted,
                      datainventory,
                      universalId,
                      totalAvailable_Chair,
                      totalAvailable_Table,
                      totalAvailable_Lcd,
                      totalAvailable_Widescreen,
                      totalAvailable_SoundSystem,
                      totalAvailable_Blackpanel,
                      totalAvailable_Whiteboard,
                      totalAvailable_Microphone,
                    });
                } else {
                  res.status(404).send("Data from second table not found");
                }
              });
            }
          );
        } else {
          res.status(404).send("Data from first table not found");
        }
      }
    });
  });
  