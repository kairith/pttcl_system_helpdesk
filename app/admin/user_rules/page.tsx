"use client";
import React, { useState, useEffect, Suspense } from "react";
import { tbl_users_rules } from "../../types/rules";
import { fetchUserRules } from "../user_rules/action";
import Header from "@/app/components/common/Header";
import Link from "next/link"; // Import Link for navigation

interface UserRulesProps {
  isSidebarOpen: boolean;
}

export default function UserRules({ isSidebarOpen }: UserRulesProps) {
  const [rules, setRules] = useState<tbl_users_rules[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRules() {
      const { rules, error } = await fetchUserRules();
      setRules(rules);
      setError(error);
    }
    loadRules();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
            }`}
          >
            <div className="flex items-center justify-center h-full">
              <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg font-semibold text-red-600">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "sm:ml-64" : "sm:ml-0"
          }`}
        >
          <div className="container mx-auto max-w-5xl">
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4 sm:mb-6 flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Rules
                </h1>
                <Link href="/admin/user_rules/add_rules">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Rules
                  </button>
                </Link>
              </div>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                        />
                      </svg>
                      <span className="text-lg font-medium text-gray-600">Loading roles...</span>
                    </div>
                  </div>
                }
              >
                {rules.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-4 text-lg font-semibold text-gray-600">No Rules found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-800 font-semibold rounded-t-lg sticky top-0">
                          <th className="text-left p-3 sm:p-4 first:rounded-tl-lg">Role ID</th>
                          <th className="text-left p-3 sm:p-4 last:rounded-tr-lg">Role Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map((row, index) => (
                          <tr
                            key={row.rules_id}
                            className={`border-b border-gray-200 hover:bg-blue-50 transition-all duration-150 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="p-3 sm:p-4 text-gray-700">{row.rules_id}</td>
                            <td className="p-3 sm:p-4 text-gray-700">{row.rules_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}