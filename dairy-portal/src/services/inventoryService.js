import api from "../api/axios";

// Initial seed data from Figma reference (Invetory Management.jpg)
let localFinishedInventory = [
  {
    id: "inv-fp-1",
    product: "Liquid Milk",
    quantity: 588,
    unit: "L",
    processingBatch: "MP-20261007-006",
    lastUpdated: "07 Oct 2026 · 12:40 PM",
    isByProduct: false,
  },
  {
    id: "inv-fp-2",
    product: "Curd",
    quantity: 300,
    unit: "Kg",
    processingBatch: "MP-20261007-005",
    lastUpdated: "07 Oct 2026 · 11:50 AM",
    isByProduct: false,
  },
  {
    id: "inv-fp-3",
    product: "Butter",
    quantity: 32,
    unit: "Kg",
    processingBatch: "MP-20261007-004",
    lastUpdated: "07 Oct 2026 · 11:20 AM",
    isByProduct: false,
  },
  {
    id: "inv-fp-4",
    product: "Ghee",
    quantity: 13,
    unit: "Kg",
    processingBatch: "MP-20261007-003",
    lastUpdated: "07 Oct 2026 · 10:45 AM",
    isByProduct: false,
  },
  {
    id: "inv-fp-5",
    product: "Paneer",
    quantity: 60,
    unit: "Kg",
    processingBatch: "MP-20261006-002",
    lastUpdated: "06 Oct 2026 · 04:30 PM",
    isByProduct: false,
  },
  {
    id: "inv-fp-6",
    product: "Goat Cheese",
    quantity: 32,
    unit: "Kg",
    processingBatch: "MP-20261006-001",
    lastUpdated: "06 Oct 2026 · 03:15 PM",
    isByProduct: false,
  },
  {
    id: "inv-fp-7",
    product: "Separated Cream",
    quantity: 12,
    unit: "L",
    processingBatch: "MP-20261007-006",
    lastUpdated: "07 Oct 2026 · 12:40 PM",
    isByProduct: true,
  },
];

let localRawMaterials = [
  {
    id: "inv-rm-1",
    material: "Citric Acid",
    availableQuantity: 1.5,
    unit: "Kg",
    lastUsed: "06 Oct 2026 · 04:30 PM",
    stockLevel: "Low Stock",
    minThreshold: 5.0,
  },
  {
    id: "inv-rm-2",
    material: "Starter Culture",
    availableQuantity: 250,
    unit: "g",
    lastUsed: "07 Oct 2026 · 11:50 AM",
    stockLevel: "Low Stock",
    minThreshold: 500,
  },
  {
    id: "inv-rm-3",
    material: "Salt",
    availableQuantity: 25,
    unit: "Kg",
    lastUsed: "06 Oct 2026 · 03:15 PM",
    stockLevel: "In Stock",
    minThreshold: 10,
  },
  {
    id: "inv-rm-4",
    material: "Packaging Materials",
    availableQuantity: 8400,
    unit: "pcs",
    lastUsed: "07 Oct 2026 · 12:40 PM",
    stockLevel: "In Stock",
    minThreshold: 2000,
  },
];

export const getInventory = async () => {
  try {
    const response = await api.get("/inventory");
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    return {
      data: {
        finishedProducts: [...localFinishedInventory],
        rawMaterials: [...localRawMaterials],
        summary: {
          totalFinishedProducts: localFinishedInventory.length,
          totalRawMaterials: localRawMaterials.length,
          lowStockCount: localRawMaterials.filter((m) => m.stockLevel === "Low Stock").length,
        },
      },
      backendPersisted: false,
      contractNotice: "Endpoint /api/inventory returned " + (err.response?.status || "network unavailable") + "; loaded reference data."
    };
  }
};

export const addRawMaterial = async (materialData) => {
  try {
    const response = await api.post("/inventory/raw-materials", materialData);
    return { data: response.data?.data || response.data, backendPersisted: true };
  } catch (err) {
    const newEntry = {
      id: "inv-rm-" + Date.now(),
      material: materialData.material,
      availableQuantity: Number(materialData.quantity) || 0,
      unit: materialData.unit || "Kg",
      lastUsed: "Just now",
      stockLevel: Number(materialData.quantity) < 10 ? "Low Stock" : "In Stock",
      minThreshold: Number(materialData.minThreshold) || 5,
    };
    localRawMaterials = [...localRawMaterials, newEntry];
    return {
      data: newEntry,
      backendPersisted: false,
      contractNotice: `Endpoint /api/inventory/raw-materials not available (${err.response?.status || err.message}); entry saved locally in session.`
    };
  }
};

