import api from "../api/axios";

// Initial seed data from Figma reference (Workspace.png)
let localReceptions = [
  {
    id: "rec-1",
    batchId: "MR-20261007-004",
    milkType: "Cow",
    quantity: 1250,
    unit: "L",
    date: "07 Oct 2026",
    shift: "Morning",
    time: "08:30 AM",
    remarks: "Received from morning collection route A",
    status: "Received",
    createdAt: "2026-10-07T08:30:00Z",
  },
  {
    id: "rec-2",
    batchId: "MR-20261007-003",
    milkType: "Buffalo",
    quantity: 800,
    unit: "L",
    date: "07 Oct 2026",
    shift: "Morning",
    time: "08:15 AM",
    remarks: "Direct farmer delivery",
    status: "Received",
    createdAt: "2026-10-07T08:15:00Z",
  },
  {
    id: "rec-3",
    batchId: "MR-20261006-002",
    milkType: "Goat",
    quantity: 250,
    unit: "L",
    date: "06 Oct 2026",
    shift: "Evening",
    time: "05:45 PM",
    remarks: "Goat milk consignment",
    status: "Received",
    createdAt: "2026-10-06T17:45:00Z",
  },
  {
    id: "rec-4",
    batchId: "MR-20261006-001",
    milkType: "Sahiwal",
    quantity: 600,
    unit: "L",
    date: "06 Oct 2026",
    shift: "Evening",
    time: "05:15 PM",
    remarks: "Sahiwal pure breed collection",
    status: "Received",
    createdAt: "2026-10-06T17:15:00Z",
  },
];

export const getReceptions = async () => {
  try {
    const response = await api.get("/receptions");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: [...localReceptions],
      backendPersisted: false,
      contractNotice: "Endpoint /api/receptions returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createReception = async (receptionData) => {
  try {
    const response = await api.post("/receptions", receptionData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const nextSeq = String(localReceptions.length + 1).padStart(3, "0");
    const newEntry = {
      id: "rec-" + Date.now(),
      batchId: receptionData.batchId || `MR-20261007-${nextSeq}`,
      milkType: receptionData.milkType || "Cow",
      quantity: Number(receptionData.quantity) || 0,
      unit: "L",
      date: receptionData.date || "07 Oct 2026",
      shift: receptionData.shift || "Morning",
      time: receptionData.time || "08:30 AM",
      remarks: receptionData.remarks || "",
      status: "Received",
      createdAt: new Date().toISOString(),
    };
    localReceptions = [newEntry, ...localReceptions];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/receptions not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

export const deleteReception = async (id) => {
  try {
    const response = await api.delete(`/receptions/${id}`);
    return { data: response.data, backendPersisted: true };
  } catch (err) {
    localReceptions = localReceptions.filter((item) => item.id !== id && item.batchId !== id);
    return {
      data: { success: true, id },
      backendPersisted: false,
      contractNotice: `Endpoint /api/receptions/:id not available (${err.response?.status || err.message}); entry removed from session.`
    };
  }
};

