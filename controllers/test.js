let number = 2;

var numberForm = [
  [0, "verification"],
  [1, "verification2"],
  [2, "verification3"],
  [3, "verification4"],
  [4, "verification5"],
  [5, "verification6"],
];

const x = numberForm.find(item => item[0] === number);
let finalVerification;
if (x) {
  console.log("Verification:", x[1]);
  finalVerification = x[1];
} else {
  console.log("Verification");
}