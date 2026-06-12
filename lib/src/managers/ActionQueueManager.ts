import { ViewerAction, ActionExecutionResult } from "../interfaces/ViewerTypes";

// Single action queue with readiness-gated execution
export class ActionQueueManager {
  // Bounded history for getActionStatus()/getQueueStatus(); prevents unbounded
  // growth in long-lived viewers (every dispatched action has a unique id).
  private static readonly MAX_EXECUTED_RESULTS = 100;

  private actionQueue: Array<{ action: ViewerAction; readinessLevel: number }> =
    [];
  private executedActions: Map<string, ActionExecutionResult> = new Map();
  public isDocumentLoaded = false;
  private postMessageReadiness = 0;
  private diagnosticLogs = false;
  private postMessageExecutor?: (action: ViewerAction) => Promise<any>;

  constructor(diagnosticLogs = false) {
    this.diagnosticLogs = diagnosticLogs;
  }

  setDiagnosticLogs(enabled: boolean): void {
    this.diagnosticLogs = enabled;
  }

  updateReadiness(readiness: number): void {
    this.postMessageReadiness = readiness;
  }

  queueAction(action: ViewerAction, readinessLevel: number): void {
    this.actionQueue.push({ action, readinessLevel });
  }

  onDocumentLoaded(): void {
    this.isDocumentLoaded = true;
    this.processQueuedActions();
  }

  // Execute every queued action whose readiness requirement is now met
  public processQueuedActions(): void {
    const ready: ViewerAction[] = [];
    this.actionQueue = this.actionQueue.filter((item) => {
      const canExecute =
        this.postMessageReadiness >= item.readinessLevel &&
        (item.readinessLevel < 5 || this.isDocumentLoaded);
      if (canExecute) {
        ready.push(item.action);
      }
      return !canExecute;
    });
    ready.forEach((action) => this.executeAction(action));
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
      const response = await this.executeActionViaPostMessage(action);
      result.success = true;
      // Query actions return a payload in the wrapper's control response
      if (response && typeof response === "object" && "data" in response) {
        result.data = (response as any).data;
      }
      action.resolver?.(result);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      if (this.diagnosticLogs) {
        console.error(
          `ActionQueueManager: Error executing action ${action.action}:`,
          error,
        );
      }
      // A requeued action retries later with the same id and resolver - don't
      // settle the caller's promise on the transient failure.
      if (action.requeued) {
        action.requeued = false;
      } else {
        action.resolver?.(result);
      }
    }

    this.recordResult(action.id, result);
    return result;
  }

  private recordResult(id: string, result: ActionExecutionResult): void {
    if (
      this.executedActions.size >= ActionQueueManager.MAX_EXECUTED_RESULTS &&
      !this.executedActions.has(id)
    ) {
      const oldest = this.executedActions.keys().next().value;
      if (oldest !== undefined) {
        this.executedActions.delete(oldest);
      }
    }
    this.executedActions.set(id, result);
  }

  private async executeActionViaPostMessage(
    action: ViewerAction,
  ): Promise<any> {
    if (!this.postMessageExecutor) {
      throw new Error("PostMessage executor not set");
    }

    return await this.postMessageExecutor(action);
  }

  setPostMessageExecutor(
    executor: (action: ViewerAction) => Promise<any>,
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

  // Settle document-gated (level-5) actions when a document load fails -
  // they can never execute against the failed document, and without this
  // consumer awaits (setAnnotations, search, getDocumentText, ...) hang
  // forever. Lower-level actions stay queued: the viewer itself is alive.
  failDocumentActions(reason: string): void {
    this.actionQueue = this.actionQueue.filter((item) => {
      if (item.readinessLevel < 5) {
        return true;
      }
      item.action.resolver?.({
        actionId: item.action.id,
        success: false,
        error: reason,
        timestamp: Date.now(),
      });
      return false;
    });
  }

  // Drop queued actions (settling their callers' promises) and clear history
  clearQueues(): void {
    for (const item of this.actionQueue) {
      item.action.resolver?.({
        actionId: item.action.id,
        success: false,
        error: "Action discarded: queue cleared",
        timestamp: Date.now(),
      });
    }
    this.actionQueue = [];
    this.executedActions.clear();
  }

  // Full reset for a new document load (pdfSrc change / refresh)
  reset(): void {
    this.clearQueues();
    this.isDocumentLoaded = false;
    this.postMessageReadiness = 0;
  }

  getQueueStatus(): { queuedActions: number; executedActions: number } {
    return {
      queuedActions: this.actionQueue.length,
      executedActions: this.executedActions.size,
    };
  }
}
