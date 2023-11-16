const db = require("../routes/rasa-db");
const bcrypt = require("bcryptjs");

const register = async(req , res) =>{
    const {email , password: Npassword, role} = req.body
    if(!email || !Npassword) return res.json({status:"error", error:"Please Enter your Email and Password"});
    else{
        console.log(email);
        db.query('SELECT email FROM user WHERE email = ?' , [email] ,async (err, results ) => {
            if(err) throw err;
            if(results[0]) return res.json({status:"error", error:"Email already been registered"})
            else{
                console.log(Npassword, "non-crypted password");
                const password1 = await bcrypt.hash(Npassword, 8);
                console.log(password1);
                db.query('INSERT INTO user SET ?', {email:email,password:password1, role:"regular", pending: 0}, (error, results) => {
                    if(error) throw error;
                    return res.json({ status: "success", success: "User has been registered" })
                })
            }
        })
    }
}
module.exports = register;
