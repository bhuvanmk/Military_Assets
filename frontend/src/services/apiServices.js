import api from './api';

export const dashboardService = {
  getDashboard: async (params = {}) => {
    const response = await api.get('/dashboard', { params });
    return response.data;
  }
};

export const inventoryService = {
  getInventory: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  getInventoryItem: async (baseId, equipmentTypeId, params = {}) => {
    const response = await api.get('/inventory/item', {
      params: { baseId, equipmentTypeId, ...params }
    });
    return response.data;
  }
};

export const purchaseService = {
  getPurchases: async (params = {}) => {
    const response = await api.get('/purchases', { params });
    return response.data;
  },
  getPurchaseById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },
  createPurchase: async (data) => {
    const response = await api.post('/purchases', data);
    return response.data;
  }
};

export const transferService = {
  getTransfers: async (params = {}) => {
    const response = await api.get('/transfers', { params });
    return response.data;
  },
  getTransferById: async (id) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },
  createTransfer: async (data) => {
    const response = await api.post('/transfers', data);
    return response.data;
  },
  updateTransferStatus: async (id, data) => {
    const response = await api.put(`/transfers/${id}`, data);
    return response.data;
  }
};

export const assignmentService = {
  getAssignments: async (params = {}) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },
  getAssignmentById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  createAssignment: async (data) => {
    const response = await api.post('/assignments', data);
    return response.data;
  }
};

export const expenditureService = {
  getExpenditures: async (params = {}) => {
    const response = await api.get('/expenditures', { params });
    return response.data;
  },
  getExpenditureById: async (id) => {
    const response = await api.get(`/expenditures/${id}`);
    return response.data;
  },
  createExpenditure: async (data) => {
    const response = await api.post('/expenditures', data);
    return response.data;
  }
};

export const baseService = {
  getBases: async (params = {}) => {
    const response = await api.get('/bases/active', { params });
    return response.data;
  },
  getActiveBases: async () => {
    const response = await api.get('/bases/active');
    return response.data;
  },
  getBaseById: async (id) => {
    const response = await api.get(`/bases/${id}`);
    return response.data;
  },
  // Admin-specific endpoints
  getAllAdminBases: async (params = {}) => {
    const response = await api.get('/admin/bases', { params });
    return response.data;
  },
  createBase: async (data) => {
    const response = await api.post('/admin/bases', data);
    return response.data;
  },
  updateBase: async (id, data) => {
    const response = await api.put(`/admin/bases/${id}`, data);
    return response.data;
  }
};

export const equipmentTypeService = {
  getEquipmentTypes: async (params = {}) => {
    const response = await api.get('/equipment-types/active', { params });
    return response.data;
  },
  getActiveEquipmentTypes: async () => {
    const response = await api.get('/equipment-types/active');
    return response.data;
  },
  getEquipmentTypeById: async (id) => {
    const response = await api.get(`/equipment-types/${id}`);
    return response.data;
  },
  // Admin-specific endpoints
  getAllAdminEquipmentTypes: async (params = {}) => {
    const response = await api.get('/admin/equipment-types', { params });
    return response.data;
  },
  createEquipmentType: async (data) => {
    const response = await api.post('/admin/equipment-types', data);
    return response.data;
  },
  updateEquipmentType: async (id, data) => {
    const response = await api.put(`/admin/equipment-types/${id}`, data);
    return response.data;
  }
};

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (data) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  toggleStatus: async (id, active) => {
    const response = await api.patch(`/admin/users/${id}/status`, { active });
    return response.data;
  },
  resetPassword: async (id, password) => {
    const response = await api.post(`/admin/users/${id}/reset-password`, { password });
    return response.data;
  }
};

export const auditLogService = {
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  }
};
