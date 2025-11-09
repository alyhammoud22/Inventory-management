"use client";

import { useGetProductsQuery, useDeleteProductMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  IconButton,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AddBox as AddBoxIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Category as CategoryIcon,
  LocalOffer as PriceIcon,
  Numbers as BarcodeIcon,
  Layers as UnitIcon,
  DateRange as DateIcon,
  ProductionQuantityLimits as StockIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Barcode from "react-barcode";

type ProductType = {
  productId: number;
  name: string;
  nameArabic?: string | null;
  barcode?: string;
  prices?: { id: number; name: string; value: number }[];
  rating?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  productionDate?: string | null;
  expiryDate?: string | null;
  category?: { categoryId: number; name: string } | null;
  unit?: { unitId: number; name: string } | null;
};

type FilterType = "all" | "lowStock" | "expired" | "expiringSoon" | "healthy";

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const router = useRouter();

  const safeProducts: ProductType[] = useMemo(() => {
    return (products || []).map((p: any) => ({
      ...p,
      productId: Number(p.productId),
      name: p.name,
      nameArabic: p.nameArabic || "",
    }));
  }, [products]);

  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 30);

  const stats = useMemo(() => {
    const total = safeProducts.length;
    const lowStock = safeProducts.filter((p) => p.stockQuantity < 10).length;
    const expired = safeProducts.filter(
      (p) => p.expiryDate && new Date(p.expiryDate) < today
    ).length;
    const expiringSoon = safeProducts.filter(
      (p) =>
        p.expiryDate &&
        new Date(p.expiryDate) >= today &&
        new Date(p.expiryDate) <= soon
    ).length;
    const healthyStock = total - lowStock - expired - expiringSoon;
    return { total, lowStock, expired, expiringSoon, healthyStock };
  }, [safeProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...safeProducts];
    if (activeFilter === "lowStock") {
      filtered = filtered.filter((p) => p.stockQuantity < 10);
    } else if (activeFilter === "expired") {
      filtered = filtered.filter(
        (p) => p.expiryDate && new Date(p.expiryDate) < today
      );
    } else if (activeFilter === "expiringSoon") {
      filtered = filtered.filter(
        (p) =>
          p.expiryDate &&
          new Date(p.expiryDate) >= today &&
          new Date(p.expiryDate) <= soon
      );
    } else if (activeFilter === "healthy") {
      filtered = filtered.filter(
        (p) =>
          p.stockQuantity >= 10 &&
          (!p.expiryDate || new Date(p.expiryDate) > soon)
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.barcode?.toLowerCase().includes(term) ||
          p.category?.name.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [safeProducts, searchTerm, activeFilter]);

  const handleEdit = (id: number) => router.push(`/inventory/edit/${id}`);
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        alert("✅ Product deleted successfully!");
      } catch {
        alert("❌ Failed to delete product.");
      }
    }
  };

  const getRowColor = (product: ProductType) => {
    const today = new Date();
    const expiry = product.expiryDate ? new Date(product.expiryDate) : null;

    if (expiry && expiry < today) return "row-expired";
    if (
      expiry &&
      expiry <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    )
      return "row-expiring";
    if (product.stockQuantity < 10) return "row-lowstock";
    return "row-healthy";
  };

  // 📊 DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "barcode",
      headerName: "Barcode",
      width: 170,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BarcodeIcon sx={{ color: "#1976d2" }} />
          <span>Barcode</span>
        </Box>
      ),
      renderCell: (params) =>
        params.value ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Barcode
              value={params.value}
              height={20}
              width={1}
              displayValue={false} // hides text inside the barcode
              margin={0}
              background="transparent"
            />
            <Typography
              variant="caption"
              sx={{ fontSize: 10, mt: 0.5, textAlign: "center" }}
            >
              {params.value}
            </Typography>
          </Box>
        ) : (
          "—"
        ),
    },

    {
      field: "name",
      headerName: "Product Name",
      width: 300,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InventoryIcon sx={{ color: "#16a34a" }} />
          <span>Product</span>
        </Box>
      ),
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // This will push the Arabic name to the end
            alignItems: "center", // Align items vertically centered
          }}
        >
          {/* English Name */}
          <span
            style={{
              fontSize: "1.05em",
              fontWeight: 600,
              color: "#111",
              fontFamily: "'Inter', 'Roboto', sans-serif",
            }}
          >
            {params.row.name || "—"}
          </span>

          {/* Arabic Name */}
          {params.row.nameArabic && (
            <span
              style={{
                fontSize: "1.05em",
                fontWeight: 600,
                color: "#111",
                direction: "rtl", // Right-to-left for Arabic
                fontFamily: "'tajawal', sans-serif",
              }}
            >
              {params.row.nameArabic}
            </span>
          )}
        </div>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CategoryIcon sx={{ color: "#7031d6" }} />
          <span>Category</span>
        </Box>
      ),
      valueGetter: (value, row) => row.category?.name || "—",
    },
    {
      field: "costPrice",
      headerName: "Cost Price",
      width: 130,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PriceIcon sx={{ color: "#eab308" }} />
          <span>Cost Price</span>
        </Box>
      ),
      valueGetter: (value, row) => {
        // find the price with id = 1 or name = "Cost"
        const cost = row.prices?.find(
          (p: any) => p.id === 1 || p.name.toLowerCase().includes("cost")
        );
        return cost ? `$${cost.value.toFixed(2)}` : "—";
      },
    },
    {
      field: "stockQuantity",
      headerName: "Stock",
      width: 100,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StockIcon sx={{ color: "#f59e0b" }} />
          <span>Stock</span>
        </Box>
      ),
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 120,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UnitIcon sx={{ color: "#3b82f6" }} />
          <span>Unit</span>
        </Box>
      ),
      valueGetter: (value, row) => row.unit?.name || "—",
    },
    {
      field: "expiryDate",
      headerName: "Expiry",
      width: 180,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon sx={{ color: "#0288d1" }} />
          <span>Expiry</span>
        </Box>
      ),
      renderCell: (params) => {
        if (!params.row.expiryDate) return "—";

        const expiry = new Date(params.row.expiryDate);
        const today = new Date();

        const daysLeft = Math.ceil(
          (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let color = "#16a34a"; // green (healthy)
        let label = "";

        if (daysLeft < 0) {
          color = "#dc2626"; // red
          label = `Expired ${Math.abs(daysLeft)}d ago`;
        } else if (daysLeft <= 30) {
          color = "#f59e0b"; // orange
          label = `Expiring in ${daysLeft}d`;
        } else {
          color = "#16a34a"; // green
          label = `In ${daysLeft}d`;
        }

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#111", fontWeight: 500 }}>
              {expiry.toLocaleDateString()}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color, fontWeight: "bold", fontSize: "0.8rem" }}
            >
              {label}
            </Typography>
          </Box>
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderHeader: () => <span>Actions</span>,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row.productId)}
              sx={{ color: "#1976d2" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.productId)}
              sx={{ color: "#d32f2f" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  if (isError)
    return (
      <div className="text-center text-red-500 py-10">
        ❌ Failed to fetch products
      </div>
    );

  return (
    <div className="flex flex-col p-5 bg-gray-50 min-h-screen">
      <Header name="Inventory" />

      {/* 🔹 Stats Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
        {(
          [
            ["Total", stats.total, "#1976d2", InventoryIcon, "all"],
            ["Low Stock", stats.lowStock, "#f59e0b", WarningIcon, "lowStock"],
            ["Expired", stats.expired, "#dc2626", ErrorIcon, "expired"],
            [
              "Expiring Soon",
              stats.expiringSoon,
              "#ea580c",
              AccessTimeIcon,
              "expiringSoon",
            ],
            [
              "Healthy",
              stats.healthyStock,
              "#16a34a",
              CheckCircleIcon,
              "healthy",
            ],
          ] as const
        ).map(([title, value, color, Icon, filter]) => {
          const IconComp = Icon as React.ElementType;
          return (
            <Card
              key={String(filter)}
              onClick={() => setActiveFilter(filter as FilterType)}
              sx={{
                borderColor: color,
                backgroundColor: `${color}10`,
                color,
                cursor: "pointer",
                transition: "all 0.25s ease",
                borderRadius: "1rem",
                "&:hover": {
                  transform: "translateY(-5px) scale(1.03)",
                  boxShadow: `0px 6px 12px ${color}40`,
                },
              }}
            >
              <CardContent className="flex flex-col items-center">
                <IconComp fontSize="large" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {value as number}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* 🔹 Search + Add */}
      <Box className="flex justify-between items-center bg-white shadow rounded-lg px-4 py-3 mt-6 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
          <CategoryIcon color="primary" />
          <span>Product List</span>
        </div>
        <div className="flex items-center gap-3">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "#f9fafb", borderRadius: 1 }}
          />
          <Tooltip title="Add Product">
            <IconButton
              onClick={() => router.push("/inventory/create")}
              sx={{ color: "#2e7d32" }}
            >
              <AddBoxIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </Box>

      {/* 🔹 Table */}
      <Box
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 overflow-hidden"
        sx={{
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#f9fafb",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
        }}
      >
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row.productId}
          autoHeight
          disableRowSelectionOnClick
          getRowClassName={(params) => getRowColor(params.row)} // ✅ dynamically assign class based on product
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f3f4f6",
              fontWeight: "bold",
              color: "#374151",
              fontSize: "15px",
            },
            "& .MuiDataGrid-cell": {
              padding: "10px",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e0f2fe !important", // nice hover color
            },
            // ✅ Define color mappings here
            "& .row-expired": {
              backgroundColor: "#fdecea !important",
            },
            "& .row-expiring": {
              backgroundColor: "#fff4e5 !important",
            },
            "& .row-lowstock": {
              backgroundColor: "#e3f2fd !important",
            },
            "& .row-healthy": {
              backgroundColor: "#e8f5e9 !important",
            },
          }}
        />
      </Box>
    </div>
  );
};

export default Inventory;
