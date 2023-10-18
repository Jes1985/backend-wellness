const jsonResponse = (message, success, data) => ({
  success,
  message,
  data,
});

module.exports = { jsonResponse };
