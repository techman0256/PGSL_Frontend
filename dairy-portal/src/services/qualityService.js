import api from "../api/axios";
import endpoints from "../api/endpoints";
import { normalizeMilkBatch } from "./receptionService";

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value || "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toNumber = (value) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return Number(value.$numberDecimal);
  }
  return Number(value);
};

const normalizeQualityTest = (test) => ({
  ...test,
  id: test._id || test.id,
  batchId:
    test.batchId ||
    (typeof test.milkBatchId === "object"
      ? test.milkBatchId?.milkBatchId
      : test.milkBatchId),
  testDate: formatDate(test.testDate),
  quantity: test.quantity == null ? test.quantity : toNumber(test.quantity),
});

const getTestList = (responseData) => {
  const data = responseData?.data ?? responseData;
  const tests = data?.tests ?? data;

  if (!Array.isArray(tests)) {
    throw new Error("The quality-test response did not contain a test list.");
  }

  return tests.map(normalizeQualityTest);
};

export const getQualityTests = async () => {
  const response = await api.get(endpoints.qualityTests);
  return { data: getTestList(response.data), backendPersisted: true };
};

export const getAvailableBatchesForTesting = async () => {
  const response = await api.get(`${endpoints.qualityTests}/available-batches`);
  const data = response.data?.data ?? response.data;
  const batches = data?.batches ?? data;

  if (!Array.isArray(batches)) {
    throw new Error("The available-batches response did not contain a batch list.");
  }

  return batches.map(normalizeMilkBatch);
};

export const createQualityTest = async (testData) => {
  const response = await api.post(endpoints.qualityTests, {
    ...testData,
    milkBatchId: testData.milkBatchId || testData.batchId,
  });
  const data = response.data?.data ?? response.data;
  return {
    data: normalizeQualityTest(data?.test ?? data),
    backendPersisted: true,
  };
};

export const deleteQualityTest = async (id) => {
  const response = await api.delete(`${endpoints.qualityTests}/${encodeURIComponent(id)}`);
  return { data: response.data, backendPersisted: true };
};
