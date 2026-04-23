# Chapter 11 — Entity Relationship Diagram

## 11.1 Database Tables Overview

| Table                    | Description                              | Key Relations                  |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| `users`                  | Employee/admin accounts                  | Has many leaves, notifications |
| `departments`            | Organizational departments               | Has many users                 |
| `leaves`                 | Leave requests                           | Belongs to user, approved by   |
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
        enum type "casual | sick | annual | wfh"
        date start_date
        date end_date
        enum status "pending | approved | rejected"
        text reason
        bigint approved_by FK
        timestamp scheduled_at
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

    style USERS fill:#438DD5,color:#fff
    style DEPT fill:#51CF66,color:#fff
    style LEAVES fill:#FF6B6B,color:#fff
    style ANN fill:#FFD43B,color:#000
    style PRES fill:#845EF7,color:#fff
    style NOTIF fill:#FF922B,color:#fff
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

| Column         | Type     | Nullable | Default   | Description                         |
| -------------- | -------- | -------- | --------- | ----------------------------------- |
| `id`           | BIGINT   | No       | Auto      | Primary key                         |
| `user_id`      | BIGINT   | No       | —         | FK → users.id (cascade delete)      |
| `type`         | ENUM     | No       | —         | casual, sick, annual, wfh           |
| `start_date`   | DATE     | No       | —         | Leave start                         |
| `end_date`     | DATE     | No       | —         | Leave end                           |
| `status`       | ENUM     | No       | 'pending' | pending, approved, rejected         |
| `reason`       | TEXT     | Yes      | NULL      | Reason for leave                    |
| `approved_by`  | BIGINT   | Yes      | NULL      | FK → users.id (null on delete)      |
| `scheduled_at` | TIMESTAMP| Yes      | NULL      | Scheduled processing time           |
