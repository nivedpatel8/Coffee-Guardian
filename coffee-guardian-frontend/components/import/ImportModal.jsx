import React, { useState } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import FileUpload from "./FileUpload";
import ImportPreview from "./ImportPreview";
import ImportProgress from "./ImportProgress";
import ImportResults from "./ImportResults";
import { useImport } from "../../src/hooks/useImport";

const ImportModal = ({ isOpen, onClose, type }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    isLoading,
    preview,
    importResults,
    error,
    downloadTemplate,
    previewFile,
    importFile,
    reset,
  } = useImport(type);

  const steps = [
    { id: 1, name: "Download Template", icon: Download },
    { id: 2, name: "Upload File", icon: Upload },
    { id: 3, name: "Preview & Validate", icon: FileSpreadsheet },
    { id: 4, name: "Import Data", icon: CheckCircle },
  ];

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    setSelectedFile(null);
    onClose();
  };

  const handleDownloadTemplate = async (format) => {
    await downloadTemplate(format);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setCurrentStep(3);
    try {
      await previewFile(file);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importFile(selectedFile);
      setCurrentStep(4);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep(1);
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Import {type.charAt(0).toUpperCase() + type.slice(1)} Data
              </h2>
              <p className="text-gray-400 mt-1">
                Upload your Excel/CSV data to Coffee Guardian
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent"
                      : "border-gray-600 bg-gray-800"
                  }`}
                >
                  <step.icon
                    className={`w-5 h-5 ${
                      currentStep >= step.id ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-white" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ml-4 ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center">
              <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Step 1: Download Template */}
          {currentStep === 1 && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Download Import Template
                </h3>
                <p className="text-gray-400">
                  Get the template file with proper headers and sample data
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleDownloadTemplate("excel")}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download Excel Template
                </button>
                <button
                  onClick={() => handleDownloadTemplate("csv")}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Download CSV Template
                </button>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="mt-6 px-6 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Skip to Upload →
              </button>
            </div>
          )}

          {/* Step 2: Upload File */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Your File
                </h3>
                <p className="text-gray-400">
                  Drag and drop your filled template or click to browse
                </p>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Preview & Validate
                  </h3>
                  <p className="text-gray-400">
                    Review your data before importing
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Change File
                </button>
              </div>

              {isLoading ? (
                <ImportProgress />
              ) : preview ? (
                <ImportPreview preview={preview} onImport={handleImport} />
              ) : null}
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && importResults && (
            <div>
              <ImportResults
                results={importResults}
                onStartOver={handleStartOver}
                onClose={handleClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
