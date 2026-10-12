import api from "../api/axios";

// Initial seed data from Figma reference (Milk processing plant.jpg)
let localQualityTests = [
  {
    id: "qt-1",
    batchId: "MR-20261007-004",
    fat: 3.80,
    snf: 8.50,
    temperature: 6.0,
    testDate: "07 Oct 2026",
    testTime: "08:45 AM",
    remarks: "Quality measurements recorded for the received milk sample.",
    status: "Accepted",
    createdAt: "2026-10-07T08:45:00Z",
  },
  {
    id: "qt-2",
    batchId: "MR-20261007-003",
    fat: 7.20,
    snf: 9.20,
    temperature: 5.8,
    testDate: "07 Oct 2026",
    testTime: "08:30 AM",
    remarks: "Buffalo milk high fat content verified.",
    status: "Accepted",
    createdAt: "2026-10-07T08:30:00Z",
  },
  {
    id: "qt-3",
    batchId: "MR-20261006-002",
    fat: 4.10,
    snf: 8.70,
    temperature: 6.2,
    testDate: "06 Oct 2026",
    testTime: "06:00 PM",
    remarks: "Standard goat milk batch parameters compliant.",
    status: "Accepted",
    createdAt: "2026-10-06T18:00:00Z",
  },
  {
    id: "qt-4",
    batchId: "MR-20261006-001",
    fat: 4.80,
    snf: 8.90,
    temperature: 5.9,
    testDate: "06 Oct 2026",
    testTime: "05:30 PM",
    remarks: "Sahiwal sample quality checks passed.",
    status: "Accepted",
    createdAt: "2026-10-06T17:30:00Z",
  },
];

export const getQualityTests = async () => {
  try {
    const response = await api.get("/quality-tests");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: [...localQualityTests],
      backendPersisted: false,
      contractNotice: "Endpoint /api/quality-tests returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createQualityTest = async (testData) => {
  try {
    const response = await api.post("/quality-tests", testData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const newEntry = {
      id: "qt-" + Date.now(),
      batchId: testData.batchId,
      fat: Number(testData.fat) || 0,
      snf: Number(testData.snf) || 0,
      temperature: Number(testData.temperature) || 0,
      testDate: testData.testDate || "07 Oct 2026",
      testTime: testData.testTime || "08:45 AM",
      remarks: testData.remarks || "",
      status: testData.status || "Accepted",
      createdAt: new Date().toISOString(),
    };
    localQualityTests = [newEntry, ...localQualityTests];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/quality-tests not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

export const deleteQualityTest = async (id) => {
  try {
    const response = await api.delete(`/quality-tests/${id}`);
    return { data: response.data, backendPersisted: true };
  } catch (err) {
    localQualityTests = localQualityTests.filter((item) => item.id !== id && item.batchId !== id);
    return {
      data: { success: true, id },
      backendPersisted: false,
      contractNotice: `Endpoint /api/quality-tests/:id not available (${err.response?.status || err.message}); entry removed from session.`
    };
  }
};

