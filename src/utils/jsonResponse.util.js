const jsonResponse = (data, status, message) => {
  try {
    const data = JSON.parse(data);
    return {
      data,
      status: status.status,
      message,
    };
  } catch (error) {
    return {
      data,
      status: status.status,
      message,
    };
  }
};

module.exports = { jsonResponse };
