import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileAttachments = ({ attachments, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const files = Array.from(e?.dataTransfer?.files);
    onUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    onUpload(files);
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('video')) return 'Video';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
    return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Attachments</h3>
          <span className="text-xs md:text-sm text-muted-foreground caption">
            {attachments?.length} files
          </span>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-smooth ${
            isDragging
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Upload" size={24} color="var(--color-primary)" />
          </div>
          <p className="text-sm md:text-base font-medium text-foreground mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mb-4 caption">
            Support for images, documents, and videos up to 10MB
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              size="sm"
              iconName="Paperclip"
              iconPosition="left"
              asChild
            >
              <span>Choose Files</span>
            </Button>
          </label>
        </div>

        {attachments?.length > 0 && (
          <div className="mt-4 md:mt-6 space-y-2">
            {attachments?.map((file) => (
              <div
                key={file?.id}
                className="flex items-center gap-3 p-3 md:p-4 bg-muted rounded-lg hover:bg-muted/80 transition-smooth"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-background flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={getFileIcon(file?.type)}
                    size={20}
                    color="var(--color-primary)"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-foreground truncate">
                    {file?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs md:text-sm text-muted-foreground caption">
                      {formatFileSize(file?.size)}
                    </span>
                    <span className="text-xs text-muted-foreground caption">•</span>
                    <span className="text-xs md:text-sm text-muted-foreground caption">
                      {file?.uploadedBy}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-background rounded transition-smooth">
                    <Icon name="Download" size={18} color="var(--color-muted-foreground)" />
                  </button>
                  <button className="p-2 hover:bg-background rounded transition-smooth">
                    <Icon name="Trash2" size={18} color="var(--color-error)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAttachments;