"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/state/api";
import ProductForm from "@/app/(components)/ProductForm";
export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct] = useCreateProductMutation();

  const handleCreate = async (data: FormData) => {
    try {
      await createProduct(data).unwrap();
      router.push("/inventory"); // redirect after success
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}
