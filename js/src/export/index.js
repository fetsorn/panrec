import fs from "fs";
import path from "path";
import exportCSVS from "./csvs.js";
import exportStdout from "./stdout.js";
import exportBiorg from "./biorg.js";
import exportJson from "./json.js";

export default function exportStream(targetPath, targetType, doYank, doInsert) {
  // explicit -t takes precedence
  if (targetType === "csvs") {
    return exportCSVS(path.normalize(targetPath), doYank, doInsert);
  }

  if (targetType === "biorg") {
    return exportBiorg(targetPath);
  }

  if (targetType === "json" && targetPath) {
    return exportJson(targetPath);
  }

  if (targetType === "json" && !targetPath) {
    return exportStdout();
  }

  // no -t: auto-detect from path
  if (!targetPath) {
    return exportStdout();
  }

  if (fs.statSync(targetPath).isDirectory()) {
    return exportCSVS(path.normalize(targetPath), doYank, doInsert);
  }

  return fs.createWriteStream(path.normalize(targetPath));
}
