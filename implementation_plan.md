# Ekyam Project Deployment Strategy

This plan outlines the step-by-step process for deploying the Ekyam MERN stack project. Since we need to host a Frontend (React/Vite), a Backend (Node.js/Express), and a Database (MongoDB), the most cost-effective and common strategy involves splitting them across specialized platforms.

## Proposed Architecture
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database) (Free Cluster)
- **Backend**: [Render](https://render.com) (Free Web Service)
- **Frontend**: [Vercel](https://vercel.com) (Free Hobby Plan)

> [!TIP]
> This combination is completely free, straightforward to set up, and highly reliable.

---

## Deployment Steps

### Step 1: Deploying the Database (MongoDB Atlas)
Since your local app uses `mongodb://localhost:27017/ekyam_db`, this needs to convert to a cloud instance.
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Deploy a new "Shared" cluster (FREE tier).
3. Create a **Database User** with a username and password.
4. Update the **Network Access** to allow access from anywhere (`0.0.0.0/0`) so your backend can connect to it.
5. Get your connection string (it will look like `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/ekyam_db?retryWrites=true&w=majority`).

### Step 2: Deploying the Backend (Render)
Render takes your Node.js GitHub repository, automatically runs `npm install`, and starts the server utilizing the `"start": "node server.js"` command from your backend's `package.json`.
1. Push your `ekyam-backend` to a GitHub repository if you haven't already.
2. Sign up on [Render](https://render.com) and click **"New Web Service"**.
3. Connect your GitHub repository.
4. Provide the following details:
   - **Root Directory**: `backend` (crucial since it's a monorepo).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click on **Advanced** to set the following Environment Variables based on your `.env`:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *(Paste the Atlas URI from Step 1)*
   - `JWT_SECRET`: *(A random strong string)*
   - `FRONTEND_URL`: *(We will update this after Step 3)*
   - `CORS_ORIGIN`: *(We will update this after Step 3)*
   - `EMAIL_USER` / `EMAIL_PASS`
6. Click **Create Web Service**. Once fully active, it will give you a backend URL (e.g., `https://ekyam-api.onrender.com`).

### Step 3: Deploying the Frontend (Vercel)
Vercel is optimal for Vite apps.
1. Sign up on [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Open the **Environment Variables** section and add:
   - `VITE_API_URL`: *(Paste the Render backend URL from Step 2, e.g., `https://ekyam-api.onrender.com/api`)*
5. Click **Deploy**. Vercel will give you a frontend URL (e.g., `https://ekyam-frontend.vercel.app`).

### Step 4: Final Environment Linking
1. Now that you have the frontend URL, go back to your **Render** backend Dashboard.
2. Update the Environment Variables:
   - `FRONTEND_URL`: `https://ekyam-frontend.vercel.app`
   - `CORS_ORIGIN`: `https://ekyam-frontend.vercel.app`
3. Restart the Render service if it doesn't automatically.

---

## User Review Required

> [!CAUTION]
> Because these involve third-party web dashboards, **you** must perform the account creations and click sequences on MongoDB Atlas, Render, and Vercel.

**Would you like me to guide you sequentially, starting with MongoDB Atlas, or do you have any questions about this deployment strategy before we begin?**
