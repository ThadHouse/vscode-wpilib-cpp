'use strict';
import * as vscode from 'vscode';

export interface DebugCommands {
  serverAddress: string;
  serverPort: string;
  gdbPath: string;
  executablePath: string;
  workspace: vscode.WorkspaceFolder;
}

export async function startDebugging(commands: DebugCommands): Promise<void> {
  let config: vscode.DebugConfiguration = {
    name: 'wpilibCppDebug',
    type: 'cppdbg',
    request: 'launch',
    miDebuggerServerAddress: commands.serverAddress + ':' + commands.serverPort,
    miDebuggerPath: commands.gdbPath,
    program: commands.executablePath,
    cwd: commands.workspace.uri.fsPath,
    MIMode: 'gdb',
    setupCommands: [
      {
          description: 'Enable pretty-printing for gdb',
          text: 'enable-pretty-printing',
          ignoreFailures: true
      }
    ]
  };

  await vscode.debug.startDebugging(commands.workspace, config);
}
