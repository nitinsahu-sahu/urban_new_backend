const generateRandom4DigitNumber = () => {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return randomNumber;
};

module.exports = {
  generateRandom4DigitNumber,
};
