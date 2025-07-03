-- AI Product Recommendation System Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS ai_recommendation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_recommendation_db;

-- Users table
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Categories table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    parent_category_id INT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);

-- Products table
CREATE TABLE products (
    product_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    category_id INT,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_active (is_active),
    FULLTEXT(name, description)
);

-- User interactions
CREATE TABLE user_views (
    view_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    product_id CHAR(36),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_user_product (user_id, product_id),
    INDEX idx_viewed_at (viewed_at)
);

CREATE TABLE user_likes (
    like_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    product_id CHAR(36),
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user_active (user_id, is_active)
);

CREATE TABLE user_purchases (
    purchase_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    product_id CHAR(36),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_user_purchase (user_id),
    INDEX idx_purchased_at (purchased_at)
);

-- Product similarities for content-based filtering
CREATE TABLE product_similarities (
    similarity_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id_1 CHAR(36),
    product_id_2 CHAR(36),
    similarity_score DECIMAL(5,4) NOT NULL,
    algorithm_type VARCHAR(50) DEFAULT 'content_based',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id_1) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id_2) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_pair (product_id_1, product_id_2),
    INDEX idx_product1 (product_id_1),
    INDEX idx_similarity_score (similarity_score),
    CHECK (product_id_1 != product_id_2)
);

-- User recommendations cache
CREATE TABLE user_recommendations (
    recommendation_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    product_id CHAR(36),
    recommendation_score DECIMAL(5,4) NOT NULL,
    algorithm_used VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_clicked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_user_expires (user_id, expires_at),
    INDEX idx_recommendation_score (recommendation_score)
);
