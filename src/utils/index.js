const getRandomArray = (arr, length) => {
  if (arr.length < length) return false;

  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, length);
};

module.exports = {
  getRandomArray,
};