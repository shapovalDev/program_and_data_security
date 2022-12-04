const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const fs = require("fs");
const crypto = require("crypto");

const {
  getInitialHash,
  convertToBinaryHash,
  getLastBits,
} = require("./services");

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hi");
});
app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).json({ msg: "File wasn't uploaded" });
  }

  const file = req.files.file;
  let initialHash;
  let binaryInitHash;
  let counter = 0;
  const iterations = [0, 0, 0];
  const flags = [false, false, false];
  const finalBits = [];

  file.mv(`${__dirname}/uploads/${file.name}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    } else {
      const data = fs.readFileSync(
        `${__dirname}/uploads/${file.name}`,
        "utf-8"
      );
      initialHash = getInitialHash(data);
      binaryInitHash = convertToBinaryHash(initialHash);
      const initialLastBits = getLastBits(binaryInitHash);
      console.log(initialHash, "\n\n", binaryInitHash, "\n\n", initialLastBits);

      while (flags.some((elem) => !elem)) {
        fs.appendFileSync(`${__dirname}/uploads/${file.name}`, " ", "utf-8");
        const newData = fs.readFileSync(
          `${__dirname}/uploads/${file.name}`,
          "utf-8"
        );
        const newHash = getInitialHash(newData);
        const newBinaryHash = convertToBinaryHash(newHash);
        const newHashes = getLastBits(newBinaryHash);

        if (initialLastBits[0] === newHashes[0] && !flags[0]) {
          flags[0] = true;
          iterations[0] = counter;
          finalBits.push(newHashes[0]);
        }

        if (initialLastBits[1] === newHashes[1] && !flags[1]) {
          flags[1] = true;
          iterations[1] = counter;
          finalBits.push(newHashes[1]);
        }

        if (initialLastBits[2] === newHashes[2] && !flags[2]) {
          flags[2] = true;
          iterations[2] = counter;
          finalBits.push(newHashes[2]);
        }
        counter++;
      }
      return res.json({
        initialHash: initialHash,
        binaryInitHash: binaryInitHash,
        initialLastBits: initialLastBits,
        iterations: iterations,
        finalBits: finalBits,
      });
    }
  });
});

app.listen(8081, () => console.log("Server was started"));
