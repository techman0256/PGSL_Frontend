import api from "../api/axios";

// Initial seed data from Figma reference (Dispatch.jpg)
let localDispatches = [
  {
    id: "ds-1",
    dispatchId: "DS-20261007-006",
    dateTime: "07 Oct 2026 · 02:30 PM",
    product: "Liquid Milk",
    quantity: 120,
    unit: "L",
    channel: "Retail",
    customer: "FreshMart Stores",
    processingBatchId: "MP-20261007-006",
    status: "Dispatched",
    createdAt: "2026-10-07T14:30:00Z",
  },
  {
    id: "ds-2",
    dispatchId: "DS-20261007-005",
    dateTime: "07 Oct 2026 · 02:10 PM",
    product: "Curd",
    quantity: 60,
    unit: "Kg",
    channel: "Wholesale",
    customer: "City Dairy Traders",
    processingBatchId: "MP-20261007-005",
    status: "Dispatched",
    createdAt: "2026-10-07T14:10:00Z",
  },
  {
    id: "ds-3",
    dispatchId: "DS-20261007-004",
    dateTime: "07 Oct 2026 · 01:50 PM",
    product: "Butter",
    quantity: 8,
    unit: "Kg",
    channel: "Distributor",
    customer: "Metro Foods",
    processingBatchId: "MP-20261007-004",
    status: "Dispatched",
    createdAt: "2026-10-07T13:50:00Z",
  },
  {
    id: "ds-4",
    dispatchId: "DS-20261007-003",
    dateTime: "07 Oct 2026 · 01:30 PM",
    product: "Ghee",
    quantity: 3,
    unit: "Kg",
    channel: "Retail",
    customer: "Daily Basket",
    processingBatchId: "MP-20261007-003",
    status: "Dispatched",
    createdAt: "2026-10-07T13:30:00Z",
  },
  {
    id: "ds-5",
    dispatchId: "DS-20261007-002",
    dateTime: "07 Oct 2026 · 01:10 PM",
    product: "Paneer",
    quantity: 15,
    unit: "Kg",
    channel: "Wholesale",
    customer: "Green Leaf Catering",
    processingBatchId: "MP-20261006-002",
    status: "Dispatched",
    createdAt: "2026-10-07T13:10:00Z",
  },
  {
    id: "ds-6",
    dispatchId: "DS-20261007-001",
    dateTime: "07 Oct 2026 · 12:55 PM",
    product: "Goat Cheese",
    quantity: 8,
    unit: "Kg",
    channel: "Distributor",
    customer: "Artisan Foods",
    processingBatchId: "MP-20261006-001",
    status: "Dispatched",
    createdAt: "2026-10-07T12:55:00Z",
  },
];

export const getDispatches = async () => {
  try {
    const response = await api.get("/dispatches");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: [...localDispatches],
      backendPersisted: false,
      contractNotice: "Endpoint /api/dispatches returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createDispatch = async (dispatchData) => {
  try {
    const response = await api.post("/dispatches", dispatchData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const nextSeq = String(localDispatches.length + 1).padStart(3, "0");
    const newEntry = {
      id: "ds-" + Date.now(),
      dispatchId: dispatchData.dispatchId || `DS-20261007-${nextSeq}`,
      dateTime: dispatchData.dispatchDateTime || "07 Oct 2026 · 03:00 PM",
      product: dispatchData.product || "Liquid Milk",
      quantity: Number(dispatchData.quantity) || 0,
      unit: dispatchData.unit || "L",
      channel: dispatchData.channel || "Retail",
      customer: dispatchData.customer || "FreshMart Stores",
      processingBatchId: dispatchData.processingBatchId || "MP-20261007-006",
      status: "Dispatched",
      createdAt: new Date().toISOString(),
    };
    localDispatches = [newEntry, ...localDispatches];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/dispatches not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

export const deleteDispatch = async (id) => {
  try {
    const response = await api.delete(`/dispatches/${id}`);
    return { data: response.data, backendPersisted: true };
  } catch (err) {
    localDispatches = localDispatches.filter((item) => item.id !== id && item.dispatchId !== id);
    return {
      data: { success: true, id },
      backendPersisted: false,
      contractNotice: `Endpoint /api/dispatches/:id not available (${err.response?.status || err.message}); entry removed from session.`
    };
  }
};

