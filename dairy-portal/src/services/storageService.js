import api from "../api/axios";
import endpoints from "../api/endpoints";

export const siloCapacities = {
  "Silo 01": 5000,
  "Silo 02": 2000,
  "Silo 03": 1000,
  "Silo 04": 2000,
};

const normalizeStorageRecord = (record) => ({
  ...record,
  id: record._id || record.id,
  storageRecordId: record.storageRecordId || record.recordId,
  batchId: record.batchId || record.milkBatchId?.milkBatchId,
  milkType: record.milkType || record.milkBatchId?.milkType,
  temperature: Number(record.storageTemperature ?? record.temperature),
  date: record.storageDate || record.date,
  time: record.storageTime || record.time,
});

export const getAvailableBatchesForStorage = async () => {
  const response = await api.get(`${endpoints.rawMilkStorage}/available-batches`);
  const data = response.data?.data ?? response.data;
  return (data?.batches ?? data).map((batch) => ({
    ...batch,
    batchId: batch.batchId || batch.milkBatchId,
    milkType: batch.milkType,
  }));
};

export const getStorageRecords = async () => {
  const response = await api.get(endpoints.rawMilkStorage);
  const data = response.data?.data ?? response.data;
  const records = data?.records ?? data;

  if (!Array.isArray(records)) {
    throw new Error("The storage response did not contain a record list.");
  }

  return {
    data: records.map(normalizeStorageRecord),
    backendPersisted: true,
  };
};

export const createStorageRecord = async (recordData) => {
  const response = await api.post(endpoints.rawMilkStorage, {
    batchId: recordData.batchId,
    siloNumber: recordData.siloNumber,
    storageTemperature: Number(recordData.temperature),
    storageDate: recordData.date,
    storageTime: recordData.time,
    quantity: Number(recordData.quantity),
    remarks: recordData.remarks || "",
  });
  const data = response.data?.data ?? response.data;

  return {
    data: normalizeStorageRecord(data?.record ?? data),
    backendPersisted: true,
  };
};

export const deleteStorageRecord = async (id) => {
  const response = await api.delete(`${endpoints.rawMilkStorage}/${encodeURIComponent(id)}`);
  return { data: response.data, backendPersisted: true };
};
