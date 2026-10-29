import api from "../api/axios";
import endpoints from "../api/endpoints";

const getResponseData = (response) => response.data?.data ?? response.data;

export const getInventory = async () => {
  const [summaryResponse, finishedResponse, rawMaterialsResponse] = await Promise.all([
    api.get(endpoints.inventory.summary),
    api.get(endpoints.inventory.finishedProducts),
    api.get(endpoints.inventory.rawMaterials),
  ]);

  const summary = getResponseData(summaryResponse);
  const finishedData = getResponseData(finishedResponse);
  const rawMaterialsData = getResponseData(rawMaterialsResponse);

  const finishedProducts = finishedData?.products ?? finishedData;
  const rawMaterials = rawMaterialsData?.materials ?? rawMaterialsData;

  if (!Array.isArray(finishedProducts) || !Array.isArray(rawMaterials)) {
    throw new Error("The inventory response did not contain product and material lists.");
  }

  return {
    data: {
      finishedProducts,
      rawMaterials,
      summary: {
        totalFinishedProducts: summary?.totalFinishedProducts?.count ?? finishedProducts.length,
        totalRawMaterials: summary?.totalRawMaterials?.count ?? rawMaterials.length,
        lowStockCount: summary?.lowStockItems?.count ??
          rawMaterials.filter((material) => material.stockLevel === "Low Stock").length,
        mainProductCount: summary?.totalFinishedProducts?.mainProductCount,
        byProductCount: summary?.totalFinishedProducts?.byProductCount,
        lowStockItems: summary?.lowStockItems?.items ?? [],
      },
    },
    backendPersisted: true,
  };
};

export const addRawMaterial = async (materialData) => {
  const materialsResponse = await api.get(endpoints.inventory.rawMaterials);
  const materials = getResponseData(materialsResponse)?.materials ?? [];
  const existing = materials.find(
    (material) => material.material.toLowerCase() === materialData.material.trim().toLowerCase()
  );
  const response = existing
    ? await api.put(`${endpoints.inventory.rawMaterials}/${existing._id}`, {
        addQuantity: Number(materialData.quantity),
      })
    : await api.post(endpoints.inventory.rawMaterials, {
        material: materialData.material,
        availableQuantity: Number(materialData.quantity),
        unit: materialData.unit,
        lowStockThreshold: Number(materialData.minThreshold),
      });
  const data = getResponseData(response);

  return {
    data: data?.material ?? data,
    backendPersisted: true,
  };
};

export const getRawMaterials = async () => {
  const response = await api.get(endpoints.inventory.rawMaterials);
  const data = getResponseData(response);
  return data?.materials ?? data;
};
