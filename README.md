# TaskFlow — Team Task Manager

A full-stack collaborative task management app with role-based access control, built with Node.js, Express, PostgreSQL, and React.

### 4. Testing
You can verify the backend API with the included test scripts:
```bash
cd backend
node test-auth.js  # Basic auth tests
node test-api.js   # Full API flow tests
```

---

## 🚀 Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Projects** — Create, update, archive projects with color labels and priorities
- **Team Management** — Invite members by email, assign Admin or Member roles
- **Task Board** — Kanban board (To Do → In Progress → In Review → Done)
- **Task List View** — Filterable table view with quick edit
- **Task Details** — Full task view with comment threads, tags, due dates
- **Dashboard** — Stats cards, completion ring, overdue/due-soon lists, project progress
- **Role-Based Access** — Admins manage members and project settings; Members create/update tasks
- **Profile** — Update name and change password

---

## 🏗 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 19, Vite, React Router v6           |
| Styling    | Vanilla CSS (custom dark design system)   |
| Backend    | Node.js, Express.js                       |
| ORM        | Sequelize v6                              |
| Database   | PostgreSQL                                |
| Auth       | JWT + bcryptjs                            |
| Deployment | Railway                                   |

---

## 📁 Project Structure

```
Ethara/
├── backend/
│   ├── src/
│   │   ├── config/database.js       # Sequelize + PostgreSQL connection
│   │   ├── models/                  # User, Project, ProjectMember, Task, Comment
│   │   ├── controllers/             # authController, projectController, taskController, dashboardController
│   │   ├── middleware/              # auth.js (JWT), rbac.js (roles), validate.js
│   │   ├── routes/                  # auth.js, projects.js, dashboard.js
│   │   └── index.js                 # Express server entry
│   ├── .env                         # Local environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.jsx  # Global auth state
│   │   ├── lib/api.js               # Axios instance with interceptors
│   │   ├── pages/                   # Dashboard, Projects, ProjectDetail, TaskDetail, Profile
│   │   ├── components/Layout.jsx    # Sidebar shell
│   │   └── App.jsx                  # Router + guards
│   └── package.json
├── railway.json                     # Railway backend deployment
└── package.json                     # Root convenience scripts
```

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone & Install
```bash
git clone <repo-url>
cd Ethara
npm run install:all
```

### 2. Configure Backend
Edit `backend/.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run
```bash
# Terminal 1 — Backend (auto-syncs DB tables)
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

Open: http://localhost:5173

---

## 🌐 Deployment on Railway

### Backend

1. Go to [railway.app](https://railway.app) → **New Project**
2. Add a **PostgreSQL** plugin → copy the `DATABASE_URL`
3. Add a **new service** from GitHub repo → set **Root Directory** to `backend`
4. Set environment variables:
   ```
   DATABASE_URL=<from Railway PostgreSQL>
   JWT_SECRET=<strong random string>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=<your frontend Railway URL>
   PORT=5000
   ```
5. Railway auto-detects `npm start` → runs `node src/index.js`

### Frontend

1. Add another **new service** from same repo → set **Root Directory** to `frontend`
2. Set environment variable:
   ```
   VITE_API_URL=https://<your-backend-railway-url>/api
   ```
3. Build command: `npm run build`
4. Start command: `npm start` (serves the `dist/` folder)

---

## 🔑 REST API Reference

### Auth
| Method | Endpoint               | Access  | Description         |
|--------|------------------------|---------|---------------------|
| POST   | `/api/auth/register`   | Public  | Create account      |
| POST   | `/api/auth/login`      | Public  | Login               |
| GET    | `/api/auth/me`         | Private | Get current user    |
| PUT    | `/api/auth/profile`    | Private | Update name/avatar  |
| PUT    | `/api/auth/password`   | Private | Change password     |

### Projects
| Method | Endpoint                                     | Access        |
|--------|----------------------------------------------|---------------|
| GET    | `/api/projects`                              | Member        |
| POST   | `/api/projects`                              | Any user      |
| GET    | `/api/projects/:id`                          | Member        |
| PUT    | `/api/projects/:id`                          | Admin         |
| DELETE | `/api/projects/:id`                          | Owner         |
| POST   | `/api/projects/:id/members`                  | Admin         |
| PUT    | `/api/projects/:id/members/:userId`          | Admin         |
| DELETE | `/api/projects/:id/members/:userId`          | Admin         |

### Tasks
| Method | Endpoint                                                    | Access  |
|--------|-------------------------------------------------------------|---------|
| GET    | `/api/projects/:id/tasks`                                   | Member  |
| POST   | `/api/projects/:id/tasks`                                   | Member  |
| GET    | `/api/projects/:id/tasks/:taskId`                           | Member  |
| PUT    | `/api/projects/:id/tasks/:taskId`                           | Member  |
| DELETE | `/api/projects/:id/tasks/:taskId`                           | Admin/Creator |
| POST   | `/api/projects/:id/tasks/:taskId/comments`                  | Member  |
| DELETE | `/api/projects/:id/tasks/:taskId/comments/:commentId`       | Author/Admin |

### Dashboard
| Method | Endpoint              | Description                                     |
|--------|-----------------------|-------------------------------------------------|
| GET    | `/api/dashboard`      | Stats, overdue, due-soon, project progress      |
| GET    | `/api/dashboard/users`| Search users by name/email                      |

---

## 🔐 Role-Based Access Control

| Action                     | Admin | Member |
|----------------------------|-------|--------|
| Create project             | ✅    | ✅     |
| Edit project settings      | ✅    | ❌     |
| Delete project             | ✅ (owner only) | ❌ |
| Invite/remove members      | ✅    | ❌     |
| Change member roles        | ✅    | ❌     |
| Create/edit tasks          | ✅    | ✅     |
| Delete any task            | ✅    | ❌     |
| Delete own task            | ✅    | ✅     |
| Add/delete own comments    | ✅    | ✅     |
| Delete any comment         | ✅    | ❌     |
