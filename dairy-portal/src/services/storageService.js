import api from "../api/axios";

// Initial seed data from Figma reference (Raw Milk Storage.jpg)
let localStorageRecords = [
  {
    id: "st-1",
    storageRecordId: "ST-20261007-004",
    batchId: "MR-20261007-004",
    milkType: "Cow Milk",
    quantity: 1250,
    siloNumber: "Silo 01",
    temperature: 4.0,
    date: "07 Oct 2026",
    time: "09:00 AM",
    remarks: "Transferred after quality approval",
    status: "Stored",
    createdAt: "2026-10-07T09:00:00Z",
  },
  {
    id: "st-2",
    storageRecordId: "ST-20261007-003",
    batchId: "MR-20261007-003",
    milkType: "Buffalo Milk",
    quantity: 800,
    siloNumber: "Silo 02",
    temperature: 3.8,
    date: "07 Oct 2026",
    time: "08:45 AM",
    remarks: "High fat storage tank",
    status: "Stored",
    createdAt: "2026-10-07T08:45:00Z",
  },
  {
    id: "st-3",
    storageRecordId: "ST-20261006-002",
    batchId: "MR-20261006-002",
    milkType: "Goat Milk",
    quantity: 250,
    siloNumber: "Silo 03",
    temperature: 4.0,
    date: "06 Oct 2026",
    time: "06:15 PM",
    remarks: "Specialty batch holding silo",
    status: "Stored",
    createdAt: "2026-10-06T18:15:00Z",
  },
  {
    id: "st-4",
    storageRecordId: "ST-20261006-001",
    batchId: "MR-20261006-001",
    milkType: "Sahiwal Milk",
    quantity: 600,
    siloNumber: "Silo 04",
    temperature: 3.9,
    date: "06 Oct 2026",
    time: "05:50 PM",
    remarks: "Indigenous breed dedicated silo",
    status: "Stored",
    createdAt: "2026-10-06T17:50:00Z",
  },
];

export const siloCapacities = {
  "Silo 01": 5000,
  "Silo 02": 2000,
  "Silo 03": 1000,
  "Silo 04": 2000,
};

export const getStorageRecords = async () => {
  try {
    const response = await api.get("/storage-records");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: [...localStorageRecords],
      backendPersisted: false,
      contractNotice: "Endpoint /api/storage-records returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createStorageRecord = async (recordData) => {
  try {
    const response = await api.post("/storage-records", recordData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const nextSeq = String(localStorageRecords.length + 1).padStart(3, "0");
    const newEntry = {
      id: "st-" + Date.now(),
      storageRecordId: recordData.storageRecordId || `ST-20261007-${nextSeq}`,
      batchId: recordData.batchId,
      milkType: recordData.milkType || "Cow Milk",
      quantity: Number(recordData.quantity) || 0,
      siloNumber: recordData.siloNumber || "Silo 01",
      temperature: Number(recordData.temperature) || 4.0,
      date: recordData.date || "07 Oct 2026",
      time: recordData.time || "09:00 AM",
      remarks: recordData.remarks || "",
      status: "Stored",
      createdAt: new Date().toISOString(),
    };
    localStorageRecords = [newEntry, ...localStorageRecords];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/storage-records not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

export const deleteStorageRecord = async (id) => {
  try {
    const response = await api.delete(`/storage-records/${id}`);
    return { data: response.data, backendPersisted: true };
  } catch (err) {
    localStorageRecords = localStorageRecords.filter((item) => item.id !== id && item.storageRecordId !== id);
    return {
      data: { success: true, id },
      backendPersisted: false,
      contractNotice: `Endpoint /api/storage-records/:id not available (${err.response?.status || err.message}); entry removed from session.`
    };
  }
};

