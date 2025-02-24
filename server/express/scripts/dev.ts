#!/usr/bin/env node
import type { Stats, Configuration } from 'webpack';
import type { ChildProcess } from 'child_process';
import path from 'path';
import { spawn } from 'child_process';
import webpack from 'webpack';
import { spawn as crossSpawn } from 'cross-spawn';
import webpackConfig from '../webpack.config';

interface ProcessState {
  webpackWatcher?: webpack.Watching;
  nodeProcess?: ChildProcess;
  tscProcess?: ChildProcess;
}

const state: ProcessState = {};
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const SERVER_PATH = path.resolve(DIST_DIR, 'server.js');

/**
 * Start webpack compilation with watching
 */
function startWebpack(): webpack.Watching {
  const compiler = webpack({
    ...webpackConfig,
    mode: 'development',
    watch: true,
  } as Configuration);

  return compiler.watch(
    {
      aggregateTimeout: 300,
      poll: undefined,
      ignored: /node_modules/,
    },
    (err: Error | null, stats: Stats | undefined) => {
      if (err) {
        console.error('❌ Webpack error:', err);
        return;
      }

      if (stats?.hasErrors()) {
        console.error('❌ Webpack compilation errors:', stats.toString('errors-only'));
        return;
      }

      console.log('📦 Webpack build completed successfully');
      startNodeProcess();
    }
  );
}

/**
 * Start the Node.js server process
 */
function startNodeProcess(): void {
  if (state.nodeProcess) {
    state.nodeProcess.kill();
  }

  state.nodeProcess = spawn('node', [SERVER_PATH], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  state.nodeProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  state.nodeProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });
}

/**
 * Start TypeScript compiler in watch mode
 */
function startTypeScriptWatch(): ChildProcess {
  const tsc = crossSpawn('tsc', ['--watch', '--preserveWatchOutput'], {
    stdio: 'inherit',
  });

  tsc.on('error', (error) => {
    console.error('❌ TypeScript compilation error:', error);
  });

  return tsc;
}

/**
 * Clean up processes on exit
 */
function cleanup(): void {
  console.log('\n🧹 Cleaning up processes...');

  if (state.nodeProcess) {
    state.nodeProcess.kill();
  }

  if (state.webpackWatcher) {
    state.webpackWatcher.close(() => {
      console.log('Webpack watcher closed');
    });
  }

  if (state.tscProcess) {
    state.tscProcess.kill();
  }

  process.exit();
}

/**
 * Main development process
 */
function main(): void {
  console.log('🛠️  Starting development server...');

  // Start TypeScript compilation
  state.tscProcess = startTypeScriptWatch();

  // Start webpack bundling with watching
  state.webpackWatcher = startWebpack();

  // Handle process termination
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    cleanup();
  });

  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled rejection:', reason);
    cleanup();
  });
}

// Run the development server
main();