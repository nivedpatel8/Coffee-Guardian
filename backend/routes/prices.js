const express = require("express");
const { body } = require("express-validator");
const pricesController = require("../controllers/pricesController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// Validation middleware for price data
const priceValidation = [
  body("prices").isArray().withMessage("Prices must be an array"),
  body("prices.*.crop")
    .isIn(["Coffee", "Black Pepper"])
    .withMessage("Invalid crop"),
  body("prices.*.variety").notEmpty().trim().withMessage("Variety is required"),
  body("prices.*.market").notEmpty().trim().withMessage("Market is required"),
  body("prices.*.price").isNumeric().withMessage("Price must be a number"),
  body("prices.*.unit").notEmpty().trim().withMessage("Unit is required"),
  body("prices.*.date")
    .optional()
    .isISO8601()
    .withMessage("Valid date required"),
  body("prices.*.source").optional().trim(),
];

const alertValidation = [
  body("crop")
    .optional()
    .isIn(["Coffee", "Black Pepper"])
    .withMessage("Invalid crop"),
  body("minPrice")
    .optional()
    .isNumeric()
    .withMessage("Min price must be a number"),
  body("maxPrice")
    .optional()
    .isNumeric()
    .withMessage("Max price must be a number"),
];

// Public routes (accessible without authentication for basic price info)
router.get("/demo", pricesController.getDemoData);

// Protected routes (require authentication)
router.use(auth);

// Get latest prices for all crops
router.get("/latest", pricesController.getLatestPrices);

// Get price history for specific crop/variety
router.get("/history", pricesController.getPriceHistory);

// Get price trends and analytics
router.get("/trends", pricesController.getPriceTrends);

// Get market comparison
router.get("/comparison", pricesController.getMarketComparison);

// Get price alerts
router.get("/alerts", alertValidation, pricesController.getPriceAlerts);

// Admin routes (require admin privileges)
router.use(admin);

// Add new price data (for admin or automated systems)
router.post("/", priceValidation, pricesController.addPriceData);

// Bulk price update endpoint
router.post(
  "/bulk-update",
  [
    body("prices").isArray().withMessage("Prices must be an array"),
    body("prices.*.crop").notEmpty().withMessage("Crop is required"),
    body("prices.*.variety").notEmpty().withMessage("Variety is required"),
    body("prices.*.price").isNumeric().withMessage("Price must be a number"),
  ],
  async (req, res) => {
    try {
      const { prices } = req.body;
      const savedPrices = [];

      for (const priceData of prices) {
        const existingPrice = await Price.findOneAndUpdate(
          {
            crop: priceData.crop,
            variety: priceData.variety,
            market: priceData.market,
            date: priceData.date || new Date(),
          },
          priceData,
          { upsert: true, new: true }
        );
        savedPrices.push(existingPrice);
      }

      res.json({
        message: `${savedPrices.length} price records updated successfully`,
        prices: savedPrices,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
