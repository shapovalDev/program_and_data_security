const express = require("express");
const cryptico = require("cryptico");
const cors = require("cors");

const app = express();
const seed = "anything you want";
const keyLength = 1024;
const keys = cryptico.generateRSAKey(seed, keyLength);
console.log(`keys`, keys);
console.log(`cryptico.publicKeyString(keys)`, cryptico.publicKeyString(keys));
app.use(cors());
app.use(express.json());
app.get("/", function (req, res) {
  res.send({ public: cryptico.publicKeyString(keys) });
});
app.post("/login", (req, res) => {
  const { e_email, e_pass } = req.body;
  console.log(e_email, e_pass);
  const email = cryptico.decrypt(e_email, keys).plaintext;
  const pass = cryptico.decrypt(e_pass, keys).plaintext;
  console.log("Decrypted email", email);
  console.log("Decrypted password", pass);
  res.status(200).json({ message: "Decrypted successfully" });
});
app.listen(3000, () => console.log("server was started"));
