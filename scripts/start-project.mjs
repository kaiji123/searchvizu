import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
try { process.loadEnvFile(path.join(root, ".env.local")); } catch { throw new Error("Configure .env.local for the development deployment first."); }
if (!process.env.CONVEX_DEPLOYMENT?.startsWith("dev:") || process.env.CONVEX_DEPLOY_KEY) throw new Error("This tool requires a personal dev deployment in .env.local and no CONVEX_DEPLOY_KEY. It must never target production for imports.");

const args = process.argv.slice(2);
let source, projectId;
const fileIds = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source") source = args[++i];
  else if (args[i] === "--project") projectId = args[++i];
  else if (args[i] === "--file") fileIds.push(args[++i]);
  else throw new Error("Usage: npm run workspace -- --source prod|dev --project ID [--file FILE_ID ...]");
}
if ((source !== "prod" && source !== "dev") || !/^[a-z0-9]{10,80}$/.test(projectId ?? "") || fileIds.some(id => !/^[a-z0-9]{10,80}$/.test(id ?? ""))) throw new Error("Specify --source prod|dev, a valid --project ID, and optional --file IDs.");

const cli = path.join(root, "node_modules", "convex", "bin", "main.js");
function call(deployment, name, input) {
  const run = spawnSync(process.execPath, [cli, "run", name, JSON.stringify(input), "--deployment", deployment], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, windowsHide: true });
  if (run.error || run.status !== 0) throw new Error(`Convex ${deployment} ${name} failed. Check deployment access and that the project is selected for work.`);
  try { return JSON.parse(run.stdout); } catch { throw new Error(`Unexpected response from Convex ${deployment} ${name}.`); }
}

// Never follow a symlink/junction when creating project or data directories.
async function safeDirectory(relative) {
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    try { await mkdir(current); } catch (error) { if (error.code !== "EEXIST") throw error; }
    const info = await lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`Unsafe directory in workspace: ${relative}`);
  }
  return current;
}

async function writeNew(filePath, contents) {
  try { await writeFile(filePath, contents, { flag: constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, mode: 0o600 }); return true; }
  catch (error) { if (error.code === "EEXIST") return false; throw error; }
}

const sourceData = call(source, "workspace:exportSelected", { requestId: projectId });
if (fileIds.some(id => !sourceData.files.some(file => file.id === id))) throw new Error("A requested file does not belong to this selected project.");
const result = call("dev", "workspace:importCopy", { source, sourceRequestId: projectId, title: sourceData.title, description: sourceData.description, type: sourceData.type });
const folderName = `${source}-${projectId}`;
const codeDir = await safeDirectory(`src/components/viz/private/projects/${folderName}`);
await writeNew(path.join(codeDir, "Visualisation.tsx"), '"use client";\n\nexport default function Visualisation() {\n  return <div>Project visualisation in progress.</div>;\n}\n');
await writeNew(path.join(codeDir, "README.md"), "# Project visualization workspace\n\nImplement the visualization here. Keep client data, files, credentials and research details out of this folder and out of Git. Register this component explicitly before use; see docs/project-workspaces.md.\n");
const dataDir = await safeDirectory(`.data/project-workspaces/${folderName}`);
const records = [];
for (const id of fileIds) {
  const meta = sourceData.files.find(file => file.id === id);
  const resultFile = call(source, "workspaceFiles:readSelected", { requestId: projectId, fileId: id });
  const contents = Buffer.from(resultFile.data, "base64");
  if (contents.length !== meta.size || contents.length > 10 * 1024 * 1024) throw new Error("Downloaded file size did not match its metadata.");
  const written = await writeNew(path.join(dataDir, id), contents);
  if (!written) throw new Error(`A local copy already exists for file ${id}; it was not overwritten.`);
  records.push({ id, name: meta.name, kind: meta.kind, size: meta.size });
}
// This directory is gitignored; never print the brief or credentials.
const manifestPath = path.join(dataDir, "source.json");
const manifest = { source, sourceRequestId: projectId, developmentRequestId: result.requestId, title: sourceData.title, description: sourceData.description, filesAvailable: sourceData.files, downloaded: records };
const existingInfo = await lstat(manifestPath).catch(error => { if (error.code === "ENOENT") return null; throw error; });
if (existingInfo && (!existingInfo.isFile() || existingInfo.isSymbolicLink())) throw new Error("Unsafe manifest path.");
const existingManifest = existingInfo ? JSON.parse(await readFile(manifestPath, "utf8")) : null;
if (existingManifest) {
  manifest.downloaded = [...(existingManifest.downloaded ?? []), ...records];
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2), { mode: 0o600 });
console.log(`Development workspace ${result.created ? "created" : "already exists"}: ${path.relative(root, codeDir)}`);
console.log(`Development project ID: ${result.requestId}`);
console.log(`Available files: ${sourceData.files.length}. Private metadata and ${records.length} selected file(s) are stored under .data/project-workspaces/${folderName}.`);
for (const file of sourceData.files) console.log(`  ${file.id}  ${JSON.stringify(file.name)}  ${file.size} bytes (${file.kind})`);
console.log("No production changes were made. Existing development projects and code files are never overwritten.");
