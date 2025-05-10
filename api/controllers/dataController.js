exports.dataHandler = (req, res) => {
  res.send("hi");
};

exports.healthCheck = (req, res) => {
  res.send("Chess API is running");
};
