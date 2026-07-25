const random_number = () => {
    let currentTimeMillis = new Date().getTime();
    let randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return currentTimeMillis + randomNum;
  };
  module.exports = { random_number };
  