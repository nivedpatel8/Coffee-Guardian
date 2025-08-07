import React, { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import ImportModal from "./ImportModal";

const ImportButton = ({ type, className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center shadow-lg hover:shadow-xl ${className}`}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>

      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
      />
    </>
  );
};

export default ImportButton;
