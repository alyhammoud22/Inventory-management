import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ────────────────
   🔸 Interfaces
──────────────── */
export interface Category {
  categoryId: string;
  name: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  subCategoryId: string;
  name: string;
  categoryId: string;
}

export interface Unit {
  unitId: string;
  name: string;
}

export interface Product {
  productId: string;
  barcode: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  imageUrl?: string;
  productionDate?: string;
  expiryDate?: string;
  category?: Category;
  subCategory?: SubCategory;
  unit?: Unit;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

/* ────────────────
   ⚙️ API Configuration
──────────────── */
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Users",
    "Expenses",
    "Categories",
    "Units",
  ],
  endpoints: (build) => ({
    /* ───── Dashboard ───── */
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    /* ───── Products ───── */
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    getProductById: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<Product, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data, // ✅ fetchBaseQuery auto-handles FormData
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: build.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    /* ───── Categories ───── */
    getCategories: build.query<Category[], void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, { name: string }>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    createSubCategory: build.mutation<
      SubCategory,
      { categoryId: string; name: string }
    >({
      query: ({ categoryId, name }) => ({
        url: `/categories/${categoryId}/subcategory`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Categories"],
    }),

    /* ───── Units ───── */
    getUnits: build.query<Unit[], void>({
      query: () => "/units",
      providesTags: ["Units"],
    }),
    createUnit: build.mutation<Unit, { name: string }>({
      query: (body) => ({
        url: "/units",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Units"],
    }),

    /* ───── Users ───── */
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    /* ───── Expenses ───── */
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

/* ────────────────
   📦 Export Hooks
──────────────── */
export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateSubCategoryMutation,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
} = api;
