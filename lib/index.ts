export * from './src/ng2-pdfjs-viewer.module';
export * from './src/ng2-pdfjs-viewer.component';

// Export types that are needed by consumer applications
export { 
  ChangedScale, 
  ChangedRotation,
  ControlVisibilityConfig,
  AutoActionConfig,
  ErrorConfig,
  ViewerConfig 
} from './src/interfaces/ViewerTypes';
