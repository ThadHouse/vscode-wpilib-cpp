'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ExternalAPI, ICodeDeployer } from './externalapi';
import * as child_process from 'child_process';
import { DebugCommands, startDebugging } from './debug';

interface OutputPair {
    stdout: string;
    stderr: string;
}

function executeCommandAsync(command: string, rootDir: string, ow?: vscode.OutputChannel) : Promise<OutputPair> {
    return new Promise(function (resolve, reject) {
        let exec = child_process.exec;
        let child = exec(command, {
            cwd: rootDir
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({stdout: stdout, stderr: stderr});
            }
        });

        if (ow === undefined) {
            return;
        }

        child.stdout.on('data', (data) => {
            ow.append(data.toString());
        })

        child.stderr.on('data', (data) => {
            ow.append(data.toString());
        })
    });
}

async function gradleRun(args: string, rootDir: string, ow?: vscode.OutputChannel): Promise<OutputPair> {
    let command = 'gradlew ' + args;
    return await executeCommandAsync(command, rootDir, ow);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-wpilib-cpp" is now active!');

    let coreExtension = vscode.extensions.getExtension('wpifirst.vscode-wpilib-core');
    if (coreExtension === undefined) {
        vscode.window.showErrorMessage('Could not find core library');
        return;
    }

    await coreExtension.activate();

    let coreExports: ExternalAPI = coreExtension.exports;

    let gradleChannel = vscode.window.createOutputChannel('gradleCpp');

    let wp = vscode.workspace.rootPath;
    if (wp === undefined) {
        return;
    }

    let wp2: string = wp;

    coreExports.registerCodeDeploy({
        async getIsCurrentlyValid(): Promise<boolean> {
            return true;
        },
        async runDeployer(teamNumber: number): Promise<boolean> {
            let command = 'deploy --offline -PteamNumber=' + teamNumber;
            gradleChannel.show();
            let result = await gradleRun(command, wp2, gradleChannel);
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
            let result = await gradleRun(command, wp2, gradleChannel);

            let config: DebugCommands = {
                serverAddress: '172.22.11.2',
                serverPort: '6667',
                gdbPath: 'c:/frc/bin/arm-linux-gnueabi-gdb.exe',
                executablePath: '${workspaceRoot}/build/exe/frcUserProgram',
                cwd: '${workspaceRoot}',
            };

            await startDebugging(config);

            console.log(result);
            return true;
        },
        getDisplayName(): string {
            return 'cpp';
        }
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
