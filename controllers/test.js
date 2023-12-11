let email = "baruc.231345@globalcity.sti.edu.ph"

  var accounts = [
    ["baruc.231345@globalcity.sti.edu.ph", 7],
    ["baruc.231345@globalcity.sti.edu.ph", 8],
    ["rodillas.222275@globalcity.sti.edu.ph", 9],
    ["fonzyacera03@gmail.com", 16], // HRM Signature
    ["magistrado.222133@globalcity.sti.edu.ph", 17], // Classroom Signature
    ["no email",13] // Void Rasa
  ];

  const y = accounts.find(item => item && item[0].trim() === email.trim());

  let finalEmail;
  if (y) {
    console.log("Final Email:", y[1]);
    finalEmail = y[1];
  } else {
    console.log("Email not found 123");
    //finalEmail = "baruc.231345@globalcity.sti.edu.ph"
  }