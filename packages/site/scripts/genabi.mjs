import * as fs from "fs";
import * as path from "path";

// Skip on Vercel
if (process.env.VERCEL === "1") {
  console.log("Skipping genabi on Vercel");
  process.exit(0);
}

const CONTRACT_NAMES = ["SimpleFHEVoting", "MultiSessionFHEVoting"];

// <root>/packages/fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// <root>/packages/site/components
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/packages/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");
// if (!fs.existsSync(deploymentsDir)) {
//   console.error(
//     `${line}Unable to locate 'deployments' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
//   );
//   process.exit(1);
// }


function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);


  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Generate ABI and addresses for all contracts
for (const CONTRACT_NAME of CONTRACT_NAMES) {
  const deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true /* optional */);

  if (!deploySepolia) {
    console.log(`⚠️  Skipping ${CONTRACT_NAME} - no Sepolia deployment found`);
    continue;
  }

  const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: deploySepolia.abi }, null, 2)} as const;
\n`;
  const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
};
`;

  console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
  console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
  fs.writeFileSync(
    path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
    tsAddresses,
    "utf-8"
  );
}
