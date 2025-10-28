"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useGetUnitsQuery,
} from "@/state/api";
import {
  PlusCircle,
  Barcode,
  Package,
  DollarSign,
  Boxes,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

const CreateProductPage = () => {
  const router = useRouter();
  const { data: categories } = useGetCategoriesQuery();
  const { data: units } = useGetUnitsQuery();
  const [createProduct] = useCreateProductMutation();

  const [formData, setFormData] = useState({
    productId: uuidv4(),
    barcode: "",
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    categoryId: "",
    subCategoryId: "",
    unitId: "",
    productionDate: "",
    expiryDate: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("stockQuantity", formData.stockQuantity.toString());
    data.append("barcode", formData.barcode);
    data.append("categoryId", formData.categoryId);
    data.append("unitId", formData.unitId);
    data.append("productionDate", formData.productionDate);
    data.append("expiryDate", formData.expiryDate);

    if (imageFile) data.append("image", imageFile); // <-- your selected file

    try {
      await createProduct(data).unwrap();
      router.push("/products");
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-blue-600" size={28} />
          <h1 className="text-2xl font-semibold text-gray-800">
            Add New Product
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          encType="multipart/form-data"
        >
          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Barcode size={16} /> Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter barcode"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Package size={16} /> Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <DollarSign size={16} /> Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="0.00"
              required
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Boxes size={16} /> Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="0"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              max="5"
              step="0.1"
              placeholder="0 - 5"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select unit</option>
              {units?.map((unit) => (
                <option key={unit.unitId} value={unit.unitId}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Production Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={16} /> Production Date
            </label>
            <input
              type="date"
              name="productionDate"
              value={formData.productionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={16} /> Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Image Upload */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <ImageIcon size={16} /> Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
