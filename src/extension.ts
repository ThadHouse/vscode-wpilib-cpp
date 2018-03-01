'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { IExternalAPI } from './externalapi';
import { DebugCommands, startDebugging } from './debug';
import { gradleRun } from './gradle';



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(_: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-wpilib-cpp" is now active!');

    let coreExtension = vscode.extensions.getExtension<IExternalAPI>('wpifirst.vscode-wpilib-core');
    if (coreExtension === undefined) {
        vscode.window.showErrorMessage('Could not find core library');
        return;
    }

    let cppExtension = vscode.extensions.getExtension('ms-vscode.cpptools');
    if (cppExtension === undefined) {
        vscode.window.showErrorMessage('Could not find cpp extension');
        return;
    }

    let promises = new Array<Thenable<any>>();

    if (!cppExtension.isActive) {
        promises.push(cppExtension.activate());
    }

    if (!coreExtension.isActive) {
        promises.push(coreExtension.activate());
    }

    if (promises.length > 0) {
        await Promise.all(promises);
    }

    let coreExports: IExternalAPI = coreExtension.exports;

    let gradleChannel = vscode.window.createOutputChannel('gradleCpp');

    let wp = vscode.workspace.workspaceFolders;

    if (wp === undefined) {
        vscode.window.showErrorMessage('File mode is not supported');
        return;
    }

    let workspaces : vscode.WorkspaceFolder[] = wp;

    let getWorkSpace = async (): Promise<vscode.WorkspaceFolder | undefined> => {
        if (workspaces.length === 1) {
            return workspaces[0];
        }
        return await vscode.window.showWorkspaceFolderPick();
        //return workspaces[0];
    };

    coreExports.registerCodeDeploy({
        async getIsCurrentlyValid(): Promise<boolean> {
            return true;
        },
        async runDeployer(teamNumber: number): Promise<boolean> {
            let command = 'deploy --offline -PteamNumber=' + teamNumber;
            gradleChannel.show();
            let workspace = await getWorkSpace();
            if (workspace === undefined) {
                vscode.window.showInformationMessage('No workspace selected');
                return false;
            }
            let result = await gradleRun(command, workspace.uri.fsPath, gradleChannel);
            console.log(result);
            return true;
        },
        getDisplayName(): string {
            return 'cpp';
        }
    });

    coreExports.registerCodeDebug({
        async getIsCurrentlyValid(): Promise<boolean> {
            return true;
        },
        async runDeployer(teamNumber: number): Promise<boolean> {
            let command = 'deploy --offline -PdebugMode -PteamNumber=' + teamNumber;
            gradleChannel.show();
            let workspace = await getWorkSpace();
            if (workspace === undefined) {
                vscode.window.showInformationMessage('No workspace selected');
                return false;
            }
            let result = await gradleRun(command, workspace.uri.fsPath, gradleChannel);

            let config: DebugCommands = {
                serverAddress: '172.22.11.2',
                serverPort: '6667',
                gdbPath: 'c:/frc/bin/arm-linux-gnueabi-gdb.exe',
                executablePath: '${workspaceRoot}/build/exe/frcUserProgram',
                workspace: workspace
            };

            await startDebugging(config);

            console.log(result);
            return true;
        },
        getDisplayName(): string {
            return 'cpp';
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
