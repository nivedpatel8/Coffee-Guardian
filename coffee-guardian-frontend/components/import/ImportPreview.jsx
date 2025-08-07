import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

const ImportPreview = ({ preview, onImport }) => {
  const { preview: previewData } = preview;
  const { headers, totalRows, validationResults } = previewData;

  const validRows = validationResults.filter((row) => row.isValid).length;
  const invalidRows = validationResults.filter((row) => !row.isValid).length;
  const warningRows = validationResults.filter(
    (row) => row.warnings.length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <FileSpreadsheet className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{totalRows}</p>
              <p className="text-gray-400 text-sm">Total Rows</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-400">{validRows}</p>
              <p className="text-gray-400 text-sm">Valid Rows</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-400">{invalidRows}</p>
              <p className="text-gray-400 text-sm">Invalid Rows</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {warningRows}
              </p>
              <p className="text-gray-400 text-sm">Warnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Headers Preview */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h4 className="font-medium text-white mb-3">Detected Columns</h4>
        <div className="flex flex-wrap gap-2">
          {headers.map((header, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
            >
              {header}
            </span>
          ))}
        </div>
      </div>

      {/* Validation Results */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-medium text-white">Validation Results</h4>
          <p className="text-gray-400 text-sm">Preview of first 10 rows</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {validationResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-700/50 last:border-b-0 ${
                !result.isValid
                  ? "bg-red-500/5"
                  : result.warnings.length > 0
                  ? "bg-yellow-500/5"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-3">
                    Row {result.row}
                  </span>
                  {result.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  {result.warnings.length > 0 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-red-400 text-sm font-medium mb-1">
                    Errors:
                  </h5>
                  <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-yellow-400 text-sm font-medium mb-1">
                    Warnings:
                  </h5>
                  <ul className="list-disc list-inside text-yellow-300 text-sm space-y-1">
                    {result.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show sample data for valid rows */}
              {result.isValid && (
                <div className="text-gray-400 text-sm">
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(result.data)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <span key={key}>
                          <strong>{key}:</strong>{" "}
                          {String(value).substring(0, 30)}
                          {String(value).length > 30 ? "..." : ""}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <div className="text-sm text-gray-400">
          {invalidRows > 0 && (
            <p className="text-red-400 mb-2">
              ⚠️ {invalidRows} row(s) have errors and will be skipped
            </p>
          )}
          {validRows > 0 && (
            <p className="text-green-400">
              ✅ {validRows} row(s) ready to import
            </p>
          )}
        </div>

        <button
          onClick={onImport}
          disabled={validRows === 0}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Import {validRows} Record{validRows !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
};

export default ImportPreview;
