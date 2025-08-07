import React from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Download,
} from "lucide-react";

const ImportResults = ({ results, onStartOver, onClose }) => {
  const { results: importResults } = results;
  const { successful, failed, summary } = importResults;

  const successRate =
    summary.total > 0
      ? ((summary.success / summary.total) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            summary.success > 0
              ? "bg-green-500/20 border-2 border-green-500/30"
              : "bg-red-500/20 border-2 border-red-500/30"
          }`}
        >
          {summary.success > 0 ? (
            <CheckCircle className="w-10 h-10 text-green-400" />
          ) : (
            <XCircle className="w-10 h-10 text-red-400" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          {summary.success > 0 ? "Import Completed!" : "Import Failed"}
        </h3>

        <p className="text-gray-400">
          {summary.success > 0
            ? `Successfully imported ${summary.success} out of ${summary.total} records (${successRate}%)`
            : `Failed to import any records. Please check the errors below.`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-400 font-bold">{summary.total}</span>
            </div>
            <div>
              <p className="text-white font-medium">Total Records</p>
              <p className="text-gray-400 text-sm">Processed</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="w-10 h-10 text-green-400 mr-3" />
            <div>
              <p className="text-green-400 font-medium text-lg">
                {summary.success}
              </p>
              <p className="text-gray-400 text-sm">Successful</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <XCircle className="w-10 h-10 text-red-400 mr-3" />
            <div>
              <p className="text-red-400 font-medium text-lg">
                {summary.failed}
              </p>
              <p className="text-gray-400 text-sm">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Successful Records */}
      {successful.length > 0 && (
        <div className="bg-gray-800/50 border border-green-500/20 rounded-xl">
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-green-400 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Successfully Imported ({successful.length})
            </h4>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {successful.slice(0, 10).map((record, index) => (
              <div
                key={index}
                className="p-3 border-b border-gray-700/50 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Row {record.row}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                {record.warnings.length > 0 && (
                  <div className="mt-1">
                    <p className="text-yellow-400 text-xs">Warnings:</p>
                    <ul className="list-disc list-inside text-yellow-300 text-xs">
                      {record.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {successful.length > 10 && (
              <div className="p-3 text-center text-gray-400 text-sm">
                ... and {successful.length - 10} more records
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed Records */}
      {failed.length > 0 && (
        <div className="bg-gray-800/50 border border-red-500/20 rounded-xl">
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-red-400 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Failed to Import ({failed.length})
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {failed.map((record, index) => (
              <div
                key={index}
                className="p-3 border-b border-gray-700/50 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">
                    Row {record.row}
                  </span>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-red-400 text-xs font-medium mb-1">
                    Errors:
                  </p>
                  <ul className="list-disc list-inside text-red-300 text-xs space-y-1">
                    {record.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
                {record.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-yellow-400 text-xs font-medium mb-1">
                      Warnings:
                    </p>
                    <ul className="list-disc list-inside text-yellow-300 text-xs">
                      {record.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Import Another File
        </button>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Done
        </button>
      </div>
    </div>
  );
};

export default ImportResults;
