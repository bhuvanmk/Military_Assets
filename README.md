# MILITARY ASSET MANAGEMENT SYSTEM // COMMAND OPS

A full-stack, enterprise logistics and inventory control platform engineered for multi-base asset tracking, movements, personnel assignments, and automated balance reconciliation.

---

## 1. SCOPE & GENERAL NOTICE
> **SCOPE NOTE**: This is a generic logistics and inventory management application utilizing synthetic demonstration data only. It contains no real military operational information, tactics, targeting, or sensitive details. The military command styling serves as a visual and organizational theme for generic equipment categories (Vehicles, Safety & Medical, Communications, Protective Equipment).

---

## 2. TECHNOLOGY STACK

### Backend
- **Java 17+ / 21+**
- **Spring Boot 3.3.4** (Spring Web, Spring Data JPA, Hibernate ORM, Spring Security, Bean Validation)
- **JWT (jjwt 0.12.6)** for stateless, cryptographically secure authentication
- **MySQL 8.0+** with relational schema, foreign key constraints, checks, and composite indexes
- **Maven** for build, lifecycle, and dependency management
- **JUnit 5 & Spring Boot Test** for automated formula & authorization verification

### Frontend
- **React.js 18 & Vite**
- **Tailwind CSS 3.4** configured with command-center theme tokens
- **React Router 6** with role-guarded and protected routing
- **Axios** with automatic Bearer JWT injection & 401 interceptors
- **Recharts** for tactical inventory distribution charts
- **Lucide React** for tactical iconography
- **Vitest & React Testing Library** for frontend test automation

---

## 3. SEPARATE AUTHENTICATION PORTALS

The application strictly separates user and administrator authentication workflows:

1. **User Portal (`/login`)**:
   - For `BASE_COMMANDER` and `LOGISTICS_OFFICER` roles.
   - Submits to `POST /api/auth/login`.
   - Rejects `ADMIN` accounts with `403 "Please use the Admin Portal."`.
   - Redirects to `/dashboard` upon successful login.
2. **Admin Portal (`/admin/login`)**:
   - Reachable only by direct URL (`http://localhost:5173/admin/login`).
   - For `ADMIN` accounts only.
   - Submits to `POST /api/auth/admin/login`.
   - Rejects non-admin users with `403 "Admin access required."` regardless of request payload claims.
   - Redirects to `/admin/dashboard` upon successful login.

---

## 4. DEVELOPMENT CREDENTIALS (DEV-ONLY)

> [!CAUTION]
> The following credentials are seeded for development and testing environments only (`app.seed.enabled=true`). All passwords are stored exclusively as one-way BCrypt hashes and are never returned in API payloads or JWT claims.

| Role | Email Identifier | Password | Base Assignment |
|---|---|---|---|
| **ADMIN** | `admin@gmail.com` | `Admin@123` | `NULL` (HQ / Global Unrestricted) |
| **BASE_COMMANDER** | `commander1@example.com` | `Commander@123` | Alpha Base |
| **LOGISTICS_OFFICER** | `logistics@example.com` | `Logistics@123` | Alpha Base |

---

## 5. INVENTORY FORMULA (SINGLE SOURCE OF TRUTH)

Inventory balances are **never** manually edited by users. They are strictly computed through transaction aggregation:

$$\text{Net Movement} = \text{Purchases} + \text{Transfer In} - \text{Transfer Out}$$

$$\text{Closing Balance} = \text{Opening Balance} + \text{Purchases} + \text{Transfer In} - \text{Transfer Out} - \text{Assigned} - \text{Expended}$$

### Worked Example Verification
| Metric | Transport Vehicle (Alpha Base) |
|---|---|
| **Opening Balance** | 100 |
| **Purchases (+)** | +20 |
| **Transfer In (+)** | +10 (from Charlie Base, COMPLETED) |
| **Transfer Out (-)** | -15 (to Bravo Base, COMPLETED) |
| **Pending Transfer** | (5 in transit - *Quarantined, not counted*) |
| **Assigned (-)** | -10 (Squad Leader Jenkins) |
| **Expended (-)** | -5 (Decommissioned) |
| **Net Movement** | $20 + 10 - 15 = \mathbf{15}$ |
| **Closing Balance** | $100 + 20 + 10 - 15 - 10 - 5 = \mathbf{100}$ |

---

## 6. ROLE-BASED ACCESS CONTROL (RBAC) & BASE ISOLATION

| Role | Scope & Permissions | Base Boundary Enforcement |
|---|---|---|
| **ADMIN** | Full system visibility. Manages users, bases, equipment types, purchases, transfers, assignments, write-offs, and audit trails. | Unrestricted across all bases. |
| **BASE_COMMANDER** | Assigned to exactly 1 base. Can view inventory, dashboard, assignments, write-offs, and transfers involving their base. | **Strictly blocked** at backend service level from modifying/viewing other bases (returns `403 Forbidden`). |
| **LOGISTICS_OFFICER** | Manages acquisitions, transfers, and inventory queries for their assigned base. | Cannot modify users, bases, equipment types, or system settings. |

---

## 7. LOCAL SETUP & COMMANDS TO RUN

### Prerequisites
- **MySQL 8.0+** running locally on port `3306` (`brew services start mysql`)
- **Java 17+** (`java -version`)
- **Maven 3.8+** (`mvn -version`)
- **Node.js 18+** & **npm** (`node -v`)

---

### Step 1: Database Setup
Create database `Military_Assets_DB` in MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Military_Assets_DB;"
```

---

### Step 2: Backend Startup
```bash
cd backend
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run
```
*The backend REST API will start on `http://localhost:8080`.*

---

### Step 3: Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
*The React + Vite application will start on `http://localhost:5173`.*

---

## 8. REST API DOCUMENTATION

### Authentication
- `POST /api/auth/login` - User login (`BASE_COMMANDER`, `LOGISTICS_OFFICER`)
- `POST /api/auth/admin/login` - Admin portal login (`ADMIN`)
- `GET /api/auth/me` - Current authenticated user session
- `POST /api/auth/logout` - Terminates session & creates audit log

### Shared Operations (Role & Base Scoped)
- `GET /api/dashboard` - 8-panel metrics & charts
- `GET /api/inventory` - Paginated, searchable ledger
- `GET|POST /api/purchases` - Record procurement
- `GET|POST /api/transfers` - Inter-base transfers manifest & dispatch
- `PUT /api/transfers/{id}` - Update status (`PENDING` $\rightarrow$ `COMPLETED` / `CANCELLED`)
- `GET|POST /api/assignments` - View & issue assignments
- `GET|POST /api/expenditures` - View & record asset expenditure

### Command & Control (`/api/admin/**`, Admin Only)
- `GET|POST /api/admin/users`, `PUT /api/admin/users/{id}`, `PATCH /api/admin/users/{id}/status`, `POST /api/admin/users/{id}/reset-password`
- `GET|POST /api/admin/bases`, `PUT /api/admin/bases/{id}`
- `GET|POST /api/admin/equipment-types`, `PUT /api/admin/equipment-types/{id}`
- `GET /api/admin/audit-logs` - Read-only immutable security trail

---

## 9. RUNNING AUTOMATED TESTS

### Backend Tests (JUnit 5 + Spring Boot Test)
```bash
cd backend
mvn test
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
