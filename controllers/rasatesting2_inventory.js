const db1 = require("../routes/rasa-db");

const rasatesting2_inventory = async (req, res,) => {
  const { auditorium, foodandbeverage, multihall, dancestudio, 
    gym, classroom, kitchen, mainlobby, inventory_id, sound_system, 
    sound_system_quantity, microphone, microphone_quantity, lcd, lcd_quantity,
    widescreen, widescreen_quantity, chair, chair_quantity, table_input, table_quantity,
    other, other_quantity, blackpanel, blackpanel_quantity, whiteboard, whiteboard_quantity, aircon, 
    start_aircon, end_aircon} = req.body;
  try {
    const results = await new Promise((resolve, reject) => {
      db1.query('INSERT INTO inventory_table SET ?', {
        inventory_id: inventory_id,
        auditorium: auditorium,
        foodandbeverage: foodandbeverage,
        multihall: multihall,
        dancestudio: dancestudio,
        gym: gym,
        classroom: classroom,
        kitchen: kitchen,
        mainlobby: mainlobby,
        sound_system: sound_system,
        sound_system_quantity: sound_system_quantity,
        microphone: microphone,
        microphone_quantity: microphone_quantity,
        lcd: lcd,
        lcd_quantity: lcd_quantity,
        widescreen: widescreen,
        widescreen_quantity: widescreen_quantity, 
        chair: chair, 
        chair_quantity: chair_quantity,
        table_input: table_input,
        table_quantity: table_quantity,
        other: other,
        other_quantity: other_quantity,
        blackpanel: blackpanel,
        blackpanel_quantity: blackpanel_quantity,
        whiteboard: whiteboard,
        whiteboard_quantity: whiteboard_quantity,
        aircon: aircon,
        start_aircon: start_aircon,
        end_aircon: end_aircon,

      }, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    console.log(results + "OFFICIAL INVENTORY TABLE.js");
    const insertedId = results.insertId; 
    console.log(insertedId + "wtf is this?"); 
    return res.json({
      status: "success",
      inventory_Id: insertedId,
      success: "Successfully Inputted"
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = rasatesting2_inventory;