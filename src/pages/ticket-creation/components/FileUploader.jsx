import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploader = ({ attachments, onAttachmentsChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter((file) => {
      if (file?.size > maxFileSize) {
        alert(`File ${file?.name} exceeds 10MB limit`);
        return false;
      }
      if (!allowedTypes?.includes(file?.type)) {
        alert(`File ${file?.name} type not supported`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles?.map((file) => ({
      id: Date.now() + Math.random(),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      file: file,
      preview: file?.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    onAttachmentsChange([...attachments, ...newAttachments]);
  };

  const handleRemoveFile = (id) => {
    const updatedAttachments = attachments?.filter((att) => att?.id !== id);
    onAttachmentsChange(updatedAttachments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    if (type?.includes('word')) return 'FileText';
    return 'File';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Attachments
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-smooth ${
          isDragging
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedTypes?.join(',')}
        />
        
        <Icon
          name="Upload"
          size={40}
          className="mx-auto mb-3 text-muted-foreground"
        />
        <h4 className="font-medium text-foreground mb-1">
          Drop files here or click to browse
        </h4>
        <p className="text-sm text-muted-foreground mb-4 caption">
          Supports: Images, PDF, Word documents (Max 10MB per file)
        </p>
        <Button
          variant="outline"
          size="sm"
          iconName="Paperclip"
          iconPosition="left"
          onClick={() => fileInputRef?.current?.click()}
        >
          Choose Files
        </Button>
      </div>
      {attachments?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Attached Files ({attachments?.length})
          </p>
          <div className="space-y-2">
            {attachments?.map((attachment) => (
              <div
                key={attachment?.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
              >
                {attachment?.preview ? (
                  <img
                    src={attachment?.preview}
                    alt={`Preview of ${attachment?.name}`}
                    className="w-12 h-12 md:w-14 md:h-14 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={getFileIcon(attachment?.type)}
                      size={24}
                      color="var(--color-primary)"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-foreground truncate">
                    {attachment?.name}
                  </h5>
                  <p className="text-xs text-muted-foreground caption">
                    {formatFileSize(attachment?.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(attachment?.id)}
                  className="p-2 hover:bg-muted rounded transition-smooth"
                >
                  <Icon name="X" size={18} color="var(--color-error)" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;