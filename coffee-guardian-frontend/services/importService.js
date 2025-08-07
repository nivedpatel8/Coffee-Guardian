import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL+'/api' || 'http://localhost:5000/api';

class ImportService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Download template
  async downloadTemplate(type, format = 'excel') {
    try {
      const response = await this.api.get(`/import/template/${type}/${format}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_import_template.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Template download error:', error);
      throw new Error(error.response?.data?.message || 'Failed to download template');
    }
  }

  // Preview import
  async previewImport(type, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post(`/import/preview/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Preview import error:', error);
      throw new Error(error.response?.data?.message || 'Failed to preview import');
    }
  }

  // Import data
  async importData(type, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post(`/import/import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Import data error:', error);
      throw new Error(error.response?.data?.message || 'Failed to import data');
    }
  }
}

export default new ImportService();
