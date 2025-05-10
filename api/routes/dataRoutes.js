const router = require("express").Router();
const { dataHandler, healthCheck } = require("../controllers/dataController");

router.post("/data", dataHandler);
router.get("/", healthCheck);

module.exports = router;
