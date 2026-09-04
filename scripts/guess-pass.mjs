import bcrypt from "bcryptjs";

const hash = "$2a$12$QqnAxZKEGWct8kg9K7IhUeanRppClxkmaEDFv63r.hUAG4NT4ReqC";
const guesses = [
  "1331",
  "123456",
  "12345678",
  "password",
  "bhavish",
  "bhavish1331",
  "kumar1331",
  "bkumar1331",
  "Bhavish@1331",
  "bhavish@1331",
  "9730441331",
  "demo123",
  "Admin@123",
  "Bhavish123",
  "Bhavish@123",
  "mahaexam",
  "mahaexam123",
];

for (const g of guesses) {
  if (bcrypt.compareSync(g, hash)) {
    console.log("MATCH FOUND for mr.bkumar1331@gmail.com:", g);
    process.exit(0);
  }
}
console.log("No match found in quick list");
