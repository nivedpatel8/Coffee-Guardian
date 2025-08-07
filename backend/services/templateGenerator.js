const XLSX = require("xlsx");

class TemplateGenerator {
  // Labor template structure
  static getLaborTemplate() {
    return {
      headers: [
        "workerName",
        "gender",
        "workType",
        "skillLevel",
        "dailyRate",
        "advance",
      ],
      sampleData: [
        {
          workerName: "John Doe",
          gender: "male",
          workType: "Harvesting",
          skillLevel: "skilled",
          dailyRate: 500,
          advance: 0,
        },
        {
          workerName: "Jane Smith",
          gender: "female",
          workType: "Processing",
          skillLevel: "semi-skilled",
          dailyRate: 450,
          advance: 100,
        },
      ],
      validation: {
        gender: ["male", "female"],
        workType: ["Harvesting", "Pruning", "Weeding", "Processing", "General"],
        skillLevel: ["skilled", "semi-skilled", "unskilled"],
      },
    };
  }

  // Expense template structure
  static getExpenseTemplate() {
    return {
      headers: [
        "category",
        "itemName",
        "quantity",
        "unit",
        "unitPrice",
        "totalAmount",
        "purchaseDate",
        "supplier",
        "notes",
      ],
      sampleData: [
        {
          category: "Fertilizers",
          itemName: "Organic Compost",
          quantity: 10,
          unit: "kg",
          unitPrice: 50,
          totalAmount: 500,
          purchaseDate: "2024-01-15",
          supplier: "Green Farm Supplies",
          notes: "High quality organic fertilizer",
        },
        {
          category: "Equipment",
          itemName: "Pruning Shears",
          quantity: 2,
          unit: "pieces",
          unitPrice: 1200,
          totalAmount: 2400,
          purchaseDate: "2024-01-20",
          supplier: "Farm Tools Ltd",
          notes: "Professional grade equipment",
        },
      ],
      validation: {
        category: [
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
        ],
      },
    };
  }

  // Generate Excel template
  static generateExcelTemplate(templateType) {
    const template =
      templateType === "labor"
        ? this.getLaborTemplate()
        : this.getExpenseTemplate();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create main data sheet
    const wsData = [
      template.headers,
      ...template.sampleData.map((row) =>
        template.headers.map((header) => row[header] || "")
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = template.headers.map(() => ({ width: 15 }));

    // Add data sheet
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Create validation sheet if needed
    if (template.validation) {
      const validationData = Object.entries(template.validation).map(
        ([field, values]) => [field, values.join(", ")]
      );

      const wsValidation = XLSX.utils.aoa_to_sheet([
        ["Field", "Allowed Values"],
        ...validationData,
      ]);

      XLSX.utils.book_append_sheet(wb, wsValidation, "Validation_Rules");
    }

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  // Generate CSV template
  static generateCSVTemplate(templateType) {
    const template =
      templateType === "labor"
        ? this.getLaborTemplate()
        : this.getExpenseTemplate();

    const csvContent = [
      template.headers.join(","),
      ...template.sampleData.map((row) =>
        template.headers
          .map((header) => {
            const value = row[header] || "";
            // Escape values containing commas or quotes
            return typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    return Buffer.from(csvContent, "utf8");
  }
}

module.exports = TemplateGenerator;
