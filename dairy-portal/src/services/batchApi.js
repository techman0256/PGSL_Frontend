
import api from "../api/axios";

const unwrapBatchList = (responseData) => {
  const data = responseData?.data ?? responseData;
  const batches = data?.batches ?? data;

  if (!Array.isArray(batches)) {
    throw new Error("The milk batch response did not contain a batch list.");
  }

  return batches;
};

export const getBatches = async () => {
  const response = await api.get("/milk-batches");
  return unwrapBatchList(response.data);
};

export const createBatch = async (batchData) => {
  const response = await api.post("/milk-batches", batchData);
  const data = response.data?.data ?? response.data;
  return data?.batch ?? data;
};

export const getBatchById = async (id) => {
  const response = await api.get(`/milk-batches/${encodeURIComponent(id)}`);
  const data = response.data?.data ?? response.data;
  return data?.batch ?? data;
};
