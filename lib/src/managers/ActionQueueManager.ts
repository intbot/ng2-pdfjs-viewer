import { ViewerAction, ActionExecutionResult } from '../interfaces/ViewerTypes';

// Action Queue Manager
export class ActionQueueManager {
  private immediateActions: ViewerAction[] = []; // Execute when PostMessage API is ready (readiness >= 3)
  private viewerReadyActions: ViewerAction[] = []; // Execute when components are ready (readiness >= 4)
  private documentLoadedActions: ViewerAction[] = []; // Execute after PDF loads (readiness >= 5)
  private pendingActions: ViewerAction[] = [];   // On-demand actions
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
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: PostMessage ready: ${ready}, readiness: ${readiness}`);
    }
    
    if (ready) {
      this.executeQueuedActions();
    }
  }

  // Unified queue management
  queueAction(action: ViewerAction, queueType: 'immediate' | 'viewer-ready' | 'document-loaded' | 'on-demand'): Promise<ActionExecutionResult> | void {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing ${queueType} action: ${action.action} = ${action.payload}`);
    }

    switch (queueType) {
      case 'immediate':
        this.immediateActions.push(action);
        // Actions execute only when setPostMessageReady triggers executeQueuedActions
        break;
      case 'viewer-ready':
        this.viewerReadyActions.push(action);
        // Actions execute only when readiness >= 4
        break;
      case 'document-loaded':
        this.documentLoadedActions.push(action);
        // Actions execute only when document is loaded
        break;
      case 'on-demand':
        this.pendingActions.push(action);
        return this.executeAction(action);
    }
  }

  // Legacy methods for backward compatibility
  queueImmediateAction(action: ViewerAction): void {
    this.queueAction(action, 'immediate');
  }

  queueViewerReadyAction(action: ViewerAction): void {
    this.queueAction(action, 'viewer-ready');
  }

  queueDocumentLoadedAction(action: ViewerAction): void {
    this.queueAction(action, 'document-loaded');
  }

  queueOnDemandAction(action: ViewerAction): Promise<ActionExecutionResult> {
    return this.queueAction(action, 'on-demand') as Promise<ActionExecutionResult>;
  }

  onDocumentLoaded(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueueManager: Document loaded, executing document loaded actions');
    }
    this.isDocumentLoaded = true;
    this.executeActionsFromQueue(this.documentLoadedActions);
  }

  // Unified action execution
  private executeQueuedActions(): void {
    this.executeActionsFromQueue(this.immediateActions);
    if (this.postMessageReadiness >= 4) {
      this.executeActionsFromQueue(this.viewerReadyActions);
    }
    if (this.postMessageReadiness >= 5) {
      this.isDocumentLoaded = true;
      this.executeActionsFromQueue(this.documentLoadedActions);
    }
  }

  private async executeActionsFromQueue(queue: ViewerAction[]): Promise<void> {
    if (queue.length === 0) return;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Executing ${queue.length} actions from queue`);
    }
    
    const actionsToExecute = [...queue];
    queue.length = 0; // Clear the queue
    
    for (const action of actionsToExecute) {
      try {
        await this.executeAction(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Error executing action ${action.action}:`, error);
        }
      }
    }
  }

  public async executeAction(action: ViewerAction): Promise<ActionExecutionResult> {
    const result: ActionExecutionResult = {
      actionId: action.id,
      success: false,
      timestamp: Date.now()
    };

    try {
      if (this.diagnosticLogs) {
        console.log(`🔍 ActionQueueManager: Executing action: ${action.action} = ${action.payload}`);
      }

      if (action.condition && !action.condition(null)) {
        result.error = 'Condition not met';
        this.executedActions.set(action.id, result);
        return result;
      }

      const success = await this.executeActionViaPostMessage(action);
      result.success = success;
      
        if (this.diagnosticLogs) {
        console.log(`🔍 ActionQueueManager: Action ${action.action} ${success ? 'succeeded' : 'failed'}`);
      }

      // If action has a resolver (from user interaction), call it
      if (action.resolver) {
        action.resolver(result);
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      if (this.diagnosticLogs) {
        console.error(`🔍 ActionQueueManager: Error executing action ${action.action}:`, error);
      }

      // If action has a resolver (from user interaction), call it with error
      if (action.resolver) {
        action.resolver(result);
      }
    }

    this.executedActions.set(action.id, result);
    return result;
  }

  private async executeActionViaPostMessage(action: ViewerAction): Promise<boolean> {
    if (!this.postMessageExecutor) {
      throw new Error('PostMessage executor not set');
    }
    
    await this.postMessageExecutor(action.action, action.payload);
    return true;
  }

  setPostMessageExecutor(executor: (action: string, payload: any) => Promise<any>): void {
    this.postMessageExecutor = executor;
  }

  getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    const result = this.executedActions.get(actionId);
    if (!result) {
      const inAnyQueue = this.immediateActions.some(a => a.id === actionId) ||
                        this.viewerReadyActions.some(a => a.id === actionId) ||
                        this.documentLoadedActions.some(a => a.id === actionId) ||
                        this.pendingActions.some(a => a.id === actionId);
      
      return inAnyQueue ? 'pending' : 'not-found';
    }
    
    return result.success ? 'completed' : 'failed';
  }

  clearQueues(): void {
    this.immediateActions = [];
    this.viewerReadyActions = [];
    this.documentLoadedActions = [];
    this.pendingActions = [];
    this.executedActions.clear();
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueueManager: All queues cleared');
    }
  }

  getQueueStatus(): { immediateActions: number; viewerReadyActions: number; documentLoadedActions: number; pendingActions: number; executedActions: number } {
    return {
      immediateActions: this.immediateActions.length,
      viewerReadyActions: this.viewerReadyActions.length,
      documentLoadedActions: this.documentLoadedActions.length,
      pendingActions: this.pendingActions.length,
      executedActions: this.executedActions.size
    };
  }
} 