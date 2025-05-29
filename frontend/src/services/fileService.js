import api from './api';

// Upload file
const uploadFile = async (file, type = 'general', metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  // Add metadata if provided
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  const req = api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
  return await req;
};

// Upload multiple files
const uploadMultipleFiles = async (files, type = 'general', metadata = {}) => {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });
  
  formData.append('type', type);
  
  // Add metadata if provided
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  const req = api.post('/files/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(({ data }) => data.data);
  return await req;
};

// Download file
const downloadFile = async (fileId) => {
  const req = api.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  }).then(({ data }) => data);
  return await req;
};

// Get file info
const retrieveFileInfo = async (fileId) => {
  const req = api.get(`/files/${fileId}`).then(({ data }) => data.data);
  return await req;
};

// Delete file
const deleteFile = async (fileId) => {
  const req = api.delete(`/files/${fileId}`).then(({ data }) => data);
  return await req;
};

// Get files by type
const retrieveFilesByType = async (type) => {
  const req = api.get(`/files?type=${type}`).then(({ data }) => data.data);
  return await req;
};

// Get user files
const retrieveUserFiles = async (userId) => {
  const req = api.get(`/files?user_id=${userId}`).then(({ data }) => data.data);
  return await req;
};

// Get employee files
const retrieveEmployeeFiles = async (employeeId) => {
  const req = api.get(`/employees/${employeeId}/files`).then(({ data }) => data.data);
  return await req;
};

// Get review files
const retrieveReviewFiles = async (reviewId) => {
  const req = api.get(`/reviews/${reviewId}/files`).then(({ data }) => data.data);
  return await req;
};

// Attach file to employee
const attachFileToEmployee = async (employeeId, fileId) => {
  const req = api.post(`/employees/${employeeId}/files`, { file_id: fileId }).then(({ data }) => data.data);
  return await req;
};

// Attach file to review
const attachFileToReview = async (reviewId, fileId) => {
  const req = api.post(`/reviews/${reviewId}/files`, { file_id: fileId }).then(({ data }) => data.data);
  return await req;
};

// Detach file from employee
const detachFileFromEmployee = async (employeeId, fileId) => {
  const req = api.delete(`/employees/${employeeId}/files/${fileId}`).then(({ data }) => data);
  return await req;
};

// Detach file from review
const detachFileFromReview = async (reviewId, fileId) => {
  const req = api.delete(`/reviews/${reviewId}/files/${fileId}`).then(({ data }) => data);
  return await req;
};

// Get file preview URL
const getFilePreviewUrl = async (fileId) => {
  const req = api.get(`/files/${fileId}/preview-url`).then(({ data }) => data.data);
  return await req;
};

// Search files
const searchFiles = async (query) => {
  const req = api.get(`/files/search?q=${encodeURIComponent(query)}`).then(({ data }) => data.data);
  return await req;
};

// Get file sharing link
const getFileSharingLink = async (fileId, expiresIn = '24h') => {
  const req = api.post(`/files/${fileId}/share`, { expires_in: expiresIn }).then(({ data }) => data.data);
  return await req;
};

// Revoke file sharing link
const revokeFileSharingLink = async (fileId) => {
  const req = api.delete(`/files/${fileId}/share`).then(({ data }) => data);
  return await req;
};

// Get file statistics
const retrieveFileStats = async () => {
  const req = api.get('/files/stats').then(({ data }) => data.data);
  return await req;
};

// Check file upload limits
const checkUploadLimits = async () => {
  const req = api.get('/files/upload-limits').then(({ data }) => data.data);
  return await req;
};

export const fileService = {
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  retrieveFileInfo,
  deleteFile,
  retrieveFilesByType,
  retrieveUserFiles,
  retrieveEmployeeFiles,
  retrieveReviewFiles,
  attachFileToEmployee,
  attachFileToReview,
  detachFileFromEmployee,
  detachFileFromReview,
  getFilePreviewUrl,
  searchFiles,
  getFileSharingLink,
  revokeFileSharingLink,
  retrieveFileStats,
  checkUploadLimits,
};