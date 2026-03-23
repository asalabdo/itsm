import React, { useRef, useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';


const WorkflowCanvas = ({ blocks, selectedBlock, onBlockSelect, onBlockUpdate, onBlockDelete }) => {
  const canvasRef = useRef(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, block) => {
    if (e?.target?.closest('.block-action-button')) return;
    
    const rect = e?.currentTarget?.getBoundingClientRect();
    setDragOffset({
      x: e?.clientX - rect?.left,
      y: e?.clientY - rect?.top,
    });
    setDraggedBlock(block);
    onBlockSelect(block);
  };

  const handleMouseMove = (e) => {
    if (!draggedBlock || !canvasRef?.current) return;

    const canvasRect = canvasRef?.current?.getBoundingClientRect();
    const newX = e?.clientX - canvasRect?.left - dragOffset?.x;
    const newY = e?.clientY - canvasRect?.top - dragOffset?.y;

    onBlockUpdate(draggedBlock?.id, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) },
    });
  };

  const handleMouseUp = () => {
    setDraggedBlock(null);
  };

  React.useEffect(() => {
    if (draggedBlock) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedBlock, dragOffset]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'triggers':
        return 'var(--color-primary)';
      case 'conditions':
        return 'var(--color-warning)';
      case 'actions':
        return 'var(--color-success)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const renderConnections = () => {
    return blocks?.map((block, index) => {
      if (index === blocks?.length - 1) return null;
      
      const nextBlock = blocks?.[index + 1];
      const startX = block?.position?.x + 140;
      const startY = block?.position?.y + 40;
      const endX = nextBlock?.position?.x + 140;
      const endY = nextBlock?.position?.y + 40;
      
      const midY = (startY + endY) / 2;

      return (
        <g key={`connection-${block?.id}`}>
          <path
            d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
            stroke="var(--color-border)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <circle cx={endX} cy={endY} r="4" fill="var(--color-primary)" />
        </g>
      );
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 h-[calc(100vh-24rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Workflow Canvas</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>Drag blocks to reposition</span>
        </div>
      </div>
      <div
        ref={canvasRef}
        className="relative w-full h-[calc(100%-3rem)] bg-background rounded-lg border-2 border-dashed border-border overflow-auto"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {blocks?.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Workflow" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">Drag components from the library to start building</p>
            </div>
          </div>
        ) : (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections()}
          </svg>
        )}

        {blocks?.map((block) => (
          <div
            key={block?.id}
            className={`absolute cursor-move transition-shadow ${
              selectedBlock?.id === block?.id
                ? 'ring-2 ring-primary shadow-elevation-3'
                : 'shadow-elevation-1 hover:shadow-elevation-2'
            }`}
            style={{
              left: `${block?.position?.x}px`,
              top: `${block?.position?.y}px`,
              width: '280px',
            }}
            onMouseDown={(e) => handleMouseDown(e, block)}
          >
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Block Header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: `${getCategoryColor(block?.category)}15` }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${block?.color}25` }}
                >
                  <Icon name={block?.icon} size={16} color={block?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{block?.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{block?.category}</p>
                </div>
                <button
                  className="block-action-button p-1 rounded hover:bg-destructive/10 transition-smooth"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onBlockDelete(block?.id);
                  }}
                >
                  <Icon name="X" size={14} color="var(--color-destructive)" />
                </button>
              </div>

              {/* Block Content */}
              <div className="px-4 py-3 bg-card">
                <p className="text-xs text-muted-foreground mb-2">{block?.description}</p>
                {Object.keys(block?.config || {})?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-foreground mb-1">Configuration:</p>
                    <div className="space-y-1">
                      {Object.entries(block?.config)?.map(([key, value]) => (
                        <div key={key} className="text-xs text-muted-foreground">
                          <span className="font-medium">{key}:</span> {value?.toString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowCanvas;