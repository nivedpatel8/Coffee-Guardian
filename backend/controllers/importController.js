const ImportService = require("../services/importService");
const TemplateGenerator = require("../services/templateGenerator");

// Download template
exports.downloadTemplate = async (req, res) => {
  try {
    const { type, format = "excel" } = req.params;

    // Validate template type
    if (!["labor", "expense"].includes(type)) {
      return res.status(400).json({
        message: 'Invalid template type. Use "labor" or "expense"',
      });
    }

    // Validate format
    if (!["excel", "csv"].includes(format)) {
      return res.status(400).json({
        message: 'Invalid format. Use "excel" or "csv"',
      });
    }

    // Generate template
    const buffer =
      format === "excel"
        ? TemplateGenerator.generateExcelTemplate(type)
        : TemplateGenerator.generateCSVTemplate(type);

    // Set response headers
    const extension = format === "excel" ? "xlsx" : "csv";
    const filename = `${type}_import_template.${extension}`;
    const contentType =
      format === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({
      message: "Error generating template",
      error: error.message,
    });
  }
};

// Import data from uploaded file
exports.importData = async (req, res) => {
  try {
    const { type } = req.params;

    // Validate import type
    if (!["labor", "expense"].includes(type)) {
      return res.status(400).json({
        message: 'Invalid import type. Use "labor" or "expense"',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Parse uploaded file
    const parsedData = await ImportService.parseFile(
      req.file.buffer,
      req.file.originalname
    );

    // Import data based on type
    let results;
    if (type === "labor") {
      results = await ImportService.importLaborData(parsedData, req.userId);
    } else {
      results = await ImportService.importExpenseData(parsedData, req.userId);
    }

    // Return results
    res.json({
      message: "Import completed",
      results,
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      message: "Error importing data",
      error: error.message,
    });
  }
};

// Preview import data (validate without saving)
exports.previewImport = async (req, res) => {
  try {
    const { type } = req.params;

    // Validate import type
    if (!["labor", "expense"].includes(type)) {
      return res.status(400).json({
        message: 'Invalid import type. Use "labor" or "expense"',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Parse uploaded file
    const parsedData = await ImportService.parseFile(
      req.file.buffer,
      req.file.originalname
    );

    const { headers, rows } = parsedData;
    const preview = {
      headers,
      sampleRows: rows.slice(0, 5), // Show first 5 rows
      totalRows: rows.length,
      validationResults: [],
    };

    // Validate first few rows for preview
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const validation =
        type === "labor"
          ? ImportService.validateLaborData(rows[i], headers)
          : ImportService.validateExpenseData(rows[i], headers);

      preview.validationResults.push({
        row: i + 2,
        isValid: validation.errors.length === 0,
        errors: validation.errors,
        warnings: validation.warnings,
        data: validation.cleanedData,
      });
    }

    res.json({
      message: "Import preview generated",
      preview,
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({
      message: "Error previewing import data",
      error: error.message,
    });
  }
};

// Get import history (optional feature)
exports.getImportHistory = async (req, res) => {
  try {
    // This would require an ImportHistory model to track imports
    // For now, return a placeholder response
    res.json({
      message: "Import history feature coming soon",
      history: [],
    });
  } catch (error) {
    console.error("Import history error:", error);
    res.status(500).json({
      message: "Error fetching import history",
      error: error.message,
    });
  }
};
