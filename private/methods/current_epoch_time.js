const current_epoch_time = () => {
  const epochTimeMilliseconds = Date.now();
  const epochTimeSeconds10Digit = Math.floor(epochTimeMilliseconds / 1000);
  return epochTimeSeconds10Digit;
};

const expire_epoch_time = () => {
  const epochTimeMilliseconds = Date.now();
  const futureEpochTimeMilliseconds = epochTimeMilliseconds + 5 * 60 * 1000; // 5 minutes in milliseconds
  const futureEpochTimeSeconds = Math.floor(futureEpochTimeMilliseconds / 1000);
  return futureEpochTimeSeconds;
};

module.exports = { current_epoch_time, expire_epoch_time };
