// @ts-check
const express = require("express");
const http = require("http");
const path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var fs = require("fs");
const { values } = require("lodash");
const { randomIntFromInterval } = require("./util");
const axios = require("axios");

// Simple persistent storage using JSONBin.io (free tier)
// Falls back to file system if JSONBIN_API_KEY is not set
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const USE_JSONBIN = !!JSONBIN_API_KEY;

// Store the created bin ID in memory if we auto-create one
let createdBinId = null;

const JSONBIN_API_URL = "https://api.jsonbin.io/v3/b";

// Fallback to local file path if not using JSONBin
const getMappedFilePath = () => __dirname + "/public/mapped.json";

// Load mapped data from persistent storage
async function loadMappedData() {
  if (USE_JSONBIN) {
    const binIdToUse = createdBinId || JSONBIN_BIN_ID;
    if (!binIdToUse) {
      console.log("No JSONBin Bin ID provided - bin will be created on first save");
      return {};
    }
    
    console.log("Loading mapped data from JSONBin, Bin ID:", binIdToUse);
    try {
      // @ts-ignore - axios methods exist at runtime
      const response = await axios.get(`${JSONBIN_API_URL}/${binIdToUse}/latest`, {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      });
      if (response.data && response.data.record) {
        const record = response.data.record;
        // Remove initialization placeholder if present
        if (record._init) {
          delete record._init;
        }
        console.log("Loaded mapped data from JSONBin:", Object.keys(record).length, "entries");
        return record;
      }
      console.log("JSONBin record is empty, starting fresh");
      return {};
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log("JSONBin not found (404) - will be created on first save");
        } else if (error.response.status === 400) {
          console.error("JSONBin API error (400) - check Bin ID and API key. Response:", error.response.data);
        } else {
          console.error("JSONBin API error:", error.response.status, error.response.data);
        }
      } else {
        console.error("Error loading from JSONBin:", error.message);
      }
      return {};
    }
  } else {
    // Fallback to file system
    try {
      const mappedFile = fs.readFileSync(getMappedFilePath()).toString();
      return JSON.parse(mappedFile);
    } catch (error) {
      console.log("mapped.json not found, starting fresh");
      return {};
    }
  }
}

// Save mapped data to persistent storage
async function saveMappedData(mapped) {
  if (USE_JSONBIN) {
    try {
      // JSONBin doesn't allow empty objects, so ensure we have at least something
      const dataToSave = Object.keys(mapped).length === 0 ? { _init: true } : mapped;
      
      // Use the bin ID we created, or the provided one
      const binIdToUse = createdBinId || JSONBIN_BIN_ID;
      
      if (binIdToUse) {
        // We have a bin ID - try to use it (either update existing or will fail)
        let binExists = false;
        try {
          // @ts-ignore - axios methods exist at runtime
          await axios.get(`${JSONBIN_API_URL}/${binIdToUse}/latest`, {
            headers: {
              "X-Master-Key": JSONBIN_API_KEY,
            },
          });
          binExists = true;
        } catch (readError) {
          // Bin doesn't exist (404) or other error - we'll create it
          if (readError.response && readError.response.status === 404) {
            binExists = false;
          } else {
            // If it's a 400, the bin ID might be invalid - try creating new
            if (readError.response && readError.response.status === 400) {
              console.log("Bin ID appears invalid (400) - will create new bin");
              binExists = false;
            } else {
              throw readError;
            }
          }
        }
        
        if (binExists) {
          // Bin exists - update it with PUT
          // @ts-ignore - axios methods exist at runtime
          await axios.put(
            `${JSONBIN_API_URL}/${binIdToUse}`,
            dataToSave,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Master-Key": JSONBIN_API_KEY,
            },
          }
        );
        console.log("Updated JSONBin successfully");
      } else {
        // Bin doesn't exist or invalid ID - create new bin with POST
        // Note: POST creates a new bin with a new ID
        try {
          // @ts-ignore - axios methods exist at runtime
          const createResponse = await axios.post(
            `${JSONBIN_API_URL}`,
            dataToSave,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_API_KEY,
                "X-Bin-Name": "nvite-lottery-results",
              },
            }
          );
          const newBinId = createResponse.data?.metadata?.id;
          if (newBinId) {
            createdBinId = newBinId; // Store in memory for this session
            console.log("✅ Created new JSONBin successfully! New Bin ID:", newBinId);
            console.log("⚠️ IMPORTANT: Set JSONBIN_BIN_ID environment variable to:", newBinId);
            console.log("⚠️ Otherwise, a new bin will be created on each server restart");
            console.log("⚠️ You can find this bin in your JSONBin.io dashboard");
          }
        } catch (createError) {
          if (createError.response) {
            if (createError.response.status === 400) {
              console.error("Failed to create JSONBin (400):", createError.response.data);
              console.error("This usually means:");
              console.error("1. The data is invalid or empty (though we guard against this)");
              console.error("2. The API key doesn't have permission to create bins");
              console.error("3. The bin name is invalid");
            } else {
              console.error("Failed to create JSONBin:", createError.response.status, createError.response.data);
            }
          } else {
            console.error("Failed to create JSONBin:", createError.message);
          }
          throw createError;
        }
      }
    } else {
      // No bin ID provided - create a new bin
      try {
        // @ts-ignore - axios methods exist at runtime
        const createResponse = await axios.post(
          `${JSONBIN_API_URL}`,
          dataToSave,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Master-Key": JSONBIN_API_KEY,
              "X-Bin-Name": "nvite-lottery-results",
            },
          }
        );
        const newBinId = createResponse.data?.metadata?.id;
        if (newBinId) {
          createdBinId = newBinId; // Store in memory for this session
          console.log("✅ Created new JSONBin successfully! New Bin ID:", newBinId);
          console.log("⚠️ IMPORTANT: Set JSONBIN_BIN_ID environment variable to:", newBinId);
          console.log("⚠️ Otherwise, a new bin will be created on each server restart");
          console.log("⚠️ You can find this bin in your JSONBin.io dashboard");
        }
      } catch (createError) {
        if (createError.response) {
          if (createError.response.status === 400) {
            console.error("Failed to create JSONBin (400):", createError.response.data);
            console.error("This usually means:");
            console.error("1. The data is invalid or empty (though we guard against this)");
            console.error("2. The API key doesn't have permission to create bins");
            console.error("3. The bin name is invalid");
          } else {
            console.error("Failed to create JSONBin:", createError.response.status, createError.response.data);
          }
        } else {
          console.error("Failed to create JSONBin:", createError.message);
        }
        throw createError;
      }
    }
    } catch (error) {
      console.error("Error saving to JSONBin:", error.response?.data || error.message);
      console.error("Full error:", error);
      // Continue execution even if save fails
    }
  } else {
    // Fallback to file system
    fs.writeFileSync(getMappedFilePath(), JSON.stringify(mapped));
  }
}

async function main() {
  // Render will set process.env.PORT for you, but we use 3001 in development.
  const PORT = process.env.PORT || 3001;
  // Create the express routes
  let app = express();
  // @ts-ignore - Express middleware works correctly at runtime
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());

  // Serve static files from public directory (for API JSON files)
  app.use("/api", express.static(path.join(__dirname, "public")));

  // Serve React app static files from build directory
  // This must come before the catch-all route
  app.use(express.static(path.join(__dirname, "public/build")));

  // API routes
  app.get("/list", (_req, res, _next) => {
    fs.readFile(__dirname + "/public/list.json", (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
  });

  app.get("/test", (_req, res, _next) => {
    res.json({ status: "OK" });
  });

  app.get("/picklist", async (_req, res, _next) => {
    try {
      const publicFile = fs
        .readFileSync(__dirname + "/public/list.json")
        .toString();
      const publicList = JSON.parse(publicFile);
      const mapped = await loadMappedData();

      const filtered = publicList.filter(
        (q) => !values(mapped).some((x) => x.id === q.id)
      );
      res.status(200);
      res.json(filtered);
    } catch (error) {
      console.error("Error in /picklist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/lottery/:id", async (req, res, _next) => {
    try {
      const publicFile = fs
        .readFileSync(__dirname + "/public/list.json")
        .toString();
      const publicList = JSON.parse(publicFile);
      console.log("Public list:", publicList);
      const mapped = await loadMappedData();
      console.log("Mapped:", mapped);

      const actor = publicList.find(
        (q) => q.id === Number.parseInt(req.params.id, 10)
      );
      if (!actor) {
        res.status(404);
        res.end();
        return;
      }
      if (mapped[actor.id]) {
        res.status(412).json({ 
          error: "Lottery already completed for this user",
          result: mapped[actor.id]
        });
        return;
      }

      const filtered = publicList
        .filter((q) => !values(mapped).some((x) => x.id === q.id))
        .filter((q) => q.id !== actor.id)
        .filter((q) => q.groupId !== actor.groupId);

      const index = randomIntFromInterval(0, filtered.length - 1);
      console.log(actor, filtered[index], index, filtered);
      const target = filtered[index];
      if (target) {
        mapped[actor.id] = filtered[index];
        await saveMappedData(mapped);
        res.status(200);
        res.json(mapped[actor.id]);
        res.end();
      } else {
        res.status(400);
        res.end();
      }
    } catch (error) {
      console.error("Error in /lottery/:id:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Handle React Router - serve index.html for all non-API routes
  // This must be last, after static file serving
  // Express static middleware will handle static files before this route
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (
      req.path.startsWith("/api/") ||
      req.path.startsWith("/list") ||
      req.path.startsWith("/picklist") ||
      req.path.startsWith("/lottery") ||
      req.path.startsWith("/test")
    ) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // Don't serve index.html for requests that look like static files
    // (Express static middleware should have handled these, but just in case)
    if (req.path.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i)) {
      res.status(404).send("File not found");
      return;
    }
    
    // Serve React app for all other routes (SPA routing)
    const indexPath = path.join(__dirname, "public/build/index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send("Build files not found. Please run 'yarn build' first.");
    }
  });

  // Create the HTTP server.
  let server = http.createServer(app);
  server.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
  });
}

main();
