import chalk from 'chalk';
import type { CliSpinnerInterface } from './utils.interface';

/**
 * CLI Spinner Implementation
 */
export class CliSpinner implements CliSpinnerInterface {
  private message: string;
  private interval: NodeJS.Timeout | null = null;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private currentFrame = 0;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    if (this.interval) return;
    process.stdout.write('\x1B[?25l'); // Hide cursor
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.frames[this.currentFrame]} ${this.message}`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write('\x1B[?25h'); // Show cursor
      process.stdout.write('\r' + ' '.repeat(this.message.length + 2) + '\r');
    }
  }

  succeed(message: string): void {
    this.stop();
    console.log(chalk.green('✓') + ' ' + message);
  }

  fail(message: string): void {
    this.stop();
    console.log(chalk.red('✗') + ' ' + message);
  }
}

/**
 * Logger Implementation
 */
export class CliLogger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ') + ' ' + message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓') + ' ' + message);
  }

  static warning(message: string): void {
    console.log(chalk.yellow('⚠') + ' ' + message);
  }

  static error(message: string, error?: unknown): void {
    console.log(chalk.red('✗') + ' ' + message);
    if (error) {
      console.error(
        chalk.red(error instanceof Error ? error.message : String(error))
      );
    }
  }

  static header(message: string): void {
    console.log('\n' + chalk.bold(message));
  }

  static subHeader(message: string): void {
    console.log('\n' + chalk.cyan(message));
  }

  static step(number: number, message: string): void {
    console.log(`${number}. ${message}`);
  }

  static command(command: string): void {
    console.log(chalk.cyan(command));
  }

  static list(items: string[], indent = 2): void {
    items.forEach(item => {
      console.log(' '.repeat(indent) + '- ' + item);
    });
  }

  static newLine(): void {
    console.log();
  }

  static formatPath(path: string): string {
    return chalk.cyan(path);
  }

  static formatCommand(command: string): string {
    return chalk.cyan(command);
  }
}

export default {
  Spinner: CliSpinner,
  Logger: CliLogger,
};