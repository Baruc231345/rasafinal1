let number = 2; 

var noteForm = [
  [1, "rasa_note"],
  [2, "rasa_note2"],
  [3, "rasa_note3"],
  [4, "rasa_note4"],
  [5, "rasa_note5"],
];
const x = noteForm.find(item => item[0] === number);

if (x) {
  console.log("Final Note:", x[1]);
  let finalNote = x[1];
  console.log(finalNote)
}