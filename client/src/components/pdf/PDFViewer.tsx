import React from 'react';

interface PDFViewerProps {
  src: string;
  width?: string;
  height?: string;
}

// Placeholder komponent inntil den riktige blir implementert
const PDFViewer: React.FC<PDFViewerProps> = ({ src, width = '100%', height = '600px' }) => {
  return (
    <div className="bg-white px-2 py-1 rounded-lg shadow">
      <div className="border border-gray-300 rounded" style={{ width, height }}>
        <iframe
          src={src}
          width="100%"
          height="100%"
          title="PDF Viewer"
          className="rounded"
        />
      </div>
    </div>
  );
};

export default PDFViewer; 