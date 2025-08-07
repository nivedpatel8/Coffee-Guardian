import React from "react";
import { Loader2 } from "lucide-react";

const ImportProgress = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        Processing Your File
      </h3>
      <p className="text-gray-400 text-center max-w-md">
        We're validating your data and checking for any issues. This may take a
        few moments for larger files.
      </p>

      <div className="w-64 bg-gray-700 rounded-full h-2 mt-6">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
          style={{ width: "70%" }}
        ></div>
      </div>
    </div>
  );
};

export default ImportProgress;
