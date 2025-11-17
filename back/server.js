// @ts-check
const express = require("express");
const http = require("http");
const path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var fs = require("fs");
const { values } = require("lodash");
const { randomIntFromInterval } = require("./util");

async function main() {
  // Render will set process.env.PORT for you, but we use 3001 in development.
  const PORT = process.env.PORT || 3001;
  // Create the express routes
  let app = express();
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
    const publicFile = fs
      .readFileSync(__dirname + "/public/list.json")
      .toString();
    const mappedFile = fs
      .readFileSync(__dirname + "/public/mapped.json")
      .toString();
    const publicList = JSON.parse(publicFile);
    const mapped = JSON.parse(mappedFile);

    const filtered = publicList.filter(
      (q) => !values(mapped).some((x) => x.id === q.id)
    );
    res.status(200);
    res.json(filtered);
  });

  app.post("/lottery/:id", (req, res, _next) => {
    const publicFile = fs
      .readFileSync(__dirname + "/public/list.json")
      .toString();
    const mappedFile = fs
      .readFileSync(__dirname + "/public/mapped.json")
      .toString();
    const publicList = JSON.parse(publicFile);
    const mapped = JSON.parse(mappedFile);

    const actor = publicList.find(
      (q) => q.id === Number.parseInt(req.params.id, 10)
    );
    if (!actor) {
      res.status(404);
      res.end();
      return;
    }
    if (mapped[actor.id]) {
      res.status(412);
      res.end();
    } else {
      const filtered = publicList
        .filter((q) => !values(mapped).some((x) => x.id === q.id))
        .filter((q) => q.id !== actor.id)
        .filter((q) => q.groupId !== actor.groupId);

      const index = randomIntFromInterval(0, filtered.length - 1);
      console.log(actor, filtered[index], index, filtered);
      const target = filtered[index];
      if (target) {
        mapped[actor.id] = filtered[index];
        fs.writeFileSync(
          __dirname + "/public/mapped.json",
          JSON.stringify(mapped)
        );
        res.status(200);
        res.json(mapped[actor.id]);
        res.end();
      } else {
        res.status(400);
        res.end();
      }
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
