"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Package,
  Barcode,
  Calendar,
  Layers,
  Box,
  DollarSign,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { useGetCategoriesQuery, useGetUnitsQuery } from "@/state/api";

type PriceRow = {
  label: string;
  amount: number | "";
};

export type ProductFormValues = {
  name: string;
  arabicName?: string;
  barcode?: string;
  prices: PriceRow[];
  stock?: number | null; // current stock (read-only)
  enteredAmount?: number | "";
  categoryId?: string;
  unitId?: string;
  productionDate?: string;
  expiryDate?: string;
  // image will be appended separately as file in FormData
};

type ProductFormProps = {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (formData: FormData) => Promise<void> | void;
  isEdit?: boolean;
};

export default function ProductForm({
  defaultValues,
  onSubmit,
  isEdit = false,
}: ProductFormProps) {
  // fetch categories & units (RTK Query)
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: units = [] } = useGetUnitsQuery();

  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      arabicName: defaultValues?.arabicName ?? "",
      barcode: defaultValues?.barcode ?? "",
      stock: defaultValues?.stock ?? 0,
      enteredAmount: defaultValues?.enteredAmount ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      unitId: defaultValues?.unitId ?? "",
      productionDate: defaultValues?.productionDate ?? "",
      expiryDate: defaultValues?.expiryDate ?? "",
      prices:
        defaultValues?.prices && defaultValues.prices.length
          ? defaultValues.prices
          : [{ label: "Cost Price", amount: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prices",
  });

  // Image uploader state
  const [imagePreview, setImagePreview] = useState<string | null>(
    // defaultValues may contain imageUrl
    (defaultValues as any)?.imageUrl ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // watch for stock so we can display it read-only
  const stock = watch("stock");

  useEffect(() => {
    // if the parent passed stock as number, ensure it's set
    if (defaultValues?.stock !== undefined) {
      setValue("stock", defaultValues.stock as any);
    }
  }, [defaultValues?.stock, setValue]);

  const onFilePicked = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onFilePicked(f);
  };

  // drag & drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onFilePicked(f);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const submitHandler = async (vals: ProductFormValues) => {
    // build FormData
    const data = new FormData();

    data.append("name", vals.name);
    if (vals.arabicName) data.append("nameArabic", vals.arabicName);
    if (vals.barcode) data.append("barcode", String(vals.barcode));
    if (vals.categoryId) data.append("categoryId", String(vals.categoryId));
    if (vals.unitId) data.append("unitId", String(vals.unitId));
    if (vals.productionDate) data.append("productionDate", vals.productionDate);
    if (vals.expiryDate) data.append("expiryDate", vals.expiryDate);
    // we send prices as JSON string
    data.append(
      "prices",
      JSON.stringify(
        vals.prices.map((p) => ({
          name: p.label,
          value: Number(p.amount || 0),
        }))
      )
    );

    // entered amount if present
    if (vals.enteredAmount !== "" && vals.enteredAmount !== undefined) {
      data.append("enteredAmount", String(vals.enteredAmount));
    }
    // always include stockQuantity as a number
    if (vals.stock !== undefined && vals.stock !== null) {
      data.append("stockQuantity", String(vals.stock));
    }

    if (imageFile) data.append("image", imageFile);

    return await onSubmit(data);
  };

  return (
    <motion.form
      onSubmit={handleSubmit(submitHandler)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-indigo-700/95">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h3>
        <div className="text-sm text-gray-500">
          Modern · responsive · blue/purple
        </div>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <Package className="text-indigo-500" />
            <span className="font-medium text-sm">Product Name</span>
          </div>
          <input
            {...register("name", { required: "Product name is required" })}
            className="p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </label>

        <label className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <Package className="text-purple-500" />
            <span className="font-medium text-sm">اسم المنتج</span>
          </div>
          <input
            {...register("arabicName")}
            className="p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="الاسم بالعربية"
          />
        </label>
      </div>

      {/* Barcode */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Barcode className="text-violet-500" />
          <span className="font-medium text-sm">Barcode</span>
        </div>
        <input
          {...register("barcode")}
          className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-200"
          placeholder="Enter barcode"
        />
      </div>

      {/* Prices table */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <DollarSign className="text-yellow-500" />
            <h4 className="font-semibold">Prices</h4>
          </div>
          <button
            type="button"
            onClick={() => append({ label: "", amount: "" })}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <PlusCircle /> Add price
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs">
                <th className="w-2/3 pb-2">Label</th>
                <th className="w-1/3 pb-2">Amount ($)</th>
                <th className="w-12 pb-2"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {fields.map((f, idx) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="align-top"
                  >
                    <td className="py-2 pr-3">
                      <Controller
                        control={control}
                        name={`prices.${idx}.label` as const}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="e.g. Cost Price, Retail Price"
                            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-300"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Controller
                        control={control}
                        name={`prices.${idx}.amount` as const}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200"
                          />
                        )}
                      />
                    </td>
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="p-2 rounded-md hover:bg-red-50 text-red-500"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock and entry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Box className="text-indigo-500" />
            <span className="font-medium text-sm">Current Stock</span>
          </div>
          <input
            {...register("stock")}
            disabled
            className="w-full p-2 rounded-lg bg-gray-100 border border-gray-200 cursor-not-allowed"
          />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <Box className="text-indigo-400" />
            <span className="font-medium text-sm">Enter Amount</span>
          </div>
          <input
            {...register("enteredAmount")}
            type="number"
            min={0}
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200"
            placeholder="Quantity received"
          />
        </div>
      </div>

      {/* Category & Unit row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Layers className="text-teal-500" />
            <span className="font-medium text-sm">Category</span>
          </div>
          <select
            {...register("categoryId")}
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-200"
          >
            <option value="">Choose category</option>
            {categories.map((c: any) => (
              <option
                key={c.categoryId ?? c.id ?? c.category_id}
                value={c.categoryId ?? c.id ?? c.categoryId}
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <Layers className="text-orange-500" />
            <span className="font-medium text-sm">Unit</span>
          </div>
          <select
            {...register("unitId")}
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Choose unit</option>
            {units.map((u: any) => (
              <option key={u.unitId ?? u.id} value={u.unitId ?? u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="text-blue-400" />
            <span className="font-medium text-sm">Production Date</span>
          </div>
          <input
            {...register("productionDate")}
            type="date"
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="text-red-400" />
            <span className="font-medium text-sm">Expiry Date</span>
          </div>
          <input
            {...register("expiryDate")}
            type="date"
            className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      {/* Modern Image Uploader */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="text-pink-500" />
          <span className="font-medium text-sm">Product Image</span>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4"
        >
          <div className="flex-1 text-center">
            <div className="mx-auto max-w-xs">
              <div className="flex items-center justify-center gap-3 mb-3">
                <UploadCloud className="text-indigo-400" />
                <div className="text-sm text-gray-600">
                  Drag & drop an image or
                </div>
              </div>

              <div className="flex justify-center">
                <label
                  htmlFor="imageInput"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:opacity-95"
                >
                  <ImageIcon />
                  <span className="text-sm">Choose image</span>
                </label>
                <input
                  id="imageInput"
                  ref={(r) => {
                    inputRef.current = r;
                  }}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  type="file"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="w-40 h-40 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="object-cover w-full h-full"
                alt="preview"
              />
            ) : (
              <div className="text-center text-gray-300">No preview</div>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:scale-[1.01] transition-transform"
        >
          {isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </motion.form>
  );
}
