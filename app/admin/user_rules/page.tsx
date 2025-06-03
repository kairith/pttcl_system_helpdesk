'use client';

import { useState, useEffect, Suspense } from 'react';
import { tbl_users_rules } from '../../types/rules';
import NavSlide from '@/app/components/navbar/navbar';
import { fetchUserRules } from '../user_rules/action';

export default function UserRules() {
  const [rules, setRules] = useState<tbl_users_rules[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('October');

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Optionally, add logic to filter rules based on selected period
  };

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
      <div className="flex">
        <NavSlide onToggle={handleSidebarToggle} />
        <main
          className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <div
            className={`transition-opacity duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="text-red-500 text-center">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <NavSlide onToggle={handleSidebarToggle} />
      <main
        className={`flex-1 p-4 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className="container mx-auto">
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rules Table</h1>
                
              </div>
              <Suspense
                fallback={
                  <div className="text-center text-gray-600 py-4">
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500 mr-3"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                        ></path>
                      </svg>
                      <span>Loading rules...</span>
                    </div>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 rounded-xl">
                        <th className="text-left p-3 font-bold text-gray-800">Rules ID</th>
                        <th className="text-left p-3 font-bold text-gray-800">Rules Name</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule) => (
                        <tr key={rule.rules_id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 text-gray-700">{rule.rules_id}</td>
                          <td className="p-3 text-gray-700">{rule.rules_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}