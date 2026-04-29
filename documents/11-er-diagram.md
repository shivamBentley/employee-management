# Chapter 11 — Entity Relationship Diagram

## 11.1 Database Tables Overview

| Table                    | Description                              | Key Relations                  |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| `users`                  | Employee/admin accounts                  | Has many leaves, notifications |
| `departments`            | Organizational departments               | Has many users                 |
| `leaves`                 | Leave requests                           | Belongs to user, leave type    |
| `leave_types`            | Leave categories (casual, sick, etc.)    | Has many leave group items     |
| `leave_groups`           | Leave balance policies                   | Has many items, has many users |
| `leave_group_items`      | Per-type balance within a group          | Belongs to group and type      |
| `user_leave_balances`    | Per-employee per-type leave balances     | Belongs to user and leave type |
| `holidays`               | Country-specific public holidays         | Standalone, filtered by country|
| `announcements`          | Organization-wide announcements          | Belongs to author (user)       |
| `presence`               | Real-time status tracking                | Belongs to user (1:1)          |
| `notifications`          | In-app notification records              | Belongs to user                |
| `settings`               | Key-value configuration (feature flags)  | Standalone                     |
| `backups`                | Database backup file records             | Created by user                |
| `personal_access_tokens` | Sanctum API tokens                       | Belongs to user (polymorphic)  |
| `sessions`               | Active browser sessions                  | Belongs to user                |
| `password_reset_tokens`  | Password reset tokens                    | Linked by email                |
| `jobs` / `failed_jobs`   | Queue job tables                         | System tables                  |
| `cache` / `cache_locks`  | Cache driver tables                      | System tables                  |

## 11.2 ER Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
        string role "admin | employee"
        bigint department_id FK
        string position
        string phone
        text bio
        string avatar
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    DEPARTMENTS {
        bigint id PK
        string name UK
        text description
        timestamp created_at
        timestamp updated_at
    }

    LEAVES {
        bigint id PK
        bigint user_id FK
        bigint leave_type_id FK
        date start_date
        date end_date
        enum status "pending | approved | rejected"
        text reason
        bigint approved_by FK
        decimal effective_hours
        timestamp scheduled_at
        timestamp created_at
        timestamp updated_at
    }

    LEAVE_TYPES {
        bigint id PK
        string name
        text description
        integer default_balance
        boolean is_paid
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    LEAVE_GROUPS {
        bigint id PK
        string name
        text description
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    LEAVE_GROUP_ITEMS {
        bigint id PK
        bigint leave_group_id FK
        bigint leave_type_id FK
        integer balance
    }

    USER_LEAVE_BALANCES {
        bigint id PK
        bigint user_id FK
        bigint leave_type_id FK
        integer year
        decimal total
        decimal used
        decimal remaining
        timestamp created_at
        timestamp updated_at
    }

    HOLIDAYS {
        bigint id PK
        string country_code
        string country_name
        string name
        date date
        text description
        timestamp created_at
        timestamp updated_at
    }

    ANNOUNCEMENTS {
        bigint id PK
        string title
        longtext content
        bigint author_id FK
        timestamp created_at
        timestamp updated_at
    }

    PRESENCE {
        bigint id PK
        bigint user_id FK
        enum status "online | offline | away | out_of_office"
        timestamp last_seen
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        string type
        string title
        text body
        timestamp read_at
        timestamp created_at
        timestamp updated_at
    }

    SETTINGS {
        bigint id PK
        string key UK
        text value
        enum scope "global | admin | employee"
        timestamp created_at
        timestamp updated_at
    }

    BACKUPS {
        bigint id PK
        string filename
        bigint size
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    PERSONAL_ACCESS_TOKENS {
        bigint id PK
        string tokenable_type
        bigint tokenable_id
        string name
        string token UK
        text abilities
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    DEPARTMENTS ||--o{ USERS : "has many"
    USERS ||--o{ LEAVES : "applies"
    USERS ||--o{ LEAVES : "approves (approved_by)"
    LEAVE_TYPES ||--o{ LEAVES : "categorizes"
    LEAVE_TYPES ||--o{ LEAVE_GROUP_ITEMS : "included in"
    LEAVE_GROUPS ||--o{ LEAVE_GROUP_ITEMS : "contains"
    LEAVE_GROUPS ||--o{ USERS : "assigned to"
    USERS ||--o{ USER_LEAVE_BALANCES : "has balances"
    LEAVE_TYPES ||--o{ USER_LEAVE_BALANCES : "balance for"
    USERS ||--o{ ANNOUNCEMENTS : "authors"
    USERS ||--|| PRESENCE : "has one"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ BACKUPS : "creates"
    USERS ||--o{ PERSONAL_ACCESS_TOKENS : "has many"
```

## 11.3 Table Relationships Summary

```mermaid
graph TB
    DEPT[departments] -->|1:N| USERS[users]
    USERS -->|1:N| LEAVES[leaves]
    USERS -->|1:N approved_by| LEAVES
    USERS -->|1:N author_id| ANN[announcements]
    USERS -->|1:1| PRES[presence]
    USERS -->|1:N| NOTIF[notifications]
    USERS -->|1:N created_by| BKP[backups]
    USERS -->|1:N polymorphic| TOKENS[personal_access_tokens]
    LTYPE[leave_types] -->|1:N| LEAVES
    LTYPE -->|1:N| LGITEMS[leave_group_items]
    LGRP[leave_groups] -->|1:N| LGITEMS
    LGRP -->|1:N| USERS
    USERS -->|1:N| ULBAL[user_leave_balances]
    LTYPE -->|1:N| ULBAL

    style USERS fill:#438DD5,color:#fff
    style DEPT fill:#51CF66,color:#fff
    style LEAVES fill:#FF6B6B,color:#fff
    style ANN fill:#FFD43B,color:#000
    style PRES fill:#845EF7,color:#fff
    style NOTIF fill:#FF922B,color:#fff
    style LTYPE fill:#20C997,color:#fff
    style LGRP fill:#339AF0,color:#fff
    style ULBAL fill:#F06595,color:#fff
```

## 11.4 Column Details

### Users Table — Extended Fields

| Column          | Type         | Nullable | Default    | Description                     |
| --------------- | ------------ | -------- | ---------- | ------------------------------- |
| `id`            | BIGINT       | No       | Auto       | Primary key                     |
| `name`          | VARCHAR(255) | No       | —          | Full name                       |
| `email`         | VARCHAR(255) | No       | —          | Unique email                    |
| `password`      | VARCHAR(255) | No       | —          | Bcrypt hashed                   |
| `role`          | VARCHAR(255) | No       | 'employee' | `admin` or `employee`           |
| `department_id` | BIGINT       | Yes      | NULL       | FK → departments.id             |
| `position`      | VARCHAR(255) | Yes      | NULL       | Job title                       |
| `phone`         | VARCHAR(255) | Yes      | NULL       | Contact number                  |
| `bio`           | TEXT         | Yes      | NULL       | Short biography                 |
| `avatar`        | VARCHAR(255) | Yes      | NULL       | Path to avatar image            |
| `is_active`     | BOOLEAN      | No       | true       | Soft active/inactive flag       |

### Leaves Table

| Column          | Type     | Nullable | Default   | Description                         |
| --------------- | -------- | -------- | --------- | ----------------------------------- |
| `id`            | BIGINT   | No       | Auto      | Primary key                         |
| `user_id`       | BIGINT   | No       | —         | FK → users.id (cascade delete)      |
| `leave_type_id` | BIGINT   | Yes      | NULL      | FK → leave_types.id                 |
| `start_date`    | DATE     | No       | —         | Leave start                         |
| `end_date`      | DATE     | No       | —         | Leave end                           |
| `status`        | VARCHAR  | No       | 'pending' | pending, approved, rejected         |
| `reason`        | TEXT     | Yes      | NULL      | Reason for leave                    |
| `approved_by`   | BIGINT   | Yes      | NULL      | FK → users.id (null on delete)      |
| `effective_hours`| DECIMAL | Yes      | NULL      | Calculated effective working hours   |
| `scheduled_at`  | TIMESTAMP| Yes      | NULL      | Scheduled processing time           |

### Leave Types Table

| Column            | Type         | Nullable | Default | Description                     |
| ----------------- | ------------ | -------- | ------- | ------------------------------- |
| `id`              | BIGINT       | No       | Auto    | Primary key                     |
| `name`            | VARCHAR(255) | No       | —       | Type name (e.g., Casual Leave)  |
| `description`     | TEXT         | Yes      | NULL    | Description of the leave type   |
| `default_balance` | INTEGER      | No       | 0       | Default annual balance (days)   |
| `is_paid`         | BOOLEAN      | No       | true    | Paid or unpaid leave            |
| `is_active`       | BOOLEAN      | No       | true    | Soft active/inactive flag       |

### Leave Groups Table

| Column       | Type         | Nullable | Default | Description                       |
| ------------ | ------------ | -------- | ------- | --------------------------------- |
| `id`         | BIGINT       | No       | Auto    | Primary key                       |
| `name`       | VARCHAR(255) | No       | —       | Group name (e.g., Standard, Senior)|
| `description`| TEXT         | Yes      | NULL    | Description of the group          |
| `is_default` | BOOLEAN      | No       | false   | Whether this is the default group |

### Holidays Table

| Column         | Type         | Nullable | Default | Description                      |
| -------------- | ------------ | -------- | ------- | -------------------------------- |
| `id`           | BIGINT       | No       | Auto    | Primary key                      |
| `country_code` | VARCHAR(2)   | No       | —       | ISO country code (IN, US, etc.)  |
| `country_name` | VARCHAR(255) | No       | —       | Country display name             |
| `name`         | VARCHAR(255) | No       | —       | Holiday name                     |
| `date`         | DATE         | No       | —       | Holiday date                     |
| `description`  | TEXT         | Yes      | NULL    | Optional description             |

### User Leave Balances Table

| Column          | Type     | Nullable | Default | Description                         |
| --------------- | -------- | -------- | ------- | ----------------------------------- |
| `id`            | BIGINT   | No       | Auto    | Primary key                         |
| `user_id`       | BIGINT   | No       | —       | FK → users.id                       |
| `leave_type_id` | BIGINT   | No       | —       | FK → leave_types.id                 |
| `year`          | INTEGER  | No       | —       | Balance year                        |
| `total`         | DECIMAL  | No       | 0       | Total allocated balance             |
| `used`          | DECIMAL  | No       | 0       | Used balance                        |
| `remaining`     | DECIMAL  | No       | 0       | Remaining balance                   |
