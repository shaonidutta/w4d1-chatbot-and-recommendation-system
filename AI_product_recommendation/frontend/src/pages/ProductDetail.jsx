/**
 * Product Detail Page with Similar Products Recommendations
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  StarIcon, 
  EyeIcon, 
  ArrowLeftIcon,
  ShareIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { productsAPI, recommendationsAPI, apiUtils } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/UI/LoadingSpinner';

// Helper function to optimize image URLs
const getOptimizedImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's a dummyimage.com URL, replace with a larger size
  if (imageUrl.includes('dummyimage.com')) {
    // Extract color information if present
    const colorMatch = imageUrl.match(/\/([a-fA-F0-9]{6})\/([a-fA-F0-9]{6})/);
    const bgColor = colorMatch ? colorMatch[1] : 'ff69b4';
    const textColor = colorMatch ? colorMatch[2] : 'ffffff';

    // Return a 600x600 version for product detail page
    return `http://dummyimage.com/600x600.png/${bgColor}/${textColor}`;
  }

  return imageUrl;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      loadProductDetail();
    }
  }, [id]);

  useEffect(() => {
    // Track view after 3 seconds
    if (product && isAuthenticated && !viewTracked) {
      const timer = setTimeout(() => {
        trackProductView();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [product, isAuthenticated, viewTracked]);

  const loadProductDetail = async () => {
    try {
      setIsLoading(true);
      
      // Load product details
      const productData = await productsAPI.getProduct(id);
      setProduct(productData);
      
      // Load similar products (content-based recommendations)
      const similarData = await recommendationsAPI.getSimilarProducts(id, 8);
      setSimilarProducts(similarData);
      
    } catch (error) {
      console.error('Error loading product detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackProductView = async () => {
    if (!isAuthenticated || viewTracked) return;
    
    try {
      await productsAPI.trackView(id, 30); // 30 seconds view duration
      setViewTracked(true);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;

    try {
      setIsLiking(true);
      const response = await productsAPI.toggleLike(id);
      setIsLiked(response.is_liked);
      setLikeCount(response.total_likes);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Products</span>
          </Link>
        </motion.div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={getOptimizedImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback */}
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <EyeIcon className="w-24 h-24" />
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category */}
            {product.category && (
              <div>
                <span className="category-pill">
                  {product.category.category_name}
                </span>
              </div>
            )}

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800">
              {product.name}
            </h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-lg text-gray-600">
                by <span className="font-medium">{product.brand}</span>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-gray-600">
                {product.rating?.toFixed(1) || '0.0'} ({product.review_count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold gradient-text-coral">
              {apiUtils.formatPrice(product.price)}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.stock_quantity > 0 
                  ? 'bg-mint-100 text-mint-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock_quantity > 0 && (
                <span className="text-gray-500 text-sm">
                  {product.stock_quantity} available
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled={product.stock_quantity === 0}
                className={`btn-primary flex-1 flex items-center justify-center space-x-2 ${
                  product.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLiking}
                className={`btn-secondary flex items-center justify-center space-x-2 ${
                  !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                } ${isLiked ? 'bg-red-100 text-red-600 border-red-200' : ''}`}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{isLiked ? 'Liked' : 'Like'}</span>
                {likeCount > 0 && <span>({likeCount})</span>}
              </button>

              <button className="btn-ghost p-3">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Similar Products - Content-Based Recommendations */}
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="py-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text mb-8">
              Similar Products You Might Like 💖
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct, index) => (
                <motion.div
                  key={similarProduct.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <ProductCard product={similarProduct} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
