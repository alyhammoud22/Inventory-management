"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/app/(components)/ProductForm";
import { useGetProductByIdQuery, useUpdateProductMutation } from "@/state/api";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  // ✅ Ensure it's always a string, not string[]
  const productId = Array.isArray(id) ? id[0] : id || "";

  const { data: product, isLoading } = useGetProductByIdQuery(productId);
  const [updateProduct] = useUpdateProductMutation();

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  // ✅ Adapt API response to ProductForm format
  const defaultValues = {
    name: product.name,
    arabicName: product.nameArabic ?? "",
    barcode: product.barcode ?? "",
    stock: product.stockQuantity ?? 0,
    categoryId: product.category?.categoryId
      ? String(product.category.categoryId)
      : "",
    unitId: product.unit?.unitId ? String(product.unit.unitId) : "",
    productionDate: product.productionDate
      ? product.productionDate.split("T")[0]
      : "",
    expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
    prices: (product.prices as any) ?? [{ label: "Cost Price", amount: "" }],
    imageUrl: product.imageUrl ?? null,
  };

  const handleUpdate = async (fd: FormData) => {
    try {
      await updateProduct({ id: productId, data: fd }).unwrap();
      router.push("/inventory");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update product");
    }
  };

  return (
    <div className="p-6">
      <ProductForm
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        isEdit
      />
    </div>
  );
}
