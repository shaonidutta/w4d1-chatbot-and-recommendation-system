/**
 * Home Page with Hero Section and Featured Products
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { productsAPI, recommendationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/UI/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadHomeData();
  }, [isAuthenticated]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured products (first 8 products)
      const featuredResponse = await productsAPI.getProducts({ page: 1, per_page: 8 });
      setFeaturedProducts(featuredResponse.products);

      // Load trending products
      const trendingResponse = await productsAPI.getTrendingProducts({ limit: 6 });
      setTrendingProducts(trendingResponse);

      // Load personalized recommendations if authenticated
      if (isAuthenticated) {
        try {
          const personalizedResponse = await recommendationsAPI.getPersonalizedRecommendations(6);
          setPersonalizedProducts(personalizedResponse);
        } catch (error) {
          console.log('No personalized recommendations yet');
        }
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-6">
              Discover Your
              <br />
              Perfect Products ✨
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered recommendations just for you. Find products you'll love with our smart recommendation system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Explore Products
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn-secondary">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Join Our Community
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 text-primary-200"
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <HeartIcon className="w-12 h-12" />
          </motion.div>
          <motion.div
            className="absolute top-32 right-16 text-accent-200"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <SparklesIcon className="w-8 h-8" />
          </motion.div>
          <motion.div
            className="absolute bottom-20 left-20 text-coral-200"
            animate={{ y: [0, -25, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <SparklesIcon className="w-10 h-10" />
          </motion.div>
        </div>
      </section>

      {/* Personalized Recommendations - Only for authenticated users */}
      {isAuthenticated && personalizedProducts.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text">
                Just For You 💖
              </h2>
              <Link
                to="/recommendations"
                className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text">
              Trending Now 🔥
            </h2>
            <Link
              to="/products?sort=trending"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text">
              Featured Products ⭐
            </h2>
            <Link
              to="/products"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold gradient-text mb-4">
                Ready to Find Your Perfect Products?
              </h2>
              <p className="text-gray-600 mb-6">
                Join our community and get personalized recommendations based on your preferences.
              </p>
              <Link to="/register" className="btn-primary">
                <HeartIcon className="w-5 h-5 mr-2" />
                Get Started Today
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
