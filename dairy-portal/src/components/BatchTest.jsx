
import { useEffect } from "react";
import { getBatches } from "../services/batchApi";

function BatchTest() {
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getBatches();
        console.log("Batches:", data);
      } catch (error) {
        console.error(
          "API Error:",
          error.response?.data || error.message
        );
      }
    };

    fetchBatches();
  }, []);

  return <h2>Batch API Test</h2>;
}

export default BatchTest;
