# Nvite App

A fun interactive gift-picking application built with React and Express.

## Prerequisites

- Node.js 20.x (use `.nvmrc` or check `package.json` engines)
- Yarn package manager

## Local Development

### Quick Start

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Run development mode (recommended):**
   
   In one terminal, start the React dev server:
   ```bash
   yarn dev
   ```
   This starts the frontend on http://localhost:3000 with hot reload.

   In another terminal, start the backend API server:
   ```bash
   yarn dev:server
   ```
   This starts the Express API on http://localhost:3001.

   The React dev server is configured to proxy API requests to the backend automatically, so API calls will work seamlessly.

### Production Build (Local Testing)

To test the production build locally:

1. **Build the app:**
   ```bash
   yarn build
   ```
   This will:
   - Build the React frontend to `build/`
   - Copy the build to `back/public/build/`

2. **Start the production server:**
   ```bash
   yarn start
   ```
   The app will be available at http://localhost:3001

## Available Scripts

- `yarn dev` - Start React development server (port 3000)
- `yarn dev:server` - Start Express API server (port 3001)
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run tests

## Project Structure

```
nvite-app/
├── src/              # React frontend source
├── back/             # Express backend
│   ├── server.js     # Express server
│   └── public/        # API data files and build output
├── scripts/          # Build scripts
└── build/            # React build output (temporary)
```

## API Endpoints

- `GET /list` - Get all users
- `GET /picklist` - Get available users for picking
- `POST /lottery/:id` - Pick a random user for the given ID
- `GET /test` - Health check

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render deployment instructions.
