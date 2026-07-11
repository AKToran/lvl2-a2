# DevTracker - An API to track issues.  

Live [link](https://devtracker-flax.vercel.app/)  

## Features:   

> - **User registration and login using JWT and `bcryptjs` password hashing.**
> - **API endpoints for managing issues.**
> - **Role based authentication with custom auth middleware.**
> - **Sorting and filtering with query parameters.**
> - **Relational data modeling with PostgreSQL using NeonDB.**

## Tech used:  

* **Runtime:** Node.js 
* **TypeScript**   
* **Framework:** Express.js
* **Database** PostgreSQL

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AKToran/lvl2-a2
   cd lvl2-a2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your configuration details:
   ```env
   PORT=5000
   CONNECTION_STRING=your_database_connection_string
   SECRET_KEY=your_jwt_secret_key
   ```


4. **Running the Application** 
   ```bash
   npm run dev
   ```

The server should now be running at `http://localhost:5000`.

---

## API Endpoints

### Authentication
Manage user registration, authentication, and session generation.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive token | Public |

### Issues Management
Core resource endpoints for tracking, filtering, and updating repository issues.

| Method | Endpoint | Description | Auth Required (Roles) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/issues` | Create a new project issue | Contributor, Maintainer |
| `GET` | `/api/issues` | Retrieve all issues (Supports filtering/sorting) | Public |
| `GET` | `/api/issues/:id` | Fetch details of a single issue by ID | Public |
| `PATCH` | `/api/issues/:id` | Update an existing issue's details | Contributor, Maintainer |
| `DELETE` | `/api/issues/:id` | Permanently delete an issue | Maintainer |

---

### Issue Query Parameters

The `GET /api/issues` endpoint supports the following optional query parameters for sorting and filtering data:

| Parameter | Accepted Values | Default | Description | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| `sort` | `newest`, `oldest` | `newest` | Sorts issues by creation date | `/api/issues?sort=oldest` |
| `type` | `bug`, `feature_request` | *None* | Filters issues by their category type | `/api/issues?type=bug` |
| `status` | `open`, `in_progress`, `resolved` | *None* | Filters issues by lifecycle status | `/api/issues?status=open` |

---

## Database Schema Design

The application utilizes a relational database structure with two core tables. Application logic enforces references between users and issues.

### 1. `users` Table
Stores registered team members, their credentials, and access control roles.

| Field Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto-Increment | Unique identifier for each account. |
| `name` | `VARCHAR` | `NOT NULL` | Full display name of the team member. |
| `email` | `VARCHAR` | `NOT NULL`, `UNIQUE` | Valid login address used for authentication. |
| `password` | `VARCHAR` | `NOT NULL` | Encrypted string (hashed via `bcryptjs`). *Never returned in responses.* |
| `role` | `ENUM` | `DEFAULT 'contributor'` | System access level. Must be: `'contributor'` or `'maintainer'`. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp marking when the account was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Automatically refreshed when the account is updated. |

### 2. `issues` Table
Tracks project bugs and feature requests submitted by team members.

| Field Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto-Increment | Unique identifier for each reported item. |
| `title` | `VARCHAR(150)`| `NOT NULL` | Short descriptive headline (Max 150 characters). |
| `description` | `TEXT` | `NOT NULL` | Detailed explanation of the item (Min 20 characters). |
| `type` | `ENUM` | `NOT NULL` | Categorizes the entry. Must be: `'bug'` or `'feature_request'`. |
| `status` | `ENUM` | `DEFAULT 'open'` | Current workflow state. Must be: `'open'`, `'in_progress'`, or `'resolved'`. |
| `reporter_id` | `INT` | `NOT NULL` | Logical link to `users.id`. *Validated via application logic.* |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp marking when the issue was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Timestamp marking when the issue is updated. |
