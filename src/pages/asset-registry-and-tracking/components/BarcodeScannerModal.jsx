import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'

  if (!isOpen) return null;

  const handleScan = () => {
    if (manualInput?.trim()) {
      onScan(manualInput?.trim());
      setManualInput('');
      onClose();
    }
  };

  const handleCameraScan = () => {
    // Simulate camera scan
    const mockBarcode = `BC${Math.floor(Math.random() * 1000000)}`;
    onScan(mockBarcode);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1300"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-1400 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-elevation-5 w-full max-w-md transition-smooth">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Scan Asset Barcode</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
              aria-label="Close scanner"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <Button
                variant={scanMode === 'camera' ? 'default' : 'outline'}
                fullWidth
                iconName="Camera"
                iconPosition="left"
                onClick={() => setScanMode('camera')}
              >
                Camera Scan
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'default' : 'outline'}
                fullWidth
                iconName="Keyboard"
                iconPosition="left"
                onClick={() => setScanMode('manual')}
              >
                Manual Entry
              </Button>
            </div>

            {scanMode === 'camera' ? (
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <Icon name="Camera" size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Position barcode within frame
                    </p>
                    <div className="w-48 h-48 mx-auto border-4 border-primary rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                  </div>
                </div>
                <Button
                  variant="default"
                  fullWidth
                  iconName="Scan"
                  iconPosition="left"
                  onClick={handleCameraScan}
                >
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Barcode / Serial Number"
                  type="text"
                  placeholder="Enter barcode or serial number"
                  value={manualInput}
                  onChange={(e) => setManualInput(e?.target?.value)}
                  onKeyPress={(e) => e?.key === 'Enter' && handleScan()}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    fullWidth
                    iconName="Search"
                    iconPosition="left"
                    onClick={handleScan}
                    disabled={!manualInput?.trim()}
                  >
                    Search Asset
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Scanning Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure good lighting for camera scan</li>
                    <li>Hold device steady and parallel to barcode</li>
                    <li>Clean barcode surface if scan fails</li>
                    <li>Use manual entry for damaged barcodes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarcodeScannerModal;