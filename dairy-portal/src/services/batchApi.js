
import api from "../api/axios";
import endpoints from "../api/endpoints";

const unwrapBatchList = (responseData) => {
  const data = responseData?.data ?? responseData;
  const batches = data?.batches ?? data;

  if (!Array.isArray(batches)) {
    throw new Error("The milk batch response did not contain a batch list.");
  }

  return batches;
};

export const getBatches = async () => {
  const response = await api.get(endpoints.milkBatches);
  return unwrapBatchList(response.data);
};

export const createBatch = async (batchData) => {
  const response = await api.post(endpoints.milkBatches, batchData);
  const data = response.data?.data ?? response.data;
  return data?.batch ?? data;
};

export const updateBatch = async (id, batchData) => {
  const response = await api.put(
    `${endpoints.milkBatches}/${encodeURIComponent(id)}`,
    batchData
  );
  const data = response.data?.data ?? response.data;
  return data?.batch ?? data;
};

export const getBatchById = async (id) => {
  const response = await api.get(`${endpoints.milkBatches}/${encodeURIComponent(id)}`);
  const data = response.data?.data ?? response.data;
  return data?.batch ?? data;
};
