-- ==========================================================
-- MILITARY ASSET MANAGEMENT SYSTEM - SEED DATA (DEVELOPMENT ONLY)
-- Safe, idempotent seed script
-- Development Credentials:
--   ADMIN: admin@gmail.com / Admin@123
--   BASE_COMMANDER: commander1@example.com / Commander@123 (Alpha Base)
--   LOGISTICS_OFFICER: logistics@example.com / Logistics@123 (Alpha Base)
-- ==========================================================

USE Military_Assets_DB;

-- 1. Insert Bases
INSERT INTO bases (id, name, location, description, active)
VALUES 
(1, 'Alpha Base', 'Sector 4 - Northern Command', 'Primary logistical hub and operational command center', TRUE),
(2, 'Bravo Base', 'Sector 9 - Eastern Outpost', 'Tactical support and regional supply depot', TRUE),
(3, 'Charlie Base', 'Sector 2 - Southern Perimeter', 'Maritime surveillance and communication relay station', TRUE)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), location = VALUES(location), description = VALUES(description);

-- 2. Insert Equipment Types
INSERT INTO equipment_types (id, name, category, unit, description, active)
VALUES
(1, 'Transport Vehicle', 'Vehicles', 'Units', 'Heavy duty tactical personnel and cargo transport vehicle', TRUE),
(2, 'Utility Vehicle', 'Vehicles', 'Units', 'Multi-terrain light reconnaissance and utility carrier', TRUE),
(3, 'Safety Equipment', 'Safety & Medical', 'Sets', 'Comprehensive tactical safety, hazard and trauma management kits', TRUE),
(4, 'Communications Equipment', 'Communications', 'Units', 'Encrypted VHF/UHF tactical radio transceivers and relay terminals', TRUE),
(5, 'Protective Equipment', 'Protective Gear', 'Sets', 'Modular tactical vests, ballistic helmets and body armor assemblies', TRUE)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), category = VALUES(category), unit = VALUES(unit), description = VALUES(description);

-- 3. Delete any previous old demo accounts to avoid conflicts
DELETE FROM users WHERE email IN ('admin@example.com', 'commander@example.com');

-- 4. Insert Updated Development Accounts
INSERT INTO users (id, name, email, password, role, base_id, active)
VALUES
(1, 'Major General Marcus Vance', 'admin@gmail.com', '$2a$10$ipjr2rxvwm1IhulvzG1jjOPGYpFtHtLjqKYIOzNZucBsWQzyjr6Yy', 'ADMIN', NULL, TRUE),
(2, 'Colonel Sarah Sterling', 'commander1@example.com', '$2a$10$JJsLtLG6/B.8O6/9g6m/4eAlv57ME1ZeV8FH40c8ekmBTpKFjzo8G', 'BASE_COMMANDER', 1, TRUE),
(3, 'Captain David Miller', 'logistics@example.com', '$2a$10$c0NpyldLGpuLipKHwZbsq.w0hJ6MlVM4vhKsBUMtdpAFgV1/j2ryu', 'LOGISTICS_OFFICER', 1, TRUE)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), base_id = VALUES(base_id);

-- 5. Insert Opening Balances
INSERT INTO inventory_opening_balances (id, base_id, equipment_type_id, quantity, effective_date, created_by)
VALUES
(1, 1, 1, 100, '2026-01-01', 1), -- Alpha Base: Transport Vehicle = 100
(2, 1, 2, 80,  '2026-01-01', 1), -- Alpha Base: Utility Vehicle = 80
(3, 1, 3, 250, '2026-01-01', 1), -- Alpha Base: Safety Equip = 250
(4, 1, 4, 150, '2026-01-01', 1), -- Alpha Base: Comms = 150
(5, 1, 5, 300, '2026-01-01', 1), -- Alpha Base: Protective Gear = 300
(6, 2, 1, 50,  '2026-01-01', 1), -- Bravo Base: Transport Vehicle = 50
(7, 2, 2, 40,  '2026-01-01', 1), -- Bravo Base: Utility Vehicle = 40
(8, 2, 4, 75,  '2026-01-01', 1), -- Bravo Base: Comms = 75
(9, 3, 1, 60,  '2026-01-01', 1), -- Charlie Base: Transport Vehicle = 60
(10, 3, 5, 120, '2026-01-01', 1) -- Charlie Base: Protective Gear = 120
ON DUPLICATE KEY UPDATE 
quantity = VALUES(quantity), effective_date = VALUES(effective_date);

-- 6. Insert Purchases
INSERT INTO purchases (id, base_id, equipment_type_id, quantity, purchase_date, reference_number, supplier, remarks, created_by)
VALUES
(1, 1, 1, 20, '2026-02-10', 'PO-2026-001', 'Oshkosh Defense Logistics', 'Standard fleet replenishment order', 3),
(2, 1, 3, 50, '2026-02-12', 'PO-2026-002', 'MedShield Tactical Systems', 'Annual trauma kit restock', 3),
(3, 2, 2, 15, '2026-02-15', 'PO-2026-003', 'Polaris Military Vehicles', 'Outpost patrol vehicles acquisition', 1),
(4, 3, 4, 25, '2026-02-18', 'PO-2026-004', 'Harris RF Communications', 'Long-range field radio upgrade batch', 1)
ON DUPLICATE KEY UPDATE 
quantity = VALUES(quantity), supplier = VALUES(supplier);

-- 7. Insert Transfers
INSERT INTO transfers (id, from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, reference_number, remarks, created_by)
VALUES
(1, 3, 1, 1, 10, '2026-02-20', 'COMPLETED', 'TR-2026-001', 'Strategic redeployment from Charlie to Alpha', 1),
(2, 1, 2, 1, 15, '2026-02-22', 'COMPLETED', 'TR-2026-002', 'Supply redistribution to eastern sector', 3),
(3, 1, 2, 1, 5,  '2026-02-25', 'PENDING',   'TR-2026-003', 'Pending authorization convoy shipment', 3),
(4, 2, 3, 4, 10, '2026-02-26', 'COMPLETED', 'TR-2026-004', 'Radio relay spares to southern base', 1)
ON DUPLICATE KEY UPDATE 
status = VALUES(status), quantity = VALUES(quantity);

-- 8. Insert Assignments
INSERT INTO assignments (id, base_id, equipment_type_id, personnel_name, quantity, assignment_date, remarks, created_by)
VALUES
(1, 1, 1, 'Squad Leader Jenkins (Alpha Recon 1)', 10, '2026-03-01', 'Assigned for perimeter border monitoring mission', 2),
(2, 1, 4, 'Tech Sergeant Kowalski (Comms Ops)', 15, '2026-03-02', 'Field comms deployment for training exercises', 2),
(3, 2, 2, 'Lieutenant Rossi (Patrol Delta)', 8, '2026-03-03', 'Routine sector reconnaissance duty', 1)
ON DUPLICATE KEY UPDATE 
quantity = VALUES(quantity), personnel_name = VALUES(personnel_name);

-- 9. Insert Expenditures
INSERT INTO expenditures (id, base_id, equipment_type_id, quantity, expenditure_date, reason, remarks, created_by)
VALUES
(1, 1, 1, 5, '2026-03-05', 'Decommissioned / End of Life', 'Severe wear & tear beyond field depot repair', 2),
(2, 1, 3, 20, '2026-03-06', 'Expired Medical Supplies', 'Routine sterilization expiration protocol', 3),
(3, 2, 4, 2, '2026-03-07', 'Damaged in Extreme Weather', 'Lightning surge during sandstorm', 1)
ON DUPLICATE KEY UPDATE 
quantity = VALUES(quantity), reason = VALUES(reason);
