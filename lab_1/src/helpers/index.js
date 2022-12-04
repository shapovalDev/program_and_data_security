import {
  ASCII,
  backIPTable,
  C0,
  D0,
  ENTROPY_BLOCK_SIZE,
  ETable,
  IPTable,
  KEY,
  keyTable,
  PTable,
  shifts,
  STables,
} from "../constants";

export const encrypt = (text) => {
  const binText = textToBinary(text);
  const blocks = splitBinTextByBlocks(binText);
  const IPBlocks = blocks.map((block) => initialPermutation(block));
  const encryptedBlocks = [];
  let entropyRounds;
  for (let block of IPBlocks) {
    let encryptedBlock = feistelCycles(block);
    entropyRounds = encryptedBlock.entropyRounds;
    encryptedBlocks.push(finalPermutation(encryptedBlock.blockBits));
  }
  const encryptedText = encryptedBlocks.join("");
  console.log("Encrypted data:", binaryToText(encryptedText));
  return {
    entropyRounds: entropyRounds,
    encryptedText: binaryToText(encryptedText),
    original: binaryToText(binText),
  };
};

export const decrypt = (text) => {
  const binText = textToBinary(text);
  const blocks = splitBinTextByBlocks(binText);
  const IPBlocks = blocks.map((block) => initialPermutation(block));
  const decryptedBlocks = [];
  for (let block of IPBlocks) {
    let decryptedBlock = feistelCyclesDecrypt(block);
    decryptedBlocks.push(finalPermutation(decryptedBlock));
  }
  const decryptedText = decryptedBlocks.join("");

  console.log("Decrypted data:", binaryToText(decryptedText));
};

const textToBinary = (text) => {
  return text
    .split("")
    .map((char) => extendBinChar(char.charCodeAt(0).toString(2)))
    .join("");
};

const binaryToText = (text) => {
  let unicodeText = "";
  for (let i = 0; i < text.length; i += ASCII) {
    const binChar = text.slice(i, i + ASCII);
    unicodeText += String.fromCharCode(parseInt(binChar, 2));
  }
  return unicodeText;
};

const extendBinChar = (charBin) => {
  let result = charBin;
  if (charBin.length < ASCII) {
    while (result.length !== ASCII) {
      result = "0" + result;
    }
  }
  return result;
};

const extendBinToFour = (bin) => {
  let result = bin;
  if (bin.length < 4) {
    while (result.length !== 4) {
      result = "0" + result;
    }
  }
  return result;
};

const splitBinTextByBlocks = (binText) => {
  let blocks = [];
  let temp = "";
  for (let char of binText) {
    temp += char;
    if (temp.length === 64) {
      blocks.push(temp);
      temp = [];
    }
  }
  if (temp.length && temp.length < 64) {
    blocks.push(extendBlock(temp));
  }
  return blocks;
};

const extendBlock = (block) => {
  while (block.length < 64) {
    block += "0";
  }
  return block;
};

const initialPermutation = (block) => {
  let permutatedBlock = "";
  for (let bit of IPTable) {
    permutatedBlock += block[bit - 1];
  }
  return permutatedBlock;
};

const finalPermutation = (block) => {
  let permutatedBlock = [];
  for (let bit of backIPTable) {
    permutatedBlock.push(block[bit - 1]);
  }
  return permutatedBlock.join("");
};

const feistelCycles = (block) => {
  let temp = [block.slice(0, 32), block.slice(32, 64)];
  const preparedKey = prepareKey(KEY);
  const entropyRounds = [];
  let { C, D } = createInitialKeyBlocks(preparedKey);
  const keys = generateKeys(C, D);
  let entropyArray = calculateEntropy(temp.join(""));
  entropyRounds.push(
    (
      entropyArray.reduce((accum, value) => (accum += +value), 0) /
      ENTROPY_BLOCK_SIZE
    ).toFixed(3)
  );
  for (let i = 0; i < 16; i++) {
    const generatedKey = keys[i];
    let L = temp[1];
    let R = bitXor(temp[0], feistelFunc(temp[1], generatedKey));
    temp = [L, R];
    entropyArray = calculateEntropy(temp.join(""));
    entropyRounds.push(
      (
        entropyArray.reduce((accum, value) => (accum += +value), 0) /
        ENTROPY_BLOCK_SIZE
      ).toFixed(3)
    );
  }
  temp = [temp[1], temp[0]];
  const blockBits = temp.join("");
  return { blockBits: blockBits, entropyRounds: entropyRounds };
};

const feistelCyclesDecrypt = (block) => {
  let temp = [block.slice(0, 32), block.slice(32, 64)];
  const preparedKey = prepareKey(KEY);
  let { C, D } = createInitialKeyBlocks(preparedKey);
  const keys = generateKeys(C, D);
  temp = [temp[1], temp[0]];

  for (let i = 15; i >= 0; i--) {
    const generatedKey = keys[i];
    let R = temp[0];
    let L = bitXor(temp[1], feistelFunc(temp[0], generatedKey));
    temp = [L, R];
  }
  const blockBits = temp.join("").split("");

  return blockBits;
};

const bitXor = (a, b) => {
  let result = "";
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      result += "0";
    } else {
      result += "1";
    }
  }
  return result;
};

const feistelFunc = (R, key) => {
  const extendedR = extendE(R).join("");
  const rXorKey = bitXor(extendedR, key);
  const sixBitBlocks = [];
  for (let i = 0; i < rXorKey.length; i += 6) {
    sixBitBlocks.push(rXorKey.slice(i, i + 6));
  }
  const fourBitBlocks = converToFourBits(sixBitBlocks);
  const joinedFourBitBlocks = fourBitBlocks.join("");
  const permutedBlock = blockPermutation(joinedFourBitBlocks);
  return permutedBlock;
};

const extendE = (block) => {
  let result = [];
  for (let bit of ETable) {
    result.push(block[bit - 1]);
  }
  return result;
};

const converToFourBits = (sixBitBlocks) => {
  let fourBitBlocks = [];
  for (let i = 0; i < sixBitBlocks.length; i++) {
    const block = sixBitBlocks[i];
    const lastIndex = block.length - 1;
    const firstLast = parseInt(block[0] + block[lastIndex], 2);
    const medium = parseInt(block.slice(1, lastIndex), 2);
    const newBlock = STables[i][firstLast][medium].toString(2);
    fourBitBlocks.push(extendBinToFour(newBlock));
  }
  return fourBitBlocks;
};

const blockPermutation = (block) => {
  let permuted = [];
  for (let bit of PTable) {
    permuted.push(block[bit - 1]);
  }
  return permuted.join("");
};

const prepareKey = (key) => {
  if (key.length !== 56) return;
  let keyBytes = [];
  let temp = "";
  let onesInByte = 0;
  for (let i = 0; i < key.length; i++) {
    temp += key[i];
    if (key[i] === "1") {
      onesInByte++;
    }
    if (temp.length === 7) {
      if (onesInByte % 2 === 0) {
        temp += "1";
      } else {
        temp += "0";
      }
      keyBytes.push(temp);
      temp = "";
      onesInByte = 0;
    }
  }
  return keyBytes.join("");
};

const createInitialKeyBlocks = (key) => {
  let permutedKey = [];
  const C0D0 = C0.concat(D0);
  for (let i = 0; i < C0D0.length; i++) {
    permutedKey[i] = key[C0D0[i] - 1];
  }
  const permutedKeyString = permutedKey.join("");

  return {
    C: permutedKeyString.slice(0, 28).split(""),
    D: permutedKeyString.slice(28, 56).split(""),
  };
};

const generateKeys = (C, D) => {
  let keys = [];
  for (let i = 0; i < 16; i++) {
    keys.push(generateKey(i, C, D));
  }
  return keys;
};

const generateKey = (round, C, D) => {
  const shift = shifts[round];
  for (let i = 0; i < shift; i++) {
    C.push(C.shift());
    D.push(D.shift());
  }
  let key = [];
  const CD = C.concat(D);
  for (let bit of keyTable) {
    key.push(CD[bit - 1]);
  }
  return key.join("");
};

const calculateEntropy = (block) => {
  let bytes = [];
  let entropies = [];
  for (let i = 0; i < block.length; i += ENTROPY_BLOCK_SIZE) {
    bytes.push(block.slice(i, i + ENTROPY_BLOCK_SIZE));
  }
  for (let i = 0; i < ENTROPY_BLOCK_SIZE; i++) {
    let zeros = 0;
    let ones = 0;
    for (let byte of bytes) {
      if (byte[i] === "1") {
        ones++;
      } else {
        zeros++;
      }
    }
    let p0 = zeros / (zeros + ones);
    let p1 = ones / (zeros + ones);
    let logp0 = p0 !== 0 ? Math.log2(p0) : 0;
    let logp1 = p1 !== 0 ? Math.log2(p1) : 0;
    entropies.push((-(p0 * logp0 + p1 * logp1)).toFixed(3));
  }
  return entropies;
};
