-- ==========================================================
-- MILITARY ASSET MANAGEMENT SYSTEM - INITIAL DATA SEED
-- Spring Boot Data Initialization (Idempotent)
-- ==========================================================

-- Bases
INSERT INTO bases (id, name, location, description, active, created_at, updated_at)
VALUES 
(1, 'Alpha Base', 'Sector 4 - Northern Command', 'Primary logistical hub and operational command center', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Bravo Base', 'Sector 9 - Eastern Outpost', 'Tactical support and regional supply depot', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Charlie Base', 'Sector 2 - Southern Perimeter', 'Maritime surveillance and communication relay station', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location);

-- Equipment Types
INSERT INTO equipment_types (id, name, category, unit, description, active, created_at, updated_at)
VALUES
(1, 'Transport Vehicle', 'Vehicles', 'Units', 'Heavy duty tactical personnel and cargo transport vehicle', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Utility Vehicle', 'Vehicles', 'Units', 'Multi-terrain light reconnaissance and utility carrier', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Safety Equipment', 'Safety & Medical', 'Sets', 'Comprehensive tactical safety, hazard and trauma management kits', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Communications Equipment', 'Communications', 'Units', 'Encrypted VHF/UHF tactical radio transceivers and relay terminals', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Protective Equipment', 'Protective Gear', 'Sets', 'Modular tactical vests, ballistic helmets and body armor assemblies', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category);

-- Users (BCrypt hashes for Admin@123, Commander@123, Logistics@123)
DELETE FROM users WHERE email IN ('admin@example.com', 'commander@example.com');

INSERT INTO users (id, name, email, password, role, base_id, active, created_at, updated_at)
VALUES
(1, 'Major General Marcus Vance', 'admin@gmail.com', '$2a$10$ipjr2rxvwm1IhulvzG1jjOPGYpFtHtLjqKYIOzNZucBsWQzyjr6Yy', 'ADMIN', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Colonel Sarah Sterling', 'commander1@example.com', '$2a$10$JJsLtLG6/B.8O6/9g6m/4eAlv57ME1ZeV8FH40c8ekmBTpKFjzo8G', 'BASE_COMMANDER', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Captain David Miller', 'logistics@example.com', '$2a$10$c0NpyldLGpuLipKHwZbsq.w0hJ6MlVM4vhKsBUMtdpAFgV1/j2ryu', 'LOGISTICS_OFFICER', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), base_id = VALUES(base_id);
