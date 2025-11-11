-- We already have nemmer user from docker-compose
-- First connect to secondhand_ai database (default database)

-- Create databases
CREATE DATABASE auth_db;
CREATE DATABASE ai_analytics;

-- Connect to auth_db first
\c auth_db nemmer;

-- User Authentication & Authorization tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    avatar_url TEXT,
    birth_date DATE,
    gender VARCHAR(10),
    bio TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Now connect to ai_analytics database
\c ai_analytics nemmer;

-- Create schemas
CREATE SCHEMA user_behavior;
CREATE SCHEMA product_interaction;
CREATE SCHEMA search_analytics;
CREATE SCHEMA recommendation_tracking;
CREATE SCHEMA model_metrics;

-- User behavior tracking tables
CREATE TABLE user_behavior.page_views (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    page_url TEXT,
    time_spent INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_behavior.clicks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    element_id VARCHAR(255),
    element_type VARCHAR(50),
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product interaction tracking
CREATE TABLE product_interaction.views (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    product_id VARCHAR(255),
    view_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_interaction.wishlists (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    product_id VARCHAR(255),
    action VARCHAR(10), -- 'add' or 'remove'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search analytics
CREATE TABLE search_analytics.queries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    search_query TEXT,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE search_analytics.filters (
    id SERIAL PRIMARY KEY,
    search_id INTEGER REFERENCES search_analytics.queries(id),
    filter_name VARCHAR(50),
    filter_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation tracking
CREATE TABLE recommendation_tracking.shown_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    product_id VARCHAR(255),
    recommendation_type VARCHAR(50), -- 'similar', 'trending', 'personalized'
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_tracking.interactions (
    id SERIAL PRIMARY KEY,
    shown_item_id INTEGER REFERENCES recommendation_tracking.shown_items(id),
    interaction_type VARCHAR(50), -- 'click', 'purchase', 'ignore'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model metrics
CREATE TABLE model_metrics.training_runs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    parameters JSONB,
    metrics JSONB,
    status VARCHAR(50)
);

CREATE TABLE model_metrics.prediction_logs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255),
    user_id VARCHAR(255),
    input_data JSONB,
    predictions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE studio_auth TO nemmer;
GRANT ALL PRIVILEGES ON DATABASE studio_product TO nemmer;
GRANT ALL PRIVILEGES ON DATABASE studio_order TO nemmer;
GRANT ALL PRIVILEGES ON DATABASE studio_cart TO nemmer;
GRANT ALL PRIVILEGES ON DATABASE studio_user TO nemmer;