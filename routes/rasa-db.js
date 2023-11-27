const sql = require("mysql2");
const dotenv = require("dotenv").config();
const db1 = sql.createConnection({
    host: process.env.DATABASE_HOST1,
    user: process.env.DATABASE_USER1,
    password: process.env.DATABASE_PASSWORD1,
    database: process.env.DATABASE1
})

function getTemporaryInputtedRowCount(callback) {
    const query = "SELECT COUNT(*) as rowCount FROM temporary_inputted_table";
    pool.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      const rowCount = results[0].rowCount;
      callback(null, rowCount);
    });
  }
  
  function resetAndDeleteTemporaryInputtedTable(callback) {
    const resetQuery = "ALTER TABLE temporary_inputted_table AUTO_INCREMENT = 1";
    const deleteQuery = "DELETE FROM temporary_inputted_table";
    
    pool.query(resetQuery, (resetErr) => {
      if (resetErr) {
        return callback(resetErr);
      }
  
      pool.query(deleteQuery, (deleteErr) => {
        if (deleteErr) {
          return callback(deleteErr);
        }
  
        callback(null);
      });
    });
  }


/*
const db1 = sql.createConnection({
    host: process.env.DATABASE_HOST1,
    user: process.env.DATABASE_USER1,
    password: process.env.DATABASE_PASSWORD1
})
db1.query(`SHOW DATABASES LIKE '${process.env.DATABASE1}';`, (error, result) => 
{
    if (error || result.length == 0)
    {
        db1.query(`CREATE DATABASE ${process.env.DATABASE1}`, (error, result) => {
            db1.changeUser({database: process.env.DATABASE1}, (error) => {
                createTablesIfNotExist();
            });
        });
    }
    else
    {
        db1.changeUser({database: process.env.DATABASE1}, (error) => {
            createTablesIfNotExist();
        });
    }
});

function createTablesIfNotExist()
{
    db1.query("SELECT * FROM archieved_inputted_table2", (error, result) => {
        if (error)
        {
            db1.query("CREATE TABLE archieved_inputted_table2(rasa_id int(11) NOT NULL, full_name varchar(255) NOT NULL, event_day date NOT NULL, event_name varchar(255) NOT NULL, event_description varchar(255) NOT NULL, start_time time NOT NULL, end_time time NOT NULL, rasa_status varchar(255) NOT NULL);");
        }
    });
}
*/
module.exports = {
    getTemporaryInputtedRowCount,
    resetAndDeleteTemporaryInputtedTable,
    db1
};