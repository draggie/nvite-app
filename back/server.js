// @ts-check
var util = require("./util");
const express = require("express");
const http = require("http");
const url = require("url");
var cookieParser = require("cookie-parser");
const request = require("request");
var cors = require("cors");
const removed = [];
var fs = require("fs");
const { values } = require("lodash");
const { randomIntFromInterval } = require("./util");

async function main() {
  // Azure App Service will set process.env.port for you, but we use 3000 in development.
  const PORT = process.env.PORT || 3001;
  // Create the express routes
  let app = express();
  app.use(express.static("public"));
  app.use(cookieParser());
  app.use(cors());

  app.get("/", async (req, res) => {
    if (req.query && req.query.loginsession) {
      res.cookie("loginsession", req.query.loginsession, {
        maxAge: 3600000,
        httpOnly: true,
      });
      res.redirect(url.parse(req.url).pathname);
    } else {
      let indexContent = await util.loadEnvironmentVariables({
        host: process.env["HTTP_HOST"],
      });
      res.end(indexContent);
    }
  });

  app.get("/api/metadata", async (req, res) => {
    if (req.cookies.loginsession) {
      let tryappserviceendpoint =
        (process.env["APPSETTING_TRYAPPSERVICE_URL"] ||
          "https://tryappservice.azure.com") + "/api/vscoderesource";
      const options = {
        url: tryappserviceendpoint,
        headers: {
          cookie: "loginsession=" + req.cookies.loginsession,
        },
      };

      const x = request(options);
      x.pipe(res);
    } else {
      res.end(404);
    }
  });

  app.get("/list", (_req, res, _next) => {
    fs.readFile(__dirname + "/public/list.json", (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));

        return;
      }
      res.writeHead(200);
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
    if (mapped[actor.id]) {
      res.status(412);
      res.end();
    } else {
      const filtered = publicList
        .filter((q) => !values(mapped).some((x) => x.id === q.id))
        .filter((q) => q.id !== actor.id);

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

  // Create the HTTP server.
  let server = http.createServer(app);
  server.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
  });
}

main();
