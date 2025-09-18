import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Danh sách ứng cử viên (có thể chỉnh lại tùy bạn)
  const candidates = ["Zama Fox", "Zama Rabit", "Zama Bear"];

  const deployedSimpleFHEVoting = await deploy("SimpleFHEVoting", {
    from: deployer,
    args: [candidates], // bắt buộc truyền string[] cho constructor
    log: true,
  });

  console.log(`✅ SimpleFHEVoting deployed at: ${deployedSimpleFHEVoting.address}`);
};

export default func;
func.id = "deploy_simpleFHEVoting"; // id để tránh re-deploy
func.tags = ["SimpleFHEVoting"];
