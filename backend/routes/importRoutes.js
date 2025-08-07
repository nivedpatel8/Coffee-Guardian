const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");
const auth = require("../middleware/auth"); // Your existing auth middleware
const importController = require("../controllers/importController");

// Apply auth middleware to all routes
router.use(auth);

// Download template routes
router.get("/template/:type/:format", importController.downloadTemplate);

// Import routes
router.post(
  "/preview/:type",
  upload.single("file"),
  importController.previewImport
);
router.post(
  "/import/:type",
  upload.single("file"),
  importController.importData
);

// Import history
router.get("/history", importController.getImportHistory);

module.exports = router;
