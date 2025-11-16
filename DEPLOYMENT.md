# Deployment Guide for Render

This guide will help you deploy the nvite-app to Render.

## Prerequisites

1. A GitHub account with this repository
2. A Render account (sign up at https://render.com)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**
   - Render will automatically start the deployment
   - The build process will:
     - Install all dependencies
     - Build the React frontend
     - Copy the build to `back/public/build`
     - Start the Express server

### Option 2: Manual Setup

1. **Create a new Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name**: `nvite-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan)

3. **Environment Variables** (optional, already set in render.yaml):
   - `NODE_ENV`: `production`
   - `PORT`: Automatically set by Render

4. **Deploy**
   - Click "Create Web Service"
   - Render will start building and deploying

## How It Works

1. **Build Process**:
   - `npm run build` runs `build:frontend` which builds the React app
   - Then runs `build:backend` which copies the build to `back/public/build`

2. **Server**:
   - Express server serves:
     - API routes: `/list`, `/picklist`, `/lottery/:id`
     - Static React app from `back/public/build`
     - All non-API routes serve `index.html` for React Router

3. **API Calls**:
   - Frontend uses relative paths (`/list`, `/lottery/:id`)
   - These are handled by the Express server

## Local Development

To test the production build locally:

```bash
# Install all dependencies
npm run install:all

# Build the app
npm run build

# Start the server
npm start
```

The app will be available at http://localhost:3001

## Troubleshooting

### Build fails
- Check that all dependencies are in the root `package.json`
- Ensure Node.js version is 18+ (check `package.json` engines)

### API calls fail
- Verify the server is serving from `back/public/build`
- Check that the build was copied correctly
- Ensure API routes are defined before the catch-all route

### Static files not loading
- Check that React build output is in `back/public/build`
- Verify the static middleware is configured correctly

## Notes

- The free tier on Render may spin down after 15 minutes of inactivity
- For production, consider upgrading to a paid plan
- File writes (like `mapped.json`) will persist on Render's filesystem

