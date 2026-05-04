# Chapter 17 — SQL Queries

This chapter documents key SQL queries used in the Employee Management System — from basic MySQL operations to extracting data from various tables.

---

## 17.0 Basic MySQL Operations

### 17.0.1 How to Login to MySQL

**From Host Machine (when MySQL runs in Docker):**

```bash
# Login using the command line
mysql -h 127.0.0.1 -P 3306 -u root -proot
```

**From Inside the Docker Container:**

```bash
# Enter the MySQL container first
docker exec -it ems_mysql bash

# Then login to MySQL
mysql -u root -proot
```

**Login with a specific user:**

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
# Enter password when prompted: root
```

---

### 17.0.2 How to Select / Use the Correct Database

```sql
-- Show all available databases
SHOW DATABASES;

-- Select the Employee Management database
USE employee_management;

-- Verify which database is currently selected
SELECT DATABASE();
```

**Output:**

```
+------------------------+
| DATABASE()             |
+------------------------+
| employee_management    |
+------------------------+
```

---

### 17.0.3 How to Check All Tables

```sql
-- List all tables in the current database
SHOW TABLES;

-- Show table with detailed info (engine, rows, size)
SHOW TABLE STATUS;

-- Describe a specific table's structure (columns, types, keys)
DESCRIBE users;

-- Alternative: Show full column details
SHOW FULL COLUMNS FROM users;

-- Show the CREATE statement for a table
SHOW CREATE TABLE users;
```

**Example output of `SHOW TABLES`:**

```
+-------------------------------+
| Tables_in_employee_management |
+-------------------------------+
| announcements                 |
| backups                       |
| cache                         |
| cache_locks                   |
| departments                   |
| failed_jobs                   |
| holidays                      |
| job_batches                   |
| jobs                          |
| leave_group_items             |
| leave_groups                  |
| leave_types                   |
| leaves                        |
| notifications                 |
| password_reset_tokens         |
| personal_access_tokens        |
| presence                      |
| sessions                      |
| settings                      |
| user_leave_balances           |
| users                         |
+-------------------------------+
```

---

### 17.0.4 How to Add a Record (INSERT)

```sql
-- Add a new department
INSERT INTO departments (name, description, created_at, updated_at)
VALUES ('Engineering', 'Software Engineering Team', NOW(), NOW());

-- Add a new user / employee
INSERT INTO users (name, email, password, role, department_id, position, phone, is_active, created_at, updated_at)
VALUES ('John Doe', 'john@company.com', '$2y$12$hashedpassword', 'employee', 1, 'Developer', '9876543210', 1, NOW(), NOW());

-- Add a new announcement
INSERT INTO announcements (title, content, author_id, created_at, updated_at)
VALUES ('Welcome!', 'Welcome to the Employee Management System.', 1, NOW(), NOW());

-- Add a new leave type
INSERT INTO leave_types (name, slug, description, default_balance, is_paid, is_active, created_at, updated_at)
VALUES ('Casual Leave', 'casual', 'General casual leave', 12.0, 1, 1, NOW(), NOW());

-- Add a holiday
INSERT INTO holidays (country_code, country_name, name, date, description, year, is_active, created_at, updated_at)
VALUES ('IN', 'India', 'Republic Day', '2026-01-26', 'National holiday', 2026, 1, NOW(), NOW());
```

---

### 17.0.5 How to Update a Record (UPDATE)

```sql
-- Update an employee's position
UPDATE users
SET position = 'Senior Developer', updated_at = NOW()
WHERE id = 1;

-- Change department name
UPDATE departments
SET name = 'Software Engineering', updated_at = NOW()
WHERE id = 1;

-- Approve a leave request
UPDATE leaves
SET status = 'approved', approved_by = 1, updated_at = NOW()
WHERE id = 5;

-- Deactivate an employee
UPDATE users
SET is_active = 0, updated_at = NOW()
WHERE id = 10;

-- Update a setting value
UPDATE settings
SET value = 'Employee Management System', updated_at = NOW()
WHERE `key` = 'company_name';
```

---

### 17.0.6 How to Delete a Record (DELETE)

```sql
-- Delete a specific department
DELETE FROM departments WHERE id = 5;

-- Delete a user by ID
DELETE FROM users WHERE id = 10;

-- Delete a leave request
DELETE FROM leaves WHERE id = 3;

-- Delete an announcement
DELETE FROM announcements WHERE id = 2;

-- Delete a notification
DELETE FROM notifications WHERE id = 15;

-- Delete all read notifications for a user
DELETE FROM notifications
WHERE user_id = 1 AND read_at IS NOT NULL;
```

> **Warning:** Always use a `WHERE` clause with `DELETE`. Running `DELETE FROM table_name;` without `WHERE` will delete **all rows**.

---

### 17.0.7 How to View / Select Data (SELECT)

```sql
-- View all records from a table
SELECT * FROM departments;

-- View specific columns only
SELECT id, name, email, role FROM users;

-- View with a condition
SELECT * FROM users WHERE role = 'admin';

-- View with sorting
SELECT * FROM users ORDER BY name ASC;

-- View limited rows (pagination)
SELECT * FROM users LIMIT 10 OFFSET 0;   -- Page 1
SELECT * FROM users LIMIT 10 OFFSET 10;  -- Page 2

-- Count total records
SELECT COUNT(*) AS total_users FROM users;

-- Count with condition
SELECT COUNT(*) AS active_employees FROM users WHERE is_active = 1 AND role = 'employee';
```

---

### 17.0.8 How to Filter & Search Data

```sql
-- Filter by exact value
SELECT * FROM users WHERE department_id = 1;

-- Filter with multiple conditions (AND / OR)
SELECT * FROM users WHERE role = 'employee' AND is_active = 1;
SELECT * FROM leaves WHERE status = 'pending' OR status = 'approved';

-- Search with pattern matching (LIKE)
SELECT * FROM users WHERE name LIKE '%shivam%';
SELECT * FROM users WHERE email LIKE '%@company.com';

-- Filter by date range
SELECT * FROM leaves WHERE start_date BETWEEN '2026-01-01' AND '2026-12-31';

-- Filter with IN clause
SELECT * FROM leaves WHERE status IN ('pending', 'approved');

-- Filter NULL values
SELECT * FROM users WHERE department_id IS NULL;
SELECT * FROM notifications WHERE read_at IS NOT NULL;
```

---

### 17.0.9 How to Join Tables

```sql
-- INNER JOIN: Get users with their department name (only users that have a department)
SELECT u.name, u.email, d.name AS department
FROM users u
INNER JOIN departments d ON d.id = u.department_id;

-- LEFT JOIN: Get all users, even those without a department
SELECT u.name, u.email, d.name AS department
FROM users u
LEFT JOIN departments d ON d.id = u.department_id;

-- Multiple JOINs: Get leaves with employee and leave type info
SELECT u.name AS employee, lt.name AS leave_type, l.start_date, l.end_date, l.status
FROM leaves l
JOIN users u ON u.id = l.user_id
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id;
```

---

### 17.0.10 How to Group & Aggregate Data

```sql
-- Count employees per department
SELECT d.name AS department, COUNT(u.id) AS total
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
GROUP BY d.id, d.name;

-- Total leave days per employee
SELECT u.name, SUM(DATEDIFF(l.end_date, l.start_date) + 1) AS total_days
FROM leaves l
JOIN users u ON u.id = l.user_id
WHERE l.status = 'approved'
GROUP BY u.id, u.name
ORDER BY total_days DESC;

-- Average salary per department
SELECT d.name, ROUND(AVG(u.salary), 2) AS avg_salary
FROM users u
JOIN departments d ON d.id = u.department_id
WHERE u.salary IS NOT NULL
GROUP BY d.id, d.name;

-- Filter groups with HAVING
SELECT d.name, COUNT(u.id) AS total
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
GROUP BY d.id, d.name
HAVING total > 5;
```

---

## 17.1 Authentication & Session Queries

### 17.1.1 User Login — Fetch User by Email

```sql
SELECT id, name, email, password, role, is_active
FROM users
WHERE email = 'john.doe@company.com'
  AND is_active = 1
LIMIT 1;
```

### 17.1.2 Create Personal Access Token (Sanctum)

```sql
INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at)
VALUES ('App\\Models\\User', 1, 'auth-token', 'hashed_token_value', '["*"]', NOW(), NOW());
```

### 17.1.3 Validate Token on Subsequent Requests

```sql
SELECT pat.*, u.id AS user_id, u.name, u.email, u.role
FROM personal_access_tokens pat
JOIN users u ON u.id = pat.tokenable_id AND pat.tokenable_type = 'App\\Models\\User'
WHERE pat.token = 'hashed_token_value'
  AND (pat.expires_at IS NULL OR pat.expires_at > NOW());
```

### 17.1.4 Track Active Session

```sql
INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity)
VALUES ('session_id_string', 1, '192.168.1.10', 'Mozilla/5.0...', 'encoded_payload', UNIX_TIMESTAMP());
```

### 17.1.5 Password Reset — Generate Token

```sql
INSERT INTO password_reset_tokens (email, token, created_at)
VALUES ('john.doe@company.com', 'hashed_reset_token', NOW())
ON DUPLICATE KEY UPDATE token = 'hashed_reset_token', created_at = NOW();
```

---

## 17.2 User & Employee Queries

### 17.2.1 Get All Employees with Department Info

```sql
SELECT u.id, u.name, u.email, u.role, u.position, u.phone,
       u.date_of_joining, u.is_active,
       d.name AS department_name
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
WHERE u.role = 'employee'
ORDER BY u.name ASC;
```

### 17.2.2 Get Employee Full Profile

```sql
SELECT u.id, u.name, u.email, u.role, u.position, u.phone, u.bio,
       u.avatar, u.skills, u.address, u.city, u.state, u.zip_code,
       u.education, u.experience, u.team_name,
       u.salary, u.salary_currency, u.date_of_joining, u.date_of_birth,
       u.linkedin_url, u.emergency_contact_name, u.emergency_contact_phone,
       u.country_code, u.is_active,
       d.name AS department_name,
       lg.name AS leave_group_name
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_groups lg ON lg.id = u.leave_group_id
WHERE u.id = 1;
```

### 17.2.3 Search Employees by Name or Email

```sql
SELECT u.id, u.name, u.email, u.position, d.name AS department_name
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
WHERE (u.name LIKE '%search_term%' OR u.email LIKE '%search_term%')
  AND u.is_active = 1
ORDER BY u.name ASC
LIMIT 20;
```

### 17.2.4 Count Employees per Department

```sql
SELECT d.id, d.name AS department_name, COUNT(u.id) AS employee_count
FROM departments d
LEFT JOIN users u ON u.department_id = d.id AND u.is_active = 1
GROUP BY d.id, d.name
ORDER BY employee_count DESC;
```

---

## 17.3 Department Queries

### 17.3.1 List All Departments

```sql
SELECT id, name, description, created_at
FROM departments
ORDER BY name ASC;
```

### 17.3.2 Get Department with Its Employees

```sql
SELECT d.id AS department_id, d.name AS department_name, d.description,
       u.id AS employee_id, u.name AS employee_name, u.email, u.position
FROM departments d
LEFT JOIN users u ON u.department_id = d.id AND u.is_active = 1
WHERE d.id = 1
ORDER BY u.name ASC;
```

---

## 17.4 Leave Management Queries

### 17.4.1 Get All Leaves for an Employee

```sql
SELECT l.id, l.start_date, l.end_date, l.status, l.reason,
       l.effective_hours, l.scheduled_at,
       lt.name AS leave_type_name, lt.slug AS leave_type_slug,
       approver.name AS approved_by_name
FROM leaves l
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
LEFT JOIN users approver ON approver.id = l.approved_by
WHERE l.user_id = 1
ORDER BY l.start_date DESC;
```

### 17.4.2 Get Pending Leave Requests (Admin View)

```sql
SELECT l.id, l.start_date, l.end_date, l.reason, l.effective_hours,
       l.created_at,
       u.name AS employee_name, u.email,
       d.name AS department_name,
       lt.name AS leave_type_name
FROM leaves l
JOIN users u ON u.id = l.user_id
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
WHERE l.status = 'pending'
ORDER BY l.created_at ASC;
```

### 17.4.3 Approve/Reject a Leave Request

```sql
UPDATE leaves
SET status = 'approved',
    approved_by = 1,
    updated_at = NOW()
WHERE id = 5 AND status = 'pending';
```

### 17.4.4 Get Leave Summary for an Employee (Current Year)

```sql
SELECT lt.name AS leave_type,
       ulb.allocated,
       ulb.used,
       ulb.carried_forward,
       (ulb.allocated + ulb.carried_forward - ulb.used) AS remaining
FROM user_leave_balances ulb
JOIN leave_types lt ON lt.id = ulb.leave_type_id
WHERE ulb.user_id = 1
  AND ulb.year = YEAR(CURDATE())
ORDER BY lt.name ASC;
```

### 17.4.5 Get Employees on Leave Today

```sql
SELECT u.id, u.name, u.email, u.position,
       d.name AS department_name,
       lt.name AS leave_type, l.status
FROM leaves l
JOIN users u ON u.id = l.user_id
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
WHERE l.status = 'approved'
  AND CURDATE() BETWEEN l.start_date AND l.end_date
ORDER BY u.name ASC;
```

---

## 17.5 Leave Configuration Queries

### 17.5.1 List All Leave Types

```sql
SELECT id, name, slug, description, default_balance, is_paid, is_active
FROM leave_types
WHERE is_active = 1
ORDER BY name ASC;
```

### 17.5.2 Get Leave Group with Allocations

```sql
SELECT lg.id, lg.name AS group_name, lg.description, lg.is_default,
       lt.name AS leave_type_name, lt.slug,
       lgi.balance AS allocated_balance
FROM leave_groups lg
JOIN leave_group_items lgi ON lgi.leave_group_id = lg.id
JOIN leave_types lt ON lt.id = lgi.leave_type_id
WHERE lg.id = 1
ORDER BY lt.name ASC;
```

### 17.5.3 Get Holidays for a Country (Current Year)

```sql
SELECT id, name, date, description
FROM holidays
WHERE country_code = 'IN'
  AND year = YEAR(CURDATE())
  AND is_active = 1
ORDER BY date ASC;
```

---

## 17.6 Attendance & Presence Queries

### 17.6.1 Get Current Presence Status for All Users

```sql
SELECT u.id, u.name, u.position,
       d.name AS department_name,
       p.status, p.last_seen
FROM presence p
JOIN users u ON u.id = p.user_id
LEFT JOIN departments d ON d.id = u.department_id
WHERE u.is_active = 1
ORDER BY p.last_seen DESC;
```

### 17.6.2 Get Online Employees Count

```sql
SELECT COUNT(*) AS online_count
FROM presence p
JOIN users u ON u.id = p.user_id
WHERE p.status = 'online'
  AND u.is_active = 1;
```

### 17.6.3 Update User Presence Status

```sql
UPDATE presence
SET status = 'online', last_seen = NOW(), updated_at = NOW()
WHERE user_id = 1;
```

---

## 17.7 Announcement & Notification Queries

### 17.7.1 Get All Announcements (Latest First)

```sql
SELECT a.id, a.title, a.content, a.created_at,
       u.name AS author_name
FROM announcements a
JOIN users u ON u.id = a.author_id
ORDER BY a.created_at DESC
LIMIT 20;
```

### 17.7.2 Get Unread Notifications for a User

```sql
SELECT id, type, title, body, created_at
FROM notifications
WHERE user_id = 1
  AND read_at IS NULL
ORDER BY created_at DESC;
```

### 17.7.3 Mark Notification as Read

```sql
UPDATE notifications
SET read_at = NOW()
WHERE id = 10 AND user_id = 1;
```

### 17.7.4 Get Notification Count (Unread)

```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE user_id = 1
  AND read_at IS NULL;
```

---

## 17.8 Dashboard & Analytics Queries

### 17.8.1 Dashboard Summary — Employee Counts by Role

```sql
SELECT role, COUNT(*) AS total
FROM users
WHERE is_active = 1
GROUP BY role;
```

### 17.8.2 Monthly Leave Statistics

```sql
SELECT MONTH(l.start_date) AS month,
       COUNT(*) AS total_requests,
       SUM(CASE WHEN l.status = 'approved' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN l.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
       SUM(CASE WHEN l.status = 'pending' THEN 1 ELSE 0 END) AS pending
FROM leaves l
WHERE YEAR(l.start_date) = YEAR(CURDATE())
GROUP BY MONTH(l.start_date)
ORDER BY month ASC;
```

### 17.8.3 Department-Wise Leave Usage

```sql
SELECT d.name AS department_name,
       lt.name AS leave_type,
       COUNT(l.id) AS total_leaves,
       SUM(l.effective_hours) AS total_hours_used
FROM leaves l
JOIN users u ON u.id = l.user_id
JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
WHERE l.status = 'approved'
  AND YEAR(l.start_date) = YEAR(CURDATE())
GROUP BY d.name, lt.name
ORDER BY d.name, lt.name;
```

### 17.8.4 Top Employees by Leave Days Taken

```sql
SELECT u.name, u.email, d.name AS department_name,
       SUM(DATEDIFF(l.end_date, l.start_date) + 1) AS total_days
FROM leaves l
JOIN users u ON u.id = l.user_id
LEFT JOIN departments d ON d.id = u.department_id
WHERE l.status = 'approved'
  AND YEAR(l.start_date) = YEAR(CURDATE())
GROUP BY u.id, u.name, u.email, d.name
ORDER BY total_days DESC
LIMIT 10;
```

---

## 17.9 Settings & Backup Queries

### 17.9.1 Get All Global Settings

```sql
SELECT `key`, value, scope
FROM settings
WHERE scope = 'global'
ORDER BY `key` ASC;
```

### 17.9.2 Get a Specific Setting

```sql
SELECT value
FROM settings
WHERE `key` = 'company_name'
LIMIT 1;
```

### 17.9.3 List Database Backups

```sql
SELECT b.id, b.filename, b.size, b.created_at,
       u.name AS created_by_name
FROM backups b
LEFT JOIN users u ON u.id = b.created_by
ORDER BY b.created_at DESC;
```

---

## 17.10 Complex Join Queries

### 17.10.1 Employee Leave Balance with Department and Group Info

```sql
SELECT u.name AS employee_name, u.email,
       d.name AS department_name,
       lg.name AS leave_group,
       lt.name AS leave_type,
       ulb.allocated, ulb.used, ulb.carried_forward,
       (ulb.allocated + ulb.carried_forward - ulb.used) AS balance_remaining
FROM user_leave_balances ulb
JOIN users u ON u.id = ulb.user_id
JOIN leave_types lt ON lt.id = ulb.leave_type_id
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_groups lg ON lg.id = u.leave_group_id
WHERE ulb.year = YEAR(CURDATE())
  AND u.is_active = 1
ORDER BY u.name, lt.name;
```

### 17.10.2 Full Leave History with All Related Data

```sql
SELECT l.id AS leave_id,
       u.name AS employee_name, u.email,
       d.name AS department_name,
       lt.name AS leave_type, lt.is_paid,
       l.start_date, l.end_date, l.effective_hours,
       l.status, l.reason, l.scheduled_at,
       approver.name AS approved_by_name,
       l.created_at AS requested_at
FROM leaves l
JOIN users u ON u.id = l.user_id
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN leave_types lt ON lt.id = l.leave_type_id
LEFT JOIN users approver ON approver.id = l.approved_by
WHERE YEAR(l.start_date) = YEAR(CURDATE())
ORDER BY l.created_at DESC
LIMIT 50;
```

### 17.10.3 Employee Attendance Report (Combining Presence + Leaves)

```sql
SELECT u.id, u.name, u.email, d.name AS department_name,
       p.status AS current_status, p.last_seen,
       (SELECT COUNT(*) FROM leaves l
        WHERE l.user_id = u.id AND l.status = 'approved'
          AND YEAR(l.start_date) = YEAR(CURDATE())) AS approved_leaves_count,
       (SELECT SUM(DATEDIFF(l2.end_date, l2.start_date) + 1) FROM leaves l2
        WHERE l2.user_id = u.id AND l2.status = 'approved'
          AND YEAR(l2.start_date) = YEAR(CURDATE())) AS total_leave_days
FROM users u
LEFT JOIN departments d ON d.id = u.department_id
LEFT JOIN presence p ON p.user_id = u.id
WHERE u.is_active = 1 AND u.role = 'employee'
ORDER BY u.name ASC;
```

---

## 17.11 Data Cleanup & Maintenance Queries

### 17.11.1 Delete Expired Sessions

```sql
DELETE FROM sessions
WHERE last_activity < (UNIX_TIMESTAMP() - 86400);
```

### 17.11.2 Delete Expired Password Reset Tokens

```sql
DELETE FROM password_reset_tokens
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### 17.11.3 Purge Old Notifications (Older Than 90 Days)

```sql
DELETE FROM notifications
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
  AND read_at IS NOT NULL;
```

---

## 17.12 Summary

| Section | Tables Involved | Purpose |
|---------|----------------|---------|
| 17.0 | All tables | Basic MySQL operations (login, select, insert, update, delete, joins, grouping) |
| 17.1 | `users`, `personal_access_tokens`, `sessions`, `password_reset_tokens` | Authentication & login |
| 17.2 | `users`, `departments`, `leave_groups` | Employee CRUD & profile |
| 17.3 | `departments`, `users` | Department management |
| 17.4 | `leaves`, `leave_types`, `users`, `user_leave_balances` | Leave requests & approvals |
| 17.5 | `leave_types`, `leave_groups`, `leave_group_items`, `holidays` | Leave configuration |
| 17.6 | `presence`, `users` | Real-time attendance |
| 17.7 | `announcements`, `notifications`, `users` | Communication |
| 17.8 | `leaves`, `users`, `departments`, `leave_types` | Analytics & reporting |
| 17.9 | `settings`, `backups`, `users` | System configuration |
| 17.10 | Multiple tables (complex joins) | Cross-table reporting |
| 17.11 | `sessions`, `password_reset_tokens`, `notifications` | Maintenance |
