// Property transformation utilities
export class PropertyTransformers {
  static transformZoom = {
    toViewer: (zoom: string): string => {
      if (!zoom) return 'auto';
      
      // Convert common zoom values to PDF.js format
      const zoomMappings: { [key: string]: string } = {
        'auto': 'auto',
        'page-fit': 'page-fit',
        'page-width': 'page-width', 
        'page-actual': 'page-actual'
      };
      
      return zoomMappings[zoom.toLowerCase()] || zoom;
    },
    
    fromViewer: (viewerZoom: any): string => {
      if (typeof viewerZoom === 'string') return viewerZoom;
      if (typeof viewerZoom === 'number') {
        // Convert numeric zoom to string without % to avoid feedback loop
        // PDF.js accepts numeric strings like "1.25" directly
        return viewerZoom.toString();
      }
      return 'auto';
    }
  };

  static transformRotation = {
    toViewer: (rotation: number): number => {
      // Normalize rotation to 0, 90, 180, 270
      return ((rotation % 360) + 360) % 360;
    },
    
    fromViewer: (viewerRotation: any): number => {
      return typeof viewerRotation === 'number' ? viewerRotation : 0;
    }
  };

  static transformCursor = {
    toViewer: (cursor: string): string => {
      if (!cursor) return 'select';
      
      const cursorMappings: { [key: string]: string } = {
        'select': 'select',
        'hand': 'hand',
        'zoom': 'zoom'
      };
      
      return cursorMappings[cursor.toLowerCase()] || 'select';
    },
    
    fromViewer: (viewerCursor: any): string => {
      return typeof viewerCursor === 'string' ? viewerCursor : 'select';
    }
  };

  static transformScroll = {
    toViewer: (scroll: string): string => {
      if (!scroll) return 'vertical';
      
      const scrollMappings: { [key: string]: string } = {
        'vertical': 'vertical',
        'horizontal': 'horizontal', 
        'wrapped': 'wrapped',
        'page': 'page'
      };
      
      return scrollMappings[scroll.toLowerCase()] || 'vertical';
    },
    
    fromViewer: (viewerScroll: any): string => {
      const scrollModes = ['vertical', 'horizontal', 'wrapped', 'page'];
      if (typeof viewerScroll === 'number') {
        return scrollModes[viewerScroll] || 'vertical';
      }
      return typeof viewerScroll === 'string' ? viewerScroll : 'vertical';
    }
  };

  static transformSpread = {
    toViewer: (spread: string): string => {
      if (!spread) return 'none';
      
      const spreadMappings: { [key: string]: string } = {
        'none': 'none',
        'odd': 'odd',
        'even': 'even'
      };
      
      return spreadMappings[spread.toLowerCase()] || 'none';
    },
    
    fromViewer: (viewerSpread: any): string => {
      const spreadModes = ['none', 'odd', 'even'];
      if (typeof viewerSpread === 'number') {
        return spreadModes[viewerSpread] || 'none';
      }
      return typeof viewerSpread === 'string' ? viewerSpread : 'none';
    }
  };

  static transformPageMode = {
    toViewer: (pageMode: string): string => {
      if (!pageMode) return 'none';
      
      const pageModeMapping: { [key: string]: string } = {
        'none': 'none',
        'thumbs': 'thumbs',
        'bookmarks': 'bookmarks', 
        'attachments': 'attachments'
      };
      
      return pageModeMapping[pageMode.toLowerCase()] || 'none';
    },
    
    fromViewer: (viewerPageMode: any): string => {
      return typeof viewerPageMode === 'string' ? viewerPageMode : 'none';
    }
  };
} 