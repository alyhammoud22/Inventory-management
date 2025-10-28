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
  Modal,
  Fade,
  Backdrop,
  Divider,
  Button,
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
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type ProductType = {
  productId: number;
  name: string;
  barcode?: string;
  price?: number;
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
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const router = useRouter();

  const safeProducts: ProductType[] = useMemo(() => {
    return (products || []).map((p: any) => ({
      ...p,
      productId: Number(p.productId),
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

  const columns: GridColDef[] = [
    { field: "barcode", headerName: "Barcode", width: 140 },
    { field: "name", headerName: "Name", width: 220 },
    {
      field: "الوصف بالعربية",
      headerName: "وصف المنتج",
      width: 220,
      renderCell: (params) => (
        <div
          style={{
            fontSize: "0.85em",
            color: "#555",
            direction: "rtl", // ensures Arabic text looks correct
            fontFamily: "Tajawal, 'Noto Naskh Arabic', sans-serif",
          }}
        >
          {params.row.nameArabic || ""}
        </div>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      valueGetter: (value, row) => row.category?.name || "—",
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      type: "number",
      valueGetter: (value, row) => `$${row.price?.toFixed(2) || "0.00"}`,
    },
    {
      field: "stockQuantity",
      headerName: "Stock",
      width: 100,
      type: "number",
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 120,
      valueGetter: (value, row) => row.unit?.name || "—",
    },
    {
      field: "expiryDate",
      headerName: "Expiry",
      width: 140,
      valueGetter: (value, row) =>
        row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
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

  const CardButton = ({
    title,
    value,
    color,
    icon: Icon,
    filter,
  }: {
    title: string;
    value: number;
    color: string;
    icon: any;
    filter: FilterType;
  }) => (
    <Card
      onClick={() => setActiveFilter(filter)}
      className={`cursor-pointer transition-transform hover:scale-105 ${
        activeFilter === filter ? "ring-4 ring-offset-2" : ""
      }`}
      sx={{
        borderColor: color,
        backgroundColor: `${color}10`,
        color,
      }}
    >
      <CardContent className="flex flex-col items-center">
        <Icon fontSize="large" />
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

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

      {/* 🔹 Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
        <CardButton
          title="Total"
          value={stats.total}
          color="#1976d2"
          icon={InventoryIcon}
          filter="all"
        />
        <CardButton
          title="Low Stock"
          value={stats.lowStock}
          color="#f59e0b"
          icon={WarningIcon}
          filter="lowStock"
        />
        <CardButton
          title="Expired"
          value={stats.expired}
          color="#dc2626"
          icon={ErrorIcon}
          filter="expired"
        />
        <CardButton
          title="Expiring Soon"
          value={stats.expiringSoon}
          color="#ea580c"
          icon={AccessTimeIcon}
          filter="expiringSoon"
        />
        <CardButton
          title="Healthy"
          value={stats.healthyStock}
          color="#16a34a"
          icon={CheckCircleIcon}
          filter="healthy"
        />
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
              onClick={() => router.push("/inventory/add")}
              sx={{ color: "#2e7d32" }}
            >
              <AddBoxIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </Box>

      {/* 🔹 Table */}
      <Box className="bg-white shadow rounded-lg border border-gray-200 mt-5 overflow-hidden">
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row.productId}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(params) => setSelectedProduct(params.row)}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f3f4f6",
              fontWeight: "bold",
              color: "#374151",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(243,244,246,0.4)",
              cursor: "pointer",
            },
          }}
        />
      </Box>
    </div>
  );
};

export default Inventory;
