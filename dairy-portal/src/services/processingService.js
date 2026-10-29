import api from "../api/axios";
import endpoints from "../api/endpoints";

const normalizeProcessingBatch = (batch) => ({
  ...batch,
  id: batch._id || batch.id,
  processingId: batch.processingId,
  inputBatchId: batch.inputBatchId || batch.inputMilkBatch,
  product: batch.product || batch.productType,
  unit: batch.unit || batch.outputUnit,
  date: batch.processingDate || batch.date,
  time: batch.processingTime || batch.time,
  materialsUsed: batch.materialsUsed || batch.rawMaterialsUsed || [],
});

export const getAvailableStorageBatches = async () => {
  const response = await api.get(`${endpoints.processing}/available-storage-batches`);
  const data = response.data?.data ?? response.data;
  return data?.batches ?? data;
};

export const getProcessingBatches = async () => {
  const response = await api.get(endpoints.processing);
  const data = response.data?.data ?? response.data;
  const batches = data?.batches ?? data;

  if (!Array.isArray(batches)) {
    throw new Error("The processing response did not contain a batch list.");
  }

  return {
    data: batches.map(normalizeProcessingBatch),
    backendPersisted: true,
  };
};

export const createProcessingBatch = async (batchData) => {
  const response = await api.post(endpoints.processing, {
    inputMilkBatch: batchData.inputMilkBatch,
    inputQuantity: Number(batchData.inputQuantity),
    processingDate: batchData.processingDate,
    processingTime: batchData.processingTime,
    productType: batchData.productType,
    outputQuantity: Number(batchData.outputQuantity),
    outputUnit: batchData.unit,
    rawMaterialsUsed: (batchData.materialsUsed || []).map((material) => ({
      material: material.material,
      quantityUsed: Number(material.quantityUsed ?? material.quantity),
      unit: material.unit,
    })),
    byProducts: batchData.byProducts || [],
    remarks: batchData.remarks || "",
  });
  const data = response.data?.data ?? response.data;

  return {
    data: normalizeProcessingBatch(data?.batch ?? data),
    backendPersisted: true,
  };
};

export const deleteProcessingBatch = async (id) => {
  const response = await api.delete(`${endpoints.processing}/${encodeURIComponent(id)}`);
  return { data: response.data, backendPersisted: true };
};
