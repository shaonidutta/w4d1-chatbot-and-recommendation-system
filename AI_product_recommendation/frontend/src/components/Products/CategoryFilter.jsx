/**
 * Category Filter Component
 */
import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="mb-6">
      <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange('')}
          className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
            selectedCategory === '' 
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' 
              : 'bg-white/80 hover:bg-primary-50 text-gray-700 border border-primary-200'
          }`}
        >
          All Categories
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category.category_id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(category.category_id.toString())}
            className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
              selectedCategory === category.category_id.toString()
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                : 'bg-white/80 hover:bg-primary-50 text-gray-700 border border-primary-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{category.category_name}</span>
              {category.description && (
                <span className="text-xs opacity-75 truncate ml-2">
                  {category.description.length > 20 
                    ? `${category.description.substring(0, 20)}...` 
                    : category.description}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
