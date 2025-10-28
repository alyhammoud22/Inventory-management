"use client";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useGetProductsQuery } from "@/state/api";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import Image from "next/image";
import Link from "next/link";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (isError || !products)
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );

  return (
    <div className="mx-auto pb-10 w-full max-w-7xl px-4">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded-md bg-white shadow-sm">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-transparent outline-none"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <Link
          href="/products/create"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Product
        </Link>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div
            key={product.productId}
            className="border rounded-xl p-4 shadow-md hover:shadow-lg transition-all bg-white"
          >
            <div className="flex flex-col items-center text-center">
              <Image
                src={
                  "http://localhost:8000" + product.imageUrl ||
                  "/default-placeholder.png"
                }
                alt={product.name}
                width={140}
                height={140}
                className="rounded-xl object-cover mb-3 w-36 h-36"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{product.barcode}</p>
              <div className="text-gray-800 font-medium mb-1">
                ${product.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Stock: {product.stockQuantity} {product.unit?.name || ""}
              </div>
              {product.category && (
                <div className="text-xs text-gray-500 italic mt-1">
                  {product.category.name}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-1">
                <span className="block">
                  🏭{" "}
                  {product.productionDate
                    ? new Date(product.productionDate).toLocaleDateString()
                    : "—"}
                </span>
                <span className="block">
                  ⏳{" "}
                  {product.expiryDate
                    ? new Date(product.expiryDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              {product.rating && (
                <div className="flex items-center mt-2">
                  <Rating rating={product.rating} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
