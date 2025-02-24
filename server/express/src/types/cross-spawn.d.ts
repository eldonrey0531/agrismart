declare module 'cross-spawn' {
  import { SpawnOptions, ChildProcess } from 'child_process';

  /**
   * Spawns a new process using the given command
   */
  export function spawn(
    command: string,
    args?: readonly string[],
    options?: SpawnOptions
  ): ChildProcess;

  /**
   * Spawns a new process using the given command and returns its output
   */
  export function sync(
    command: string,
    args?: readonly string[],
    options?: SpawnOptions
  ): {
    pid: number;
    output: string[];
    stdout: Buffer | null;
    stderr: Buffer | null;
    status: number | null;
    signal: NodeJS.Signals | null;
    error?: Error;
  };

  /**
   * Spawns a new process with shell support
   */
  export function shellSync(
    command: string,
    options?: SpawnOptions
  ): {
    pid: number;
    output: string[];
    stdout: Buffer | null;
    stderr: Buffer | null;
    status: number | null;
    signal: NodeJS.Signals | null;
    error?: Error;
  };

  /**
   * Check if a command exists
   */
  export function hasCommand(command: string): boolean;

  /**
   * Get the path to the command executable
   */
  export function getCommandPath(command: string): string | null;

  export default spawn;
}