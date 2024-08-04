import React from "react";

type AdvancedSearchOptionsProps = {
  category: string;
  setCategory: (category: string) => void;
  mode: string;
  setMode: (mode: string) => void;
};

const AdvancedSearchOptions: React.FC<AdvancedSearchOptionsProps> = ({
  category,
  setCategory,
  mode,
  setMode,
}) => {
  return (
    <div className="flex space-x-4">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="flex-1 p-4 bg-white text-black border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
      >
        <option value="">Select a category</option>
        <option value="Technology">Technology</option>
        <option value="Science">Science</option>
        <option value="History">History</option>
        <option value="Arts">Arts</option>
        <option value="Business">Business</option>
      </select>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="flex-1 p-4 bg-white text-black border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
      >
        <option value="normal">Normal Search</option>
        <option value="advanced">Advanced Search</option>
      </select>
    </div>
  );
};

export default AdvancedSearchOptions;
