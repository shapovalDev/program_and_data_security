const crypto = require("crypto");
const hexToBinary = require("hex-to-binary");

const getInitialHash = (data) => {
  const initialHash = crypto.createHash("sha512").update(data).digest("hex");
  return initialHash;
};

const convertToBinaryHash = (hash) => {
  return hexToBinary(hash);
};

const getLastBits = (hash) => {
  return [
    hash.substr(hash.length - 3, 2),
    hash.substr(hash.length - 5, 4),
    hash.substr(hash.length - 9, 8),
  ];
};

module.exports = {
  getInitialHash,
  convertToBinaryHash,
  getLastBits,
};
