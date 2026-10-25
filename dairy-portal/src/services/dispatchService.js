import api from "../api/axios";

const formatDispatchDateTime = (dispatch) => {
  const date = new Date(dispatch.dispatchDate || dispatch.createdAt);

  if (Number.isNaN(date.getTime())) {
    return dispatch.dateTime || "";
  }

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = dispatch.dispatchTime
    ? new Date(`2000-01-01T${dispatch.dispatchTime}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  return `${formattedDate} · ${formattedTime}`;
};

const normalizeDispatch = (dispatch) => ({
  ...dispatch,
  id: dispatch._id || dispatch.id,
  dateTime: formatDispatchDateTime(dispatch),
});

const getDispatchList = (responseData) => {
  const data = responseData?.data ?? responseData;
  const dispatches = data?.dispatches ?? data;

  if (!Array.isArray(dispatches)) {
    throw new Error("The dispatch response did not contain a dispatch list.");
  }

  return dispatches.map(normalizeDispatch);
};

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
    return { data: getDispatchList(response.data), backendPersisted: true };
  } catch (err) {
    return {
      data: [...localDispatches],
      backendPersisted: false,
      contractNotice: "Endpoint /api/dispatches returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createDispatch = async (dispatchData) => {
  const dispatchDate = new Date(dispatchData.dispatchDateTime);

  if (Number.isNaN(dispatchDate.getTime())) {
    throw new Error("Enter a valid dispatch date and time.");
  }

  const response = await api.post("/dispatches", {
    product: dispatchData.product,
    processingBatchId: dispatchData.processingBatchId,
    quantity: Number(dispatchData.quantity),
    unit: dispatchData.unit,
    customer: dispatchData.customer.trim(),
    channel: dispatchData.channel,
    dispatchDate: dispatchDate.toISOString(),
    dispatchTime: dispatchDate.toTimeString().slice(0, 5),
  });
  const data = response.data?.data ?? response.data;
  const dispatch = data?.dispatch ?? data;

  return {
    data: normalizeDispatch(dispatch),
    backendPersisted: true,
  };
};

export const deleteDispatch = async (id) => {
  const response = await api.delete(`/dispatches/${encodeURIComponent(id)}`);
  return { data: response.data, backendPersisted: true };
};
