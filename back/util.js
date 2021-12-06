//@ts-check
const fs = require("fs");
module.exports.loadEnvironmentVariables = async function (updateObject) {
  return await fs
    .readFileSync(`${__dirname}/template.html`, "utf8")
    .replace("{ envVars }", `let env = ` + JSON.stringify(updateObject));
};

module.exports.randomIntFromInterval = function (min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};
