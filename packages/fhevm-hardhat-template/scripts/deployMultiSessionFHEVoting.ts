import hre from "hardhat";

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying MultiSessionFHEVoting with account:", deployer);

  const multiSessionVoting = await deploy("MultiSessionFHEVoting", {
    from: deployer,
    args: [], // MultiSessionFHEVoting không cần args cho constructor
    log: true,
  });

  console.log("✅ MultiSessionFHEVoting deployed at:", multiSessionVoting.address);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});
