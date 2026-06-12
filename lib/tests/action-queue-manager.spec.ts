import { describe, it, expect, vi } from "vitest";
import { ActionQueueManager } from "../src/managers/ActionQueueManager";
import { ViewerAction } from "../src/interfaces/ViewerTypes";

function makeAction(overrides: Partial<ViewerAction> = {}): ViewerAction {
  return {
    id: overrides.id ?? `test-${Math.random().toString(36).slice(2)}`,
    action: overrides.action ?? "set-zoom",
    payload: overrides.payload ?? "auto",
    ...overrides,
  };
}

describe("ActionQueueManager", () => {
  it("executes immediately via the postMessage executor and resolves success", async () => {
    const mgr = new ActionQueueManager();
    const executor = vi.fn().mockResolvedValue({ success: true });
    mgr.setPostMessageExecutor(executor);

    const result = await mgr.executeAction(makeAction({ id: "a1" }));

    expect(executor).toHaveBeenCalledOnce();
    expect(result.success).toBe(true);
    expect(result.actionId).toBe("a1");
  });

  it("threads response data through to the result (query actions)", async () => {
    const mgr = new ActionQueueManager();
    mgr.setPostMessageExecutor(async () => ({
      success: true,
      data: { total: 42 },
    }));

    const result = await mgr.executeAction(makeAction({ action: "search" }));

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ total: 42 });
  });

  it("omits data when the response carries none (plain actions)", async () => {
    const mgr = new ActionQueueManager();
    mgr.setPostMessageExecutor(async () => ({ success: true, payload: "x" }));

    const result = await mgr.executeAction(makeAction());

    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it("reports executor failures without throwing", async () => {
    const mgr = new ActionQueueManager();
    mgr.setPostMessageExecutor(async () => {
      throw new Error("iframe exploded");
    });

    const result = await mgr.executeAction(makeAction({ id: "boom" }));

    expect(result.success).toBe(false);
    expect(result.error).toContain("iframe exploded");
    expect(mgr.getActionStatus("boom")).toBe("failed");
  });

  it("holds queued actions below their readiness level and releases them at it", () => {
    const mgr = new ActionQueueManager();
    const executed: string[] = [];
    mgr.setPostMessageExecutor(async (a) => {
      executed.push(a.action);
      return { success: true };
    });

    mgr.queueAction(makeAction({ action: "needs-3" }), 3);
    mgr.queueAction(makeAction({ action: "needs-4" }), 4);

    mgr.updateReadiness(3);
    mgr.processQueuedActions();
    expect(executed).toEqual(["needs-3"]);

    mgr.updateReadiness(4);
    mgr.processQueuedActions();
    expect(executed).toEqual(["needs-3", "needs-4"]);
  });

  it("gates level-5 actions on document load in addition to readiness", () => {
    const mgr = new ActionQueueManager();
    const executed: string[] = [];
    mgr.setPostMessageExecutor(async (a) => {
      executed.push(a.action);
      return { success: true };
    });

    mgr.queueAction(makeAction({ action: "set-page" }), 5);
    mgr.updateReadiness(5);
    mgr.processQueuedActions();
    expect(executed).toEqual([]); // readiness alone is not enough

    mgr.onDocumentLoaded();
    expect(executed).toEqual(["set-page"]);
  });

  it("settles queued callers' promises with success:false when the queue is cleared", async () => {
    const mgr = new ActionQueueManager();
    const action = makeAction({ id: "doomed" });
    const settled = new Promise((resolve) => {
      action.resolver = resolve;
    });
    mgr.queueAction(action, 5);

    mgr.clearQueues();

    await expect(settled).resolves.toMatchObject({
      success: false,
      actionId: "doomed",
    });
    expect(mgr.getQueueStatus().queuedActions).toBe(0);
  });

  it("does not settle the caller's promise on a requeued transient failure", async () => {
    const mgr = new ActionQueueManager();
    const resolver = vi.fn();
    const action = makeAction({ id: "retry", requeued: true });
    action.resolver = resolver;
    mgr.setPostMessageExecutor(async () => {
      throw new Error("Iframe not available");
    });

    await mgr.executeAction(action);

    expect(resolver).not.toHaveBeenCalled();
    expect(action.requeued).toBe(false); // flag consumed for the next attempt
  });

  it("bounds executed-action history at 100 entries", async () => {
    const mgr = new ActionQueueManager();
    mgr.setPostMessageExecutor(async () => ({ success: true }));

    for (let i = 0; i < 105; i++) {
      await mgr.executeAction(makeAction({ id: `a${i}` }));
    }

    expect(mgr.getQueueStatus().executedActions).toBe(100);
    expect(mgr.getActionStatus("a0")).toBe("not-found"); // evicted
    expect(mgr.getActionStatus("a104")).toBe("completed");
  });

  it("reset clears document-loaded state and readiness", () => {
    const mgr = new ActionQueueManager();
    mgr.updateReadiness(5);
    mgr.onDocumentLoaded();

    mgr.reset();

    const executed: string[] = [];
    mgr.setPostMessageExecutor(async (a) => {
      executed.push(a.action);
      return { success: true };
    });
    mgr.queueAction(makeAction(), 3);
    mgr.processQueuedActions(); // readiness back to 0 - must not run
    expect(executed).toEqual([]);
  });
});
