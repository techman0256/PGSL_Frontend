import api from "../api/axios";

// Initial seed data from Figma reference (Milk processing.jpg)
let localProcessingBatches = [
  {
    id: "mp-1",
    processingId: "MP-20261007-006",
    inputBatchId: "MR-20261007-004",
    milkType: "Cow",
    inputQuantity: 600,
    inputUnit: "L",
    product: "Liquid Milk",
    outputQuantity: 588,
    unit: "L",
    date: "07 Oct 2026",
    time: "10:30 AM",
    materialsUsed: [],
    byProducts: [{ byProduct: "Cream", quantity: 12, unit: "L" }],
    remarks: "Pasteurized standard milk packaging run",
    status: "Completed",
    createdAt: "2026-10-07T10:30:00Z",
  },
  {
    id: "mp-2",
    processingId: "MP-20261007-005",
    inputBatchId: "MR-20261007-004",
    milkType: "Cow",
    inputQuantity: 300,
    inputUnit: "L",
    product: "Curd",
    outputQuantity: 300,
    unit: "Kg",
    date: "07 Oct 2026",
    time: "11:00 AM",
    materialsUsed: [{ material: "Starter Culture", quantity: 250, unit: "g" }],
    byProducts: [],
    remarks: "Probiotic curd incubation batch",
    status: "Completed",
    createdAt: "2026-10-07T11:00:00Z",
  },
  {
    id: "mp-3",
    processingId: "MP-20261007-004",
    inputBatchId: "MR-20261007-003",
    milkType: "Buffalo",
    inputQuantity: 400,
    inputUnit: "L",
    product: "Butter",
    outputQuantity: 32,
    unit: "Kg",
    date: "07 Oct 2026",
    time: "11:20 AM",
    materialsUsed: [{ material: "Salt", quantity: 1, unit: "Kg" }],
    byProducts: [{ byProduct: "Buttermilk", quantity: 360, unit: "L" }],
    remarks: "Churned traditional table butter",
    status: "Completed",
    createdAt: "2026-10-07T11:20:00Z",
  },
  {
    id: "mp-4",
    processingId: "MP-20261007-003",
    inputBatchId: "MR-20261007-003",
    milkType: "Buffalo",
    inputQuantity: 200,
    inputUnit: "L",
    product: "Ghee",
    outputQuantity: 13,
    unit: "Kg",
    date: "07 Oct 2026",
    time: "10:45 AM",
    materialsUsed: [],
    byProducts: [],
    remarks: "Desi buffalo butter clarification",
    status: "Completed",
    createdAt: "2026-10-07T10:45:00Z",
  },
  {
    id: "mp-5",
    processingId: "MP-20261006-002",
    inputBatchId: "MR-20261006-001",
    milkType: "Sahiwal",
    inputQuantity: 300,
    inputUnit: "L",
    product: "Paneer",
    outputQuantity: 60,
    unit: "Kg",
    date: "06 Oct 2026",
    time: "04:30 PM",
    materialsUsed: [{ material: "Citric Acid", quantity: 500, unit: "g" }],
    byProducts: [{ byProduct: "Whey", quantity: 230, unit: "L" }],
    remarks: "Fresh cottage cheese pressed block",
    status: "Completed",
    createdAt: "2026-10-06T16:30:00Z",
  },
  {
    id: "mp-6",
    processingId: "MP-20261006-001",
    inputBatchId: "MR-20261006-002",
    milkType: "Goat",
    inputQuantity: 200,
    inputUnit: "L",
    product: "Goat Cheese",
    outputQuantity: 32,
    unit: "Kg",
    date: "06 Oct 2026",
    time: "03:15 PM",
    materialsUsed: [{ material: "Starter Culture", quantity: 150, unit: "g" }],
    byProducts: [],
    remarks: "Artisanal goat cheese curd",
    status: "Completed",
    createdAt: "2026-10-06T15:15:00Z",
  },
];

export const getProcessingBatches = async () => {
  try {
    const response = await api.get("/processing-batches");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: [...localProcessingBatches],
      backendPersisted: false,
      contractNotice: "Endpoint /api/processing-batches returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const createProcessingBatch = async (batchData) => {
  try {
    const response = await api.post("/processing-batches", batchData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const nextSeq = String(localProcessingBatches.length + 1).padStart(3, "0");
    const newEntry = {
      id: "mp-" + Date.now(),
      processingId: batchData.processingId || `MP-20261007-${nextSeq}`,
      inputBatchId: batchData.inputMilkBatch,
      milkType: batchData.milkType || "Cow",
      inputQuantity: Number(batchData.inputQuantity) || 0,
      inputUnit: "L",
      product: batchData.productType || "Liquid Milk",
      outputQuantity: Number(batchData.outputQuantity) || 0,
      unit: batchData.unit || "L",
      date: batchData.processingDate || "07 Oct 2026",
      time: batchData.processingTime || "10:30 AM",
      materialsUsed: batchData.materialsUsed || [],
      byProducts: batchData.byProducts || [],
      remarks: batchData.remarks || "",
      status: "Completed",
      createdAt: new Date().toISOString(),
    };
    localProcessingBatches = [newEntry, ...localProcessingBatches];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/processing-batches not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

export const deleteProcessingBatch = async (id) => {
  try {
    const response = await api.delete(`/processing-batches/${id}`);
    return { data: response.data, backendPersisted: true };
  } catch (err) {
    localProcessingBatches = localProcessingBatches.filter((item) => item.id !== id && item.processingId !== id);
    return {
      data: { success: true, id },
      backendPersisted: false,
      contractNotice: `Endpoint /api/processing-batches/:id not available (${err.response?.status || err.message}); entry removed from session.`
    };
  }
};

