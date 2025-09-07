// Change origin tracking for two-way binding circular update prevention
export class ChangeOriginTracker {
  private userInitiatedChanges = new Set<string>();
  private programmaticChanges = new Set<string>();

  markUserInitiated(property: string): void {
    this.userInitiatedChanges.add(property);
    setTimeout(() => this.userInitiatedChanges.delete(property), 0);
  }

  markProgrammatic(property: string): void {
    this.programmaticChanges.add(property);
    setTimeout(() => this.programmaticChanges.delete(property), 0);
  }

  isUserInitiated(property: string): boolean {
    return this.userInitiatedChanges.has(property);
  }

  isProgrammatic(property: string): boolean {
    return this.programmaticChanges.has(property);
  }
}
