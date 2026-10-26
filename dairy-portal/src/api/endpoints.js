const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  users: "/users",
  milkBatches: "/milk-batches",
  qualityTests: "/quality-tests",
  rawMilkStorage: "/raw-milk-storage",
  processing: "/processing",
  inventory: {
    summary: "/inventory/summary",
    finishedProducts: "/inventory/finished-products",
    rawMaterials: "/inventory/raw-materials",
  },
  dispatches: "/dispatches",
};

export default endpoints;
