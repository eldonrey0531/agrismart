declare interface NodeModule {
  hot?: {
    /**
     * Accept updates for the given dependencies and fire a callback when they're updated
     */
    accept(
      dependencies: string | string[],
      callback?: (updatedDependencies: string[]) => void,
    ): void;
    accept(callback?: (updatedDependencies: string[]) => void): void;

    /**
     * Decline updates for the given dependencies
     */
    decline(dependencies?: string | string[]): void;

    /**
     * Add a one-time disposer to help clean up when this module is replaced
     */
    dispose(callback: (data: any) => void): void;

    /**
     * Add a one-time disposer to help clean up when this module is replaced
     */
    addDisposeHandler(callback: (data: any) => void): void;

    /**
     * Remove a disposer added via addDisposeHandler
     */
    removeDisposeHandler(callback: (data: any) => void): void;

    /**
     * Test whether HMR is enabled
     */
    active: boolean;

    /**
     * Get current HMR status
     */
    status(): 'idle' | 'check' | 'prepare' | 'ready' | 'dispose' | 'apply' | 'abort' | 'fail';

    /**
     * Add a status change handler
     */
    addStatusHandler(callback: (status: string) => void): void;

    /**
     * Remove a status change handler
     */
    removeStatusHandler(callback: (status: string) => void): void;
  };
}