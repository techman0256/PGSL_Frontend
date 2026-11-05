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
  const response =
    materialData.mode === "restock"
      ? await api.put(`${endpoints.inventory.rawMaterials}/${materialData.materialId}`, {
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

export const addFinishedProduct = async (productData) => {
  const response = await api.post(endpoints.inventory.finishedProducts, {
    product: productData.product.trim(),
    quantity: Number(productData.quantity),
    unit: productData.unit,
  });
  const data = getResponseData(response);

  return {
    data: data?.product ?? data,
    backendPersisted: true,
  };
};

export const getRawMaterials = async () => {
  const response = await api.get(endpoints.inventory.rawMaterials);
  const data = getResponseData(response);
  return data?.materials ?? data;
};

export const getFinishedProducts = async () => {
  const response = await api.get(endpoints.inventory.finishedProducts);
  const data = getResponseData(response);
  return data?.products ?? data;
};
