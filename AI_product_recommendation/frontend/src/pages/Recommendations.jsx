/**
 * Recommendations Page - Hybrid Filtering System
 * Combines Content-Based and Collaborative Filtering
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  SparklesIcon, 
  FireIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { recommendationsAPI, productsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/UI/LoadingSpinner';

const Recommendations = () => {
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState({});
  const [recommendationStats, setRecommendationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('personalized');

  const { user } = useAuth();

  useEffect(() => {
    loadAllRecommendations();
  }, []);

  const loadAllRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Load personalized recommendations (hybrid filtering)
      const personalizedData = await recommendationsAPI.getPersonalizedRecommendations(20);
      setPersonalizedRecommendations(personalizedData);

      // Load trending products
      const trendingData = await productsAPI.getTrendingProducts({ limit: 12 });
      setTrendingProducts(trendingData);

      // Load category-based recommendations
      const categories = await productsAPI.getCategories();
      const categoryRecs = {};
      
      // Get recommendations for top 3 categories
      for (let i = 0; i < Math.min(3, categories.length); i++) {
        const category = categories[i];
        try {
          const categoryData = await recommendationsAPI.getCategoryRecommendations(
            category.category_id, 
            6
          );
          if (categoryData.length > 0) {
            categoryRecs[category.category_name] = categoryData;
          }
        } catch (error) {
          console.log(`No recommendations for category: ${category.category_name}`);
        }
      }
      setCategoryRecommendations(categoryRecs);

      // Load recommendation stats
      const statsData = await recommendationsAPI.getRecommendationStats();
      setRecommendationStats(statsData);

    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setIsRefreshing(true);
      
      // Trigger model rebuild
      await recommendationsAPI.rebuildModel();
      
      // Reload recommendations after a short delay
      setTimeout(() => {
        loadAllRecommendations();
        setIsRefreshing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      setIsRefreshing(false);
    }
  };

  const tabs = [
    { id: 'personalized', name: 'For You', icon: HeartIcon, count: personalizedRecommendations.length },
    { id: 'trending', name: 'Trending', icon: FireIcon, count: trendingProducts.length },
    { id: 'categories', name: 'By Category', icon: SparklesIcon, count: Object.keys(categoryRecommendations).length },
    { id: 'stats', name: 'Insights', icon: ChartBarIcon, count: null },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
            Your Personal Recommendations ✨
          </h1>
          <p className="text-gray-600 mb-6">
            Discover products curated just for you using our AI-powered hybrid filtering system
          </p>

          {/* Refresh Button */}
          <button
            onClick={refreshRecommendations}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2 mx-auto"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Recommendations'}</span>
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'bg-white/80 hover:bg-primary-50 text-gray-700 border border-primary-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <div className="min-h-96">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {/* Personalized Recommendations */}
              {activeTab === 'personalized' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Curated Just For You, {user?.first_name || 'Friend'} 💖
                    </h2>
                    <p className="text-gray-600">
                      Based on your likes, views, and preferences using our hybrid filtering algorithm
                    </p>
                  </div>

                  {personalizedRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {personalizedRecommendations.map((product, index) => (
                        <motion.div
                          key={product.product_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No personalized recommendations yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Start liking and viewing products to get personalized recommendations!
                      </p>
                      <button
                        onClick={() => window.location.href = '/products'}
                        className="btn-primary"
                      >
                        Explore Products
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Trending Products */}
              {activeTab === 'trending' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Trending Now 🔥
                    </h2>
                    <p className="text-gray-600">
                      Most popular products based on recent user interactions
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trendingProducts.map((product, index) => (
                      <motion.div
                        key={product.product_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Category Recommendations */}
              {activeTab === 'categories' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-12"
                >
                  {Object.entries(categoryRecommendations).map(([categoryName, products], categoryIndex) => (
                    <div key={categoryName}>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          {categoryName} ✨
                        </h2>
                        <p className="text-gray-600">
                          Top picks in this category
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, index) => (
                          <motion.div
                            key={product.product_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: (categoryIndex * 0.2) + (index * 0.05) }}
                          >
                            <ProductCard product={product} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {Object.keys(categoryRecommendations).length === 0 && (
                    <div className="text-center py-12">
                      <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No category recommendations available
                      </h3>
                      <p className="text-gray-500">
                        Category-based recommendations will appear as you interact with products
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recommendation Stats */}
              {activeTab === 'stats' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Your Recommendation Insights 📊
                    </h2>
                    <p className="text-gray-600">
                      See how our AI learns from your preferences
                    </p>
                  </div>

                  {recommendationStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="glass-card p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                            <HeartIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Your Interactions</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Liked Products:</span>
                            <span className="font-medium">{recommendationStats.user_interactions?.likes || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Viewed Products:</span>
                            <span className="font-medium">{recommendationStats.user_interactions?.views || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Purchases:</span>
                            <span className="font-medium">{recommendationStats.user_interactions?.purchases || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-coral-400 to-primary-400 rounded-full flex items-center justify-center">
                            <ChartBarIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">System Stats</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Products:</span>
                            <span className="font-medium">{recommendationStats.total_products || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Similarity Pairs:</span>
                            <span className="font-medium">{recommendationStats.similarity_pairs || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coverage:</span>
                            <span className="font-medium">{recommendationStats.recommendation_coverage || '0%'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-mint-400 to-accent-400 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Algorithm Info</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>• Content-based filtering using TF-IDF</p>
                          <p>• Cosine similarity for product matching</p>
                          <p>• User interaction weighting</p>
                          <p>• Real-time recommendation updates</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Loading insights...
                      </h3>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
