import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';

const WorkflowCanvas = ({ nodes, connections, onNodeAdd, onNodeSelect, onNodeUpdate, onConnectionAdd, selectedNode }) => {
  const { language } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  const handleWheel = (e) => {
    e?.preventDefault();
    const delta = e?.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(0.25, zoom * delta), 2);
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (e?.target === canvasRef?.current) {
      setIsDragging(true);
      setDragStart({ x: e?.clientX - pan?.x, y: e?.clientY - pan?.y });
    }
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e?.clientX, y: e?.clientY });
    
    if (isDragging) {
      setPan({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    const data = JSON.parse(e?.dataTransfer?.getData('application/json'));
    const rect = canvasRef?.current?.getBoundingClientRect();
    const x = (e?.clientX - rect?.left - pan?.x) / zoom;
    const y = (e?.clientY - rect?.top - pan?.y) / zoom;
    
    onNodeAdd({
      ...data,
      id: `node-${Date.now()}`,
      position: { x, y }
    });
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleNodeClick = (node) => {
    onNodeSelect(node);
  };

  const handleConnectionStart = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const handleConnectionEnd = (targetNodeId) => {
    if (connectionStart && connectionStart !== targetNodeId) {
      onConnectionAdd({
        id: `conn-${Date.now()}`,
        source: connectionStart,
        target: targetNodeId
      });
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      canvas?.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas?.removeEventListener('wheel', handleWheel);
    }
  }, [zoom]);

  return (
    <div className="relative flex-1 bg-background overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-card border border-border rounded-md shadow-elevation-2 p-2 flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom * 1.2, 2))}
            className="p-2 rounded hover:bg-muted transition-smooth press-scale focus-ring"
            title={text('تكبير', 'Zoom in')}
          >
            <Icon name="ZoomIn" size={18} />
          </button>
          <span className="text-sm font-medium px-2 min-w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.max(zoom * 0.8, 0.25))}
            className="p-2 rounded hover:bg-muted transition-smooth press-scale focus-ring"
            title={text('تصغير', 'Zoom out')}
          >
            <Icon name="ZoomOut" size={18} />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={resetView}
            className="p-2 rounded hover:bg-muted transition-smooth press-scale focus-ring"
            title={text('إعادة العرض', 'Reset view')}
          >
            <Icon name="Maximize2" size={18} />
          </button>
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`bg-card border border-border rounded-md shadow-elevation-2 p-2 hover:bg-muted transition-smooth press-scale focus-ring ${
            showGrid ? 'text-primary' : ''
          }`}
          title={text('إظهار/إخفاء الشبكة', 'Toggle grid')}
        >
          <Icon name="Grid3x3" size={18} />
        </button>
      </div>
      <div className="absolute top-4 right-4 z-10 bg-card border border-border rounded-md shadow-elevation-2 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Icon name="Info" size={14} />
          <span className="font-medium">{text('الاختصارات', 'Shortcuts')}</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{text('التحريك', 'Pan')}:</span>
            <span className="font-medium">{text('نقر + سحب', 'Click + Drag')}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{text('التكبير', 'Zoom')}:</span>
            <span className="font-medium">{text('عجلة الماوس', 'Mouse Wheel')}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{text('الحذف', 'Delete')}:</span>
            <span className="font-medium">{text('Del / Backspace', 'Del / Backspace')}</span>
          </div>
        </div>
      </div>
      <div
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          backgroundImage: showGrid
            ? `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan?.x}px ${pan?.y}px`
        }}
      >
        <div
          style={{
            transform: `translate(${pan?.x}px, ${pan?.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {connections?.map(conn => {
              const sourceNode = nodes?.find(n => n?.id === conn?.source);
              const targetNode = nodes?.find(n => n?.id === conn?.target);
              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode?.position?.x + 80;
              const y1 = sourceNode?.position?.y + 40;
              const x2 = targetNode?.position?.x + 80;
              const y2 = targetNode?.position?.y + 40;

              return (
                <g key={conn?.id}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}
            {isConnecting && connectionStart && (
              <path
                d={`M ${nodes?.find(n => n?.id === connectionStart)?.position?.x + 80} ${
                  nodes?.find(n => n?.id === connectionStart)?.position?.y + 40
                } L ${(mousePosition?.x - canvasRef?.current?.getBoundingClientRect()?.left - pan?.x) / zoom} ${
                  (mousePosition?.y - canvasRef?.current?.getBoundingClientRect()?.top - pan?.y) / zoom
                }`}
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            )}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="var(--color-primary)" />
              </marker>
            </defs>
          </svg>

          {nodes?.map(node => (
            <div
              key={node?.id}
              className={`absolute bg-card border-2 rounded-lg shadow-elevation-2 cursor-pointer transition-smooth hover:shadow-elevation-3 ${
                selectedNode?.id === node?.id ? 'border-primary' : 'border-border'
              }`}
              style={{
                left: node?.position?.x,
                top: node?.position?.y,
                width: '160px'
              }}
              onClick={() => handleNodeClick(node)}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={node?.color}>
                    <Icon name={node?.icon} size={20} />
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{node?.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{node?.description}</p>
              </div>
              
              <div className="flex justify-between px-2 pb-2">
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  handleConnectionStart(node?.id);
                }}
                className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-smooth"
                title={text('إنشاء اتصال', 'Create connection')}
              >
                <Icon name="Plus" size={14} className="text-primary" />
              </button>
                <button
                onClick={(e) => {
                  e?.stopPropagation();
                  handleConnectionEnd(node?.id);
                }}
                className="w-6 h-6 rounded-full bg-success/10 hover:bg-success/20 flex items-center justify-center transition-smooth"
                title={text('الاتصال هنا', 'Connect here')}
              >
                <Icon name="Check" size={14} className="text-success" />
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {nodes?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Icon name="Workflow" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{text('ابدأ بناء سير العمل', 'Start Building Your Workflow')}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {text('اسحب المكونات من اللوحة لإنشاء سير العمل.\nقم بربط العقد لتحديد تدفق العملية.', 'Drag components from the palette to create your workflow.\nConnect nodes to define the process flow.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvas;
