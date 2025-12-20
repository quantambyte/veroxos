"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllRestaurants } from "@/lib/api/orders";
import Link from "next/link";

export default function Home() {
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: getAllRestaurants,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <div className="text-lg font-medium text-gray-700">
            Loading restaurants...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Kitchen Order Management
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Select a restaurant to manage orders
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
            <p className="text-gray-600">No restaurants available</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/kitchen/${restaurant.slug}`}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {restaurant.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {restaurant.slug}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0">
                    <div
                      className={`h-3 w-3 rounded-full shadow-sm ${
                        restaurant.isActive
                          ? "bg-green-500 ring-2 ring-green-200"
                          : "bg-gray-400"
                      }`}
                      title={restaurant.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                </div>
                <div className="mt-5 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  View Kitchen
                  <svg
                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
