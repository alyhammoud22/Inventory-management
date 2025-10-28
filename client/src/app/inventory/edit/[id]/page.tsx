"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useGetCategoriesQuery,
  useGetUnitsQuery,
} from "@/state/api";
import Header from "@/app/(components)/Header";

const EditProductPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const { data: product, isLoading } = useGetProductByIdQuery(
    id ? String(id) : skipToken
  );
  const { data: categories } = useGetCategoriesQuery();
  const { data: units } = useGetUnitsQuery();

  const [updateProduct] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    barcode: "",
    productionDate: "",
    expiryDate: "",
    categoryId: "",
    unitId: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || 0,
        stockQuantity: product.stockQuantity || 0,
        rating: product.rating || 0,
        barcode: product.barcode || "",
        productionDate: product.productionDate
          ? product.productionDate.split("T")[0]
          : "",
        expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
        categoryId: product.category?.categoryId?.toString() || "",
        unitId: product.unit?.unitId?.toString() || "",
      });
      setImagePreview(
        product.imageUrl
          ? `http://localhost:8000${product.imageUrl}`
          : "/placeholder-product.jpg"
      );
    }
  }, [product]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // temporary preview
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString());
    });

    if (imageFile) {
      form.append("image", imageFile);
    }

    try {
      await updateProduct({
        id: id as string,
        data: form, // ✅ send the FormData object
      }).unwrap();

      router.push("/inventory");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading product...
      </div>
    );
  }

  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle =
    "block w-full mb-3 p-2 border border-gray-400 rounded-md focus:ring focus:ring-blue-300";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 p-6 md:p-10 relative overflow-hidden">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-2xl p-6 md:p-8 z-10">
        <Header name={`Edit Product: ${product.name}`} />
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className={labelStyle}>Product Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Price ($)</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className={labelStyle}>Stock Quantity</label>
              <input
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>

          {/* Rating & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Rating</label>
              <input
                name="rating"
                type="number"
                value={formData.rating}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Barcode</label>
              <input
                name="barcode"
                type="text"
                value={formData.barcode}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Production & Expiry Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Production Date</label>
              <input
                name="productionDate"
                type="date"
                value={formData.productionDate}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Expiry Date</label>
              <input
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelStyle}>Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className={labelStyle}>Unit</label>
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Unit</option>
              {units?.map((u) => (
                <option key={u.unitId} value={u.unitId}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition-all"
              onClick={() => router.push("/inventory")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Right Section - Floating Image */}
      {product.imageUrl && (
        <div className="hidden md:flex justify-center items-center md:absolute md:right-[10%] md:top-1/2 md:-translate-y-1/2 z-0">
          <label className="relative group cursor-pointer">
            <img
              src={imagePreview || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-72 h-72 lg:w-80 lg:h-80 object-cover rounded-3xl shadow-2xl opacity-90 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500 ease-in-out"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-3xl transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 11l3.536 3.536M2 20h6l10-10L12 4 2 14v6z"
                />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      )}

      {/* Mobile Image (stacked layout) */}
      {product.imageUrl && (
        <div className="flex md:hidden justify-center mt-8">
          <img
            src={`http://localhost:8000${product.imageUrl}`}
            alt={product.name}
            className="w-64 h-64 object-cover rounded-2xl shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default EditProductPage;
