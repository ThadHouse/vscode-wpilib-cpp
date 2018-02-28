'use strict';

// This file is designed to be copied into an
// external project to support the extension API

export interface ExternalAPI {
  startRioLog(teamNumber: number) : Promise<void>;
  getTeamNumber(): Promise<number>;
  setTeamNumber(teamNumber: number): Promise<void>;
  startTool(): Promise<void>;
  deployCode(): Promise<boolean>;
  registerCodeDeploy(deployer: ICodeDeployer): void;
  debugCode(): Promise<boolean>;
  registerCodeDebug(deployer: ICodeDeployer): void;
  getApiVersion(): number;
}

export interface ICodeDeployer {
  getIsCurrentlyValid(): Promise<boolean>;
  runDeployer(teamNumber: number): Promise<boolean>;
  getDisplayName(): string;
}
