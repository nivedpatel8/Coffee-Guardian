const XLSX = require("xlsx");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Labor = require("../models/Labor");
const Expense = require("../models/Expense");

class ImportService {
  static async parseFile(buffer, originalname) {
    const fileExtension = originalname.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      return this.parseCSV(buffer);
    } else if (["xlsx", "xls"].includes(fileExtension)) {
      return this.parseExcel(buffer);
    } else {
      throw new Error("Unsupported file format");
    }
  }

  static parseExcel(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: "yyyy-mm-dd",
      });

      if (data.length < 2) {
        throw new Error("File must contain at least headers and one data row");
      }

      const headers = data[0];
      const rows = data
        .slice(1)
        .filter((row) => row.some((cell) => cell !== "" && cell != null));

      return { headers, rows };
    } catch (error) {
      throw new Error(`Excel parsing error: ${error.message}`);
    }
  }

  static parseCSV(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      let headers = [];

      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on("headers", (headerList) => {
          headers = headerList;
        })
        .on("data", (data) => {
          results.push(Object.values(data));
        })
        .on("end", () => {
          resolve({ headers, rows: results });
        })
        .on("error", (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  static validateLaborData(rowData, headers) {
    const errors = [];
    const warnings = [];

    // Map headers to data
    const dataObj = {};
    headers.forEach((header, index) => {
      dataObj[header] = rowData[index];
    });

    // Required fields validation
    const requiredFields = [
      "workerName",
      "gender",
      "workType",
      "skillLevel",
      "dailyRate",
    ];
    requiredFields.forEach((field) => {
      if (!dataObj[field] || dataObj[field].toString().trim() === "") {
        errors.push(`${field} is required`);
      }
    });

    // Enum validations
    const genderValues = ["male", "female"];
    if (
      dataObj.gender &&
      !genderValues.includes(dataObj.gender.toLowerCase())
    ) {
      errors.push(`Gender must be one of: ${genderValues.join(", ")}`);
    }

    const workTypeValues = [
      "Harvesting",
      "Pruning",
      "Weeding",
      "Processing",
      "General",
    ];
    if (dataObj.workType && !workTypeValues.includes(dataObj.workType)) {
      errors.push(`Work type must be one of: ${workTypeValues.join(", ")}`);
    }

    const skillLevelValues = ["skilled", "semi-skilled", "unskilled"];
    if (dataObj.skillLevel && !skillLevelValues.includes(dataObj.skillLevel)) {
      errors.push(`Skill level must be one of: ${skillLevelValues.join(", ")}`);
    }

    // Numeric validations
    if (
      dataObj.dailyRate &&
      (isNaN(dataObj.dailyRate) || parseFloat(dataObj.dailyRate) <= 0)
    ) {
      errors.push("Daily rate must be a positive number");
    }

    if (dataObj.advance && isNaN(dataObj.advance)) {
      errors.push("Advance must be a number");
    }

    // Convert and clean data
    const cleanedData = {
      workerName: dataObj.workerName?.toString().trim(),
      gender: dataObj.gender?.toLowerCase(),
      workType: dataObj.workType,
      skillLevel: dataObj.skillLevel,
      dailyRate: parseFloat(dataObj.dailyRate) || 0,
      advance: parseFloat(dataObj.advance) || 0,
    };

    return { errors, warnings, cleanedData };
  }

  static validateExpenseData(rowData, headers) {
    const errors = [];
    const warnings = [];

    // Map headers to data
    const dataObj = {};
    headers.forEach((header, index) => {
      dataObj[header] = rowData[index];
    });

    // Required fields validation
    const requiredFields = [
      "category",
      "itemName",
      "quantity",
      "unit",
      "unitPrice",
      "totalAmount",
    ];
    requiredFields.forEach((field) => {
      if (!dataObj[field] || dataObj[field].toString().trim() === "") {
        errors.push(`${field} is required`);
      }
    });

    // Category validation
    const categoryValues = [
      "Fertilizers",
      "Pesticides",
      "Equipment",
      "Labor",
      "Seeds",
      "Irrigation",
      "Repair",
      "Processing",
      "Fuel",
      "Other",
    ];
    if (dataObj.category && !categoryValues.includes(dataObj.category)) {
      errors.push(`Category must be one of: ${categoryValues.join(", ")}`);
    }

    // Numeric validations
    if (
      dataObj.quantity &&
      (isNaN(dataObj.quantity) || parseFloat(dataObj.quantity) <= 0)
    ) {
      errors.push("Quantity must be a positive number");
    }

    if (
      dataObj.unitPrice &&
      (isNaN(dataObj.unitPrice) || parseFloat(dataObj.unitPrice) <= 0)
    ) {
      errors.push("Unit price must be a positive number");
    }

    if (
      dataObj.totalAmount &&
      (isNaN(dataObj.totalAmount) || parseFloat(dataObj.totalAmount) <= 0)
    ) {
      errors.push("Total amount must be a positive number");
    }

    // Date validation
    if (dataObj.purchaseDate) {
      const date = new Date(dataObj.purchaseDate);
      if (isNaN(date.getTime())) {
        errors.push("Purchase date must be a valid date (YYYY-MM-DD format)");
      }
    }

    // Calculate total amount validation
    const quantity = parseFloat(dataObj.quantity) || 0;
    const unitPrice = parseFloat(dataObj.unitPrice) || 0;
    const totalAmount = parseFloat(dataObj.totalAmount) || 0;
    const calculatedTotal = quantity * unitPrice;

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      warnings.push(
        `Total amount (${totalAmount}) doesn't match quantity × unit price (${calculatedTotal})`
      );
    }

    // Convert and clean data
    const cleanedData = {
      category: dataObj.category,
      itemName: dataObj.itemName?.toString().trim(),
      quantity: parseFloat(dataObj.quantity) || 0,
      unit: dataObj.unit?.toString().trim(),
      unitPrice: parseFloat(dataObj.unitPrice) || 0,
      totalAmount: parseFloat(dataObj.totalAmount) || 0,
      purchaseDate: dataObj.purchaseDate
        ? new Date(dataObj.purchaseDate)
        : new Date(),
      supplier: dataObj.supplier?.toString().trim() || "",
      notes: dataObj.notes?.toString().trim() || "",
    };

    return { errors, warnings, cleanedData };
  }

  static async importLaborData(parsedData, userId) {
    const { headers, rows } = parsedData;
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: rows.length,
        success: 0,
        failed: 0,
      },
    };

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // +2 because Excel rows start at 1 and we skip header

      try {
        const validation = this.validateLaborData(rows[i], headers);

        if (validation.errors.length > 0) {
          results.failed.push({
            row: rowIndex,
            data: rows[i],
            errors: validation.errors,
            warnings: validation.warnings,
          });
          continue;
        }

        // Check for duplicate worker name
        const existingWorker = await Labor.findOne({
          userId: userId,
          workerName: validation.cleanedData.workerName,
        });

        if (existingWorker) {
          results.failed.push({
            row: rowIndex,
            data: rows[i],
            errors: [
              `Worker with name "${validation.cleanedData.workerName}" already exists`,
            ],
            warnings: validation.warnings,
          });
          continue;
        }

        // Create new labor record
        const laborData = {
          ...validation.cleanedData,
          userId: userId,
          attendance: [],
          weeklyPayments: [],
        };

        const labor = new Labor(laborData);
        await labor.save();

        results.successful.push({
          row: rowIndex,
          data: validation.cleanedData,
          warnings: validation.warnings,
          _id: labor._id,
        });

        results.summary.success++;
      } catch (error) {
        results.failed.push({
          row: rowIndex,
          data: rows[i],
          errors: [`Database error: ${error.message}`],
          warnings: [],
        });
      }
    }

    results.summary.failed = results.failed.length;
    return results;
  }

  static async importExpenseData(parsedData, userId) {
    const { headers, rows } = parsedData;
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: rows.length,
        success: 0,
        failed: 0,
      },
    };

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 2; // +2 because Excel rows start at 1 and we skip header

      try {
        const validation = this.validateExpenseData(rows[i], headers);

        if (validation.errors.length > 0) {
          results.failed.push({
            row: rowIndex,
            data: rows[i],
            errors: validation.errors,
            warnings: validation.warnings,
          });
          continue;
        }

        // Create new expense record
        const expenseData = {
          ...validation.cleanedData,
          userId: userId,
        };

        const expense = new Expense(expenseData);
        await expense.save();

        results.successful.push({
          row: rowIndex,
          data: validation.cleanedData,
          warnings: validation.warnings,
          _id: expense._id,
        });

        results.summary.success++;
      } catch (error) {
        results.failed.push({
          row: rowIndex,
          data: rows[i],
          errors: [`Database error: ${error.message}`],
          warnings: [],
        });
      }
    }

    results.summary.failed = results.failed.length;
    return results;
  }
}

module.exports = ImportService;
