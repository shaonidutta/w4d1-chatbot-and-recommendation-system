/**
 * Pagination Component with Girly Design
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, onPageChange, maxVisible = 5 }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full transition-all duration-300 ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-primary-600 hover:bg-primary-100'
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </motion.button>

      {/* First Page */}
      {visiblePages[0] > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-full text-primary-600 hover:bg-primary-100 transition-all duration-300"
          >
            1
          </motion.button>
          {visiblePages[0] > 2 && (
            <span className="text-gray-400">...</span>
          )}
        </>
      )}

      {/* Visible Pages */}
      {visiblePages.map((page) => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-full transition-all duration-300 ${
            page === currentPage
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
              : 'text-primary-600 hover:bg-primary-100'
          }`}
        >
          {page}
        </motion.button>
      ))}

      {/* Last Page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-gray-400">...</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-full text-primary-600 hover:bg-primary-100 transition-all duration-300"
          >
            {totalPages}
          </motion.button>
        </>
      )}

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full transition-all duration-300 ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-primary-600 hover:bg-primary-100'
        }`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default Pagination;
