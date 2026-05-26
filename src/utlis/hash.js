const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashValue = async (value) => {
  return await bcrypt.hash(value, SALT_ROUNDS);
};

const compareHash = async (plainValue, hashedValue) => {
  return await bcrypt.compare(plainValue, hashedValue);
};

module.exports = {
  hashValue,
  compareHash,
};