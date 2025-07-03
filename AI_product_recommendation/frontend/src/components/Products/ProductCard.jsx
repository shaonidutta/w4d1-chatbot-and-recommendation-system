/**
 * Product Card Component with Girly Design
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { productsAPI, apiUtils } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// Helper function to optimize image URLs
const getOptimizedImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's a dummyimage.com URL, replace with a larger size
  if (imageUrl.includes('dummyimage.com')) {
    // Extract color information if present
    const colorMatch = imageUrl.match(/\/([a-fA-F0-9]{6})\/([a-fA-F0-9]{6})/);
    const bgColor = colorMatch ? colorMatch[1] : 'ff69b4';
    const textColor = colorMatch ? colorMatch[2] : 'ffffff';

    // Return a 400x400 version for better quality
    return `http://dummyimage.com/400x400.png/${bgColor}/${textColor}`;
  }

  return imageUrl;
};

const ProductCard = ({ product, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could show a login prompt here
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await productsAPI.toggleLike(product.product_id);
      setIsLiked(response.is_liked);
      setLikeCount(response.total_likes);
      
      if (onLikeChange) {
        onLikeChange(product.product_id, response.is_liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleView = async () => {
    if (isAuthenticated) {
      try {
        await productsAPI.trackView(product.product_id, 0);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="product-card group"
    >
      <Link to={`/products/${product.product_id}`} onClick={handleView}>
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="aspect-square bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={getOptimizedImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback when image fails to load */}
            <div className="w-full h-full flex items-center justify-center text-primary-300" style={{ display: product.image_url ? 'none' : 'flex' }}>
              <EyeIcon className="w-16 h-16" />
            </div>
          </div>

          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            disabled={!isAuthenticated || isLiking}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked
                ? 'bg-red-500/20 text-red-500'
                : 'bg-white/80 text-gray-400 hover:text-red-400'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLiked ? (
              <HeartIconSolid className="w-5 h-5 animate-heart-beat" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </motion.button>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <span className="category-pill text-xs">
                {product.category.category_name}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500">
              {product.brand}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-sm text-gray-500">
              ({product.review_count || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold gradient-text-coral">
              {apiUtils.formatPrice(product.price)}
            </span>
            
            {likeCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <HeartIcon className="w-4 h-4" />
                <span>{likeCount}</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stock_quantity !== undefined && (
            <div className="text-sm">
              {product.stock_quantity > 0 ? (
                <span className="text-mint-600">In Stock</span>
              ) : (
                <span className="text-red-500">Out of Stock</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
