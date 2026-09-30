-- ==========================================================
-- MILITARY ASSET MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Database Name: Military_Assets_DB
-- ==========================================================

CREATE DATABASE IF NOT EXISTS Military_Assets_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Military_Assets_DB;

-- 1. Bases Table
CREATE TABLE IF NOT EXISTS bases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Equipment Types Table
CREATE TABLE IF NOT EXISTS equipment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'Units',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    base_id BIGINT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_base FOREIGN KEY (base_id) REFERENCES bases (id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_base (base_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Inventory Opening Balances Table
CREATE TABLE IF NOT EXISTS inventory_opening_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    effective_date DATE NOT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_iob_base FOREIGN KEY (base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_iob_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_iob_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_base_equipment UNIQUE (base_id, equipment_type_id),
    CONSTRAINT chk_iob_quantity CHECK (quantity >= 0),
    INDEX idx_iob_base_eq (base_id, equipment_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    supplier VARCHAR(150) NOT NULL,
    remarks TEXT,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_base FOREIGN KEY (base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_purchases_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_purchases_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_purchases_quantity CHECK (quantity > 0),
    INDEX idx_purchases_lookup (base_id, equipment_type_id, purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_base_id BIGINT NOT NULL,
    to_base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    remarks TEXT,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transfers_from_base FOREIGN KEY (from_base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_to_base FOREIGN KEY (to_base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transfers_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_transfers_quantity CHECK (quantity > 0),
    CONSTRAINT chk_transfers_diff_base CHECK (from_base_id <> to_base_id),
    INDEX idx_transfers_lookup (from_base_id, to_base_id, equipment_type_id, transfer_date),
    INDEX idx_transfers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    personnel_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    assignment_date DATE NOT NULL,
    remarks TEXT,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_base FOREIGN KEY (base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignments_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignments_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_assignments_quantity CHECK (quantity > 0),
    INDEX idx_assignments_base (base_id),
    INDEX idx_assignments_date (assignment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Expenditures Table
CREATE TABLE IF NOT EXISTS expenditures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    expenditure_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    remarks TEXT,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenditures_base FOREIGN KEY (base_id) REFERENCES bases (id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenditures_equipment FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenditures_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_expenditures_quantity CHECK (quantity > 0),
    INDEX idx_expenditures_base (base_id),
    INDEX idx_expenditures_date (expenditure_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    description TEXT,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_action (action),
    INDEX idx_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
