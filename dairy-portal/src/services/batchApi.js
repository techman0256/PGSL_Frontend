
import api from "../api/axios";

export const getBatches = async () => {
  const response = await api.get("/batches");
  return response.data;
};

export const createBatch = async (batchData) => {
  const response = await api.post("/batches", batchData);
  return response.data;
};
