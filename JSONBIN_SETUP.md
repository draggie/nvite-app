# JSONBin.io Setup Guide

## Quick Setup (5 minutes)

To fix the issue where lottery results are lost when Render spins down the app, you need to set up JSONBin.io for persistent storage.

### Step 1: Create a JSONBin.io Account

1. Go to https://jsonbin.io
2. Click "Sign Up" (free account is sufficient)
3. Verify your email if required

### Step 2: Create a Bin

1. After logging in, click "Create Bin" or "+ New Bin"
2. Name it something like "nvite-lottery-results" (or leave it empty)
3. Click "Create"
4. **Copy the Bin ID** - you'll see something like `507f1f77bcf86cd799439011` in the URL or bin details

### Step 3: Create an API Key

1. Go to your profile/account settings
2. Navigate to "API Keys" or "Access Keys" section
3. Click "Create Master Key" or "Generate New Key"
4. **Copy the Master Key** - it will look like `$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Important:** Save both the Bin ID and Master Key securely - you'll need them in the next step.

### Step 4: Configure Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `nvite-app` service
3. Go to "Environment" tab
4. Add these environment variables:

   **Variable 1:**
   - **Key:** `JSONBIN_API_KEY`
   - **Value:** Your Master Key from Step 3

   **Variable 2:**
   - **Key:** `JSONBIN_BIN_ID`
   - **Value:** Your Bin ID from Step 2

5. Click "Save Changes"
6. Render will automatically redeploy your service

### Step 5: Verify It Works

1. Wait for the deployment to complete
2. Test the lottery functionality
3. Check your JSONBin.io dashboard - you should see the data appearing in your bin

## How It Works

- When a lottery result is saved, it's stored in JSONBin.io (not on Render's ephemeral disk)
- When the server restarts, it loads the data from JSONBin.io
- Results persist even when Render spins down your app

## Troubleshooting

**If results still disappear:**
- Check that environment variables are set correctly in Render
- Verify your API key has the correct permissions
- Check Render logs for any JSONBin.io errors

**If you see errors in logs:**
- Verify the Bin ID is correct
- Make sure your Master Key is valid
- Check that the bin was created (not deleted)

## Alternative: Without JSONBin.io

If you don't want to use JSONBin.io, the app will fall back to file storage, but **results will be lost** when Render spins down (which happens after 15 minutes of inactivity on the free tier).

