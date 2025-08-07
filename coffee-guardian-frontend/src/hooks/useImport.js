import { useState } from "react";
import importService from "../../services/importService";

export const useImport = (type) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  const downloadTemplate = async (format = "excel") => {
    try {
      setError(null);
      setIsLoading(true);
      await importService.downloadTemplate(type, format);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const previewFile = async (file) => {
    try {
      setError(null);
      setIsLoading(true);
      setPreview(null);

      const result = await importService.previewImport(type, file);
      setPreview(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const importFile = async (file) => {
    try {
      setError(null);
      setIsLoading(true);
      setImportResults(null);

      const result = await importService.importData(type, file);
      setImportResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setImportResults(null);
    setError(null);
  };

  return {
    isLoading,
    preview,
    importResults,
    error,
    downloadTemplate,
    previewFile,
    importFile,
    reset,
  };
};
