import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

/**
 * QRCodeDisplay renders a QR code for the provided URL and offers a download button.
 * The URL should point to the production deployment of the SmartBite web app.
 */
export const QRCodeDisplay = ({ url }) => {
  const svgRef = useRef(null);

  const downloadQR = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = 'smartbite-qr.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlBlob);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">SmartBite QR Code</h2>
      <QRCodeSVG
        value={url}
        size={200}
        level="H"
        includeMargin={false}
        ref={svgRef}
        bgColor="#ffffff"
        fgColor="#000000"
        // eslint-disable-next-line react/jsx-no-undef
      />
      <button
        onClick={downloadQR}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Download SVG
      </button>
    </div>
  );
};

