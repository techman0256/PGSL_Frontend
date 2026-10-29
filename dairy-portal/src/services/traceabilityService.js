import api from "../api/axios";
import endpoints from "../api/endpoints";

export const getBatchTraceability = async (batchId) => {
  const response = await api.get(
    `${endpoints.traceability}/milk-reception/${encodeURIComponent(batchId)}`
  );
  const data = response.data?.data ?? response.data;

  if (!data?.rootBatch || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error("The traceability response was incomplete.");
  }

  return data;
};
