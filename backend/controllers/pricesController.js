const Price = require("../models/Price");

// Get latest prices for all crops
exports.getLatestPrices = async (req, res) => {
  try {
    const { crop } = req.query;

    let matchQuery = {};
    if (crop) matchQuery.crop = crop;

    const latestPrices = await Price.aggregate([
      { $match: matchQuery },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: {
            crop: "$crop",
            variety: "$variety",
            market: "$market",
          },
          price: { $first: "$price" },
          unit: { $first: "$unit" },
          date: { $first: "$date" },
          source: { $first: "$source" },
        },
      },
      {
        $project: {
          _id: 0,
          crop: "$_id.crop",
          variety: "$_id.variety",
          market: "$_id.market",
          price: 1,
          unit: 1,
          date: 1,
          source: 1,
        },
      },
      { $sort: { crop: 1, variety: 1 } },
    ]);

    res.json(latestPrices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get price history for a specific crop/variety
exports.getPriceHistory = async (req, res) => {
  try {
    const { crop, variety, market, startDate, endDate, limit = 30 } = req.query;

    let query = {};
    if (crop) query.crop = crop;
    if (variety) query.variety = variety;
    if (market) query.market = market;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const priceHistory = await Price.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select("-__v");

    res.json(priceHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get price trends and analytics
exports.getPriceTrends = async (req, res) => {
  try {
    const { crop, variety, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let matchQuery = { date: { $gte: startDate } };
    if (crop) matchQuery.crop = crop;
    if (variety) matchQuery.variety = variety;

    const trends = await Price.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            crop: "$crop",
            variety: "$variety",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
              },
            },
          },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Calculate price change percentage
    const processedTrends = trends.map((trend, index) => {
      let priceChange = 0;
      let priceChangePercent = 0;

      if (index > 0) {
        const prevPrice = trends[index - 1].avgPrice;
        priceChange = trend.avgPrice - prevPrice;
        priceChangePercent = ((priceChange / prevPrice) * 100).toFixed(2);
      }

      return {
        ...trend,
        priceChange,
        priceChangePercent: parseFloat(priceChangePercent),
      };
    });

    res.json(processedTrends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new price data (for admin or automated systems)
exports.addPriceData = async (req, res) => {
  try {
    const { prices } = req.body; // Array of price objects

    if (!Array.isArray(prices)) {
      return res.status(400).json({ message: "Prices should be an array" });
    }

    const savedPrices = await Price.insertMany(prices);
    res.status(201).json({
      message: `${savedPrices.length} price records added successfully`,
      prices: savedPrices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get market comparison
exports.getMarketComparison = async (req, res) => {
  try {
    const { crop, variety } = req.query;

    if (!crop || !variety) {
      return res.status(400).json({ message: "Crop and variety are required" });
    }

    const comparison = await Price.aggregate([
      {
        $match: {
          crop,
          variety,
          date: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
          },
        },
      },
      {
        $group: {
          _id: "$market",
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          latestPrice: { $last: "$price" },
          latestDate: { $last: "$date" },
          unit: { $first: "$unit" },
        },
      },
      { $sort: { avgPrice: -1 } },
    ]);

    res.json(comparison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get price alerts (prices above/below thresholds)
exports.getPriceAlerts = async (req, res) => {
  try {
    const { crop, minPrice, maxPrice } = req.query;

    let matchQuery = {};
    if (crop) matchQuery.crop = crop;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchQuery.date = { $gte: today };

    const alerts = await Price.find(matchQuery);

    const filteredAlerts = alerts.filter((price) => {
      if (minPrice && price.price < parseFloat(minPrice)) return true;
      if (maxPrice && price.price > parseFloat(maxPrice)) return true;
      return false;
    });

    res.json(filteredAlerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Demo API endpoint (generates sample data)
exports.getDemoData = async (req, res) => {
  try {
    const demoData = [
      {
        crop: "Coffee",
        variety: "Arabica Parchment",
        market: "Chikmagalur",
        price: 24250,
        unit: "50kg",
        date: new Date(),
        source: "Demo API",
      },
      {
        crop: "Coffee",
        variety: "Robusta Cherry",
        market: "Sakleshpur",
        price: 8200,
        unit: "50kg",
        date: new Date(),
        source: "Demo API",
      },
      {
        crop: "Black Pepper",
        variety: "Malabar",
        market: "Kodagu",
        price: 650,
        unit: "kg",
        date: new Date(),
        source: "Demo API",
      },
    ];

    res.json(demoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
