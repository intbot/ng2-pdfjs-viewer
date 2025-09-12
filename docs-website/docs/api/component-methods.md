# Component Methods

Complete reference for all ng2-pdfjs-viewer component public methods.

## Core Methods

### `triggerDownload()`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Triggers PDF download
- **Returns**: Promise with execution result

```typescript
async downloadPdf() {
  try {
    const result = await this.pdfViewer.triggerDownload();
    console.log('Download triggered successfully:', result);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
```

### `triggerPrint()`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Triggers PDF print dialog
- **Returns**: Promise with execution result

```typescript
async printPdf() {
  try {
    const result = await this.pdfViewer.triggerPrint();
    console.log('Print triggered successfully:', result);
  } catch (error) {
    console.error('Print failed:', error);
  }
}
```

### `setPage(page: number)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Navigate to specific page
- **Parameters**: `page` - Page number (1-based)
- **Returns**: Promise with execution result

```typescript
async goToPage(pageNumber: number) {
  try {
    const result = await this.pdfViewer.setPage(pageNumber);
    console.log(`Navigated to page ${pageNumber}:`, result);
  } catch (error) {
    console.error('Navigation failed:', error);
  }
}
```

### `goToPage(page: number)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Alias for `setPage()` for backward compatibility
- **Parameters**: `page` - Page number (1-based)
- **Returns**: Promise with execution result

```typescript
async navigateToPage(pageNumber: number) {
  try {
    const result = await this.pdfViewer.goToPage(pageNumber);
    console.log(`Navigated to page ${pageNumber}:`, result);
  } catch (error) {
    console.error('Navigation failed:', error);
  }
}
```

### `setZoom(zoom: string)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Set zoom level
- **Parameters**: `zoom` - Zoom level ('auto', 'page-width', 'page-height', 'page-fit', 'actual', or percentage like '150%')
- **Returns**: Promise with execution result

```typescript
async changeZoom(zoomLevel: string) {
  try {
    const result = await this.pdfViewer.setZoom(zoomLevel);
    console.log(`Zoom changed to ${zoomLevel}:`, result);
  } catch (error) {
    console.error('Zoom change failed:', error);
  }
}
```

### `goToLastPage()`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Navigate to the last page
- **Returns**: Promise with execution result

```typescript
async goToEnd() {
  try {
    const result = await this.pdfViewer.goToLastPage();
    console.log('Navigated to last page:', result);
  } catch (error) {
    console.error('Navigation to last page failed:', error);
  }
}
```

### `setCursor(cursor: string)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Set cursor mode
- **Parameters**: `cursor` - Cursor mode ('grab', 'grabbing', 'text', 'crosshair', etc.)
- **Returns**: Promise with execution result

```typescript
async changeCursor(cursorMode: string) {
  try {
    const result = await this.pdfViewer.setCursor(cursorMode);
    console.log(`Cursor changed to ${cursorMode}:`, result);
  } catch (error) {
    console.error('Cursor change failed:', error);
  }
}
```

### `setScroll(scroll: string)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Set scroll mode
- **Parameters**: `scroll` - Scroll mode ('vertical', 'horizontal', 'wrapped', 'page')
- **Returns**: Promise with execution result

```typescript
async changeScroll(scrollMode: string) {
  try {
    const result = await this.pdfViewer.setScroll(scrollMode);
    console.log(`Scroll changed to ${scrollMode}:`, result);
  } catch (error) {
    console.error('Scroll change failed:', error);
  }
}
```

### `setSpread(spread: string)`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Set spread mode
- **Parameters**: `spread` - Spread mode ('none', 'odd', 'even')
- **Returns**: Promise with execution result

```typescript
async changeSpread(spreadMode: string) {
  try {
    const result = await this.pdfViewer.setSpread(spreadMode);
    console.log(`Spread changed to ${spreadMode}:`, result);
  } catch (error) {
    console.error('Spread change failed:', error);
  }
}
```

### `triggerRotation(direction: 'cw' | 'ccw')`
- **Type**: `Promise<ActionExecutionResult>`
- **Description**: Rotate the document
- **Parameters**: `direction` - Rotation direction ('cw' for clockwise, 'ccw' for counter-clockwise)
- **Returns**: Promise with execution result

```typescript
async rotateDocument(direction: 'cw' | 'ccw') {
  try {
    const result = await this.pdfViewer.triggerRotation(direction);
    console.log(`Document rotated ${direction}:`, result);
  } catch (error) {
    console.error('Rotation failed:', error);
  }
}
```

## Utility Methods

### `refresh()`
- **Type**: `void`
- **Description**: Refresh the viewer (useful for external window or when PDF needs to be reloaded)

```typescript
refreshViewer() {
  this.pdfViewer.refresh();
  console.log('Viewer refreshed');
}
```

### `sendViewerControlMessage(action: string, payload: any)`
- **Type**: `Promise<any>`
- **Description**: Send custom control message to the PDF viewer
- **Parameters**: 
  - `action` - Action name
  - `payload` - Action payload
- **Returns**: Promise with response

```typescript
async sendCustomMessage(action: string, data: any) {
  try {
    const response = await this.pdfViewer.sendViewerControlMessage(action, data);
    console.log('Custom message sent:', response);
    return response;
  } catch (error) {
    console.error('Custom message failed:', error);
  }
}
```

## Queue Management Methods

### `getActionStatus(actionId: string)`
- **Type**: `'pending' | 'executing' | 'completed' | 'failed' | 'not-found'`
- **Description**: Get the status of a specific action
- **Parameters**: `actionId` - Action identifier
- **Returns**: Action status

```typescript
checkActionStatus(actionId: string) {
  const status = this.pdfViewer.getActionStatus(actionId);
  console.log(`Action ${actionId} status:`, status);
  return status;
}
```

### `getQueueStatus()`
- **Type**: `{ queuedActions: number; executedActions: number }`
- **Description**: Get current queue status
- **Returns**: Object with queue statistics

```typescript
getQueueInfo() {
  const status = this.pdfViewer.getQueueStatus();
  console.log(`Queue status - Queued: ${status.queuedActions}, Executed: ${status.executedActions}`);
  return status;
}
```

### `clearActionQueue()`
- **Type**: `void`
- **Description**: Clear all queued actions

```typescript
clearQueue() {
  this.pdfViewer.clearActionQueue();
  console.log('Action queue cleared');
}
```

## Template Methods

### `getErrorTemplateData()`
- **Type**: `any`
- **Description**: Get data for error template context
- **Returns**: Error template data object

```typescript
getErrorData() {
  const errorData = this.pdfViewer.getErrorTemplateData();
  console.log('Error template data:', errorData);
  return errorData;
}
```

### `reloadViewer()`
- **Type**: `void`
- **Description**: Reload the viewer (alias for refresh)

```typescript
reload() {
  this.pdfViewer.reloadViewer();
  console.log('Viewer reloaded');
}
```

### `goBack()`
- **Type**: `void`
- **Description**: Go back in browser history

```typescript
navigateBack() {
  this.pdfViewer.goBack();
  console.log('Navigated back');
}
```

### `closeViewer()`
- **Type**: `void`
- **Description**: Close the viewer window

```typescript
close() {
  this.pdfViewer.closeViewer();
  console.log('Viewer closed');
}
```

## Complete Usage Example

```typescript
export class PdfViewerComponent {
  @ViewChild('pdfViewer') pdfViewer: any;

  // Core functionality
  async downloadPdf() {
    try {
      const result = await this.pdfViewer.triggerDownload();
      console.log('Download successful:', result);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  async printPdf() {
    try {
      const result = await this.pdfViewer.triggerPrint();
      console.log('Print successful:', result);
    } catch (error) {
      console.error('Print failed:', error);
    }
  }

  async navigateToPage(pageNumber: number) {
    try {
      const result = await this.pdfViewer.setPage(pageNumber);
      console.log(`Navigated to page ${pageNumber}:`, result);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  async changeZoom(zoomLevel: string) {
    try {
      const result = await this.pdfViewer.setZoom(zoomLevel);
      console.log(`Zoom changed to ${zoomLevel}:`, result);
    } catch (error) {
      console.error('Zoom change failed:', error);
    }
  }

  async rotateDocument(direction: 'cw' | 'ccw') {
    try {
      const result = await this.pdfViewer.triggerRotation(direction);
      console.log(`Document rotated ${direction}:`, result);
    } catch (error) {
      console.error('Rotation failed:', error);
    }
  }

  // Utility functions
  refreshViewer() {
    this.pdfViewer.refresh();
  }

  async sendCustomMessage(action: string, data: any) {
    try {
      const response = await this.pdfViewer.sendViewerControlMessage(action, data);
      return response;
    } catch (error) {
      console.error('Custom message failed:', error);
    }
  }

  // Queue management
  getQueueInfo() {
    const status = this.pdfViewer.getQueueStatus();
    console.log(`Queue: ${status.queuedActions} queued, ${status.executedActions} executed`);
    return status;
  }

  clearQueue() {
    this.pdfViewer.clearActionQueue();
  }
}
```

```html
<ng2-pdfjs-viewer
  #pdfViewer
  pdfSrc="assets/sample.pdf"
  (onDocumentLoad)="onDocumentLoad()"
  (onPageChange)="onPageChange($event)">
</ng2-pdfjs-viewer>

<!-- Control buttons -->
<div class="controls">
  <button (click)="downloadPdf()">Download</button>
  <button (click)="printPdf()">Print</button>
  <button (click)="navigateToPage(5)">Go to Page 5</button>
  <button (click)="changeZoom('150%')">Zoom 150%</button>
  <button (click)="rotateDocument('cw')">Rotate CW</button>
  <button (click)="refreshViewer()">Refresh</button>
  <button (click)="clearQueue()">Clear Queue</button>
</div>
```

## Method Categories

### Essential Methods
Methods you'll most commonly use:
- `triggerDownload()` - Download PDF
- `triggerPrint()` - Print PDF
- `setPage()` - Navigate pages
- `setZoom()` - Change zoom

### Navigation Methods
Methods for document navigation:
- `goToPage()` - Go to specific page
- `goToLastPage()` - Go to last page
- `triggerRotation()` - Rotate document

### View Methods
Methods for view customization:
- `setCursor()` - Change cursor mode
- `setScroll()` - Change scroll mode
- `setSpread()` - Change spread mode

### Utility Methods
Methods for advanced functionality:
- `refresh()` - Refresh viewer
- `sendViewerControlMessage()` - Send custom messages
- `getActionStatus()` - Check action status
- `getQueueStatus()` - Get queue info
- `clearActionQueue()` - Clear queue

## Next Steps

- ⚙️ [**Component Inputs**](./component-inputs) - Configuration options
- 📤 [**Component Outputs**](./component-outputs) - Event handling
- 📚 [**Examples**](../examples/basic-usage) - Practical examples
- 🚀 [**Getting Started**](../getting-started) - Quick setup guide
