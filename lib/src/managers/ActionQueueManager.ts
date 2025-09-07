import { ViewerAction, ActionExecutionResult } from "../interfaces/ViewerTypes";

// Simplified Action Queue Manager - Single queue with readiness-based execution
export class ActionQueueManager {
  private actionQueue: Array<{ action: ViewerAction; readinessLevel: number }> =
    [];
  private executedActions: Map<string, ActionExecutionResult> = new Map();
  public isDocumentLoaded = false;
  private isPostMessageReady = false;
  private postMessageReadiness = 0;
  private diagnosticLogs = false;
  private postMessageExecutor?: (action: string, payload: any) => Promise<any>;

  constructor(diagnosticLogs = false) {
    this.diagnosticLogs = diagnosticLogs;
  }

  setPostMessageReady(ready: boolean, readiness: number = 0): void {
    this.isPostMessageReady = ready;
    this.postMessageReadiness = readiness;

    if (ready) {
      this.processQueuedActions();
    }
  }

  updateReadiness(readiness: number): void {
    if (this.postMessageReadiness !== readiness) {
      this.postMessageReadiness = readiness;
    }
  }

  // Simplified queue management - single queue with readiness levels
  queueAction(action: ViewerAction, readinessLevel: number): void {
    this.actionQueue.push({ action, readinessLevel });
  }

  // Legacy methods for backward compatibility - now just delegate to main queue
  queueImmediateAction(action: ViewerAction): void {
    this.queueAction(action, 3);
  }

  queueViewerReadyAction(action: ViewerAction): void {
    this.queueAction(action, 4);
  }

  queueDocumentLoadedAction(action: ViewerAction): void {
    this.queueAction(action, 5);
  }

  queueOnDemandAction(action: ViewerAction): Promise<ActionExecutionResult> {
    return this.executeAction(action);
  }

  onDocumentLoaded(): void {
    this.isDocumentLoaded = true;
    this.processQueuedActions();
  }

  // Process all queued actions that now meet readiness requirements
  public processQueuedActions(): void {
    const executableActions = this.actionQueue.filter((item) => {
      const canExecute =
        this.postMessageReadiness >= item.readinessLevel &&
        (item.readinessLevel < 5 || this.isDocumentLoaded);

      return canExecute;
    });

    // Remove executable actions from queue
    this.actionQueue = this.actionQueue.filter((item) => {
      return !(
        this.postMessageReadiness >= item.readinessLevel &&
        (item.readinessLevel < 5 || this.isDocumentLoaded)
      );
    });

    // Execute all ready actions
    executableActions.forEach((item) => {
      this.executeAction(item.action);
    });
  }

  public async executeAction(
    action: ViewerAction,
  ): Promise<ActionExecutionResult> {
    const result: ActionExecutionResult = {
      actionId: action.id,
      success: false,
      timestamp: Date.now(),
    };

    try {
      if (action.condition && !action.condition(null)) {
        result.error = "Condition not met";
        this.executedActions.set(action.id, result);
        return result;
      }

      const success = await this.executeActionViaPostMessage(action);
      result.success = success;

      // If action has a resolver (from user interaction), call it
      if (action.resolver) {
        action.resolver(result);
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      if (this.diagnosticLogs) {
        console.error(
          `🔍 ActionQueueManager: Error executing action ${action.action}:`,
          error,
        );
      }

      // If action has a resolver (from user interaction), call it with error
      if (action.resolver) {
        action.resolver(result);
      }
    }

    this.executedActions.set(action.id, result);
    return result;
  }

  private async executeActionViaPostMessage(
    action: ViewerAction,
  ): Promise<boolean> {
    if (!this.postMessageExecutor) {
      throw new Error("PostMessage executor not set");
    }

    await this.postMessageExecutor(action.action, action.payload);
    return true;
  }

  setPostMessageExecutor(
    executor: (action: string, payload: any) => Promise<any>,
  ): void {
    this.postMessageExecutor = executor;
  }

  getActionStatus(
    actionId: string,
  ): "pending" | "executing" | "completed" | "failed" | "not-found" {
    const result = this.executedActions.get(actionId);
    if (!result) {
      const inQueue = this.actionQueue.some(
        (item) => item.action.id === actionId,
      );
      return inQueue ? "pending" : "not-found";
    }

    return result.success ? "completed" : "failed";
  }

  clearQueues(): void {
    this.actionQueue = [];
    this.executedActions.clear();
  }

  getQueueStatus(): { queuedActions: number; executedActions: number } {
    return {
      queuedActions: this.actionQueue.length,
      executedActions: this.executedActions.size,
    };
  }
}
