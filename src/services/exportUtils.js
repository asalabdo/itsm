const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const downloadCsv = (rows, filename, headers = null) => {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const csvRows = [];

  if (Array.isArray(headers) && headers.length > 0) {
    csvRows.push(headers.map(escapeCsvValue).join(','));
  }

  normalizedRows.forEach((row) => {
    if (Array.isArray(row)) {
      csvRows.push(row.map(escapeCsvValue).join(','));
      return;
    }

    if (row && typeof row === 'object') {
      csvRows.push(Object.values(row).map(escapeCsvValue).join(','));
    }
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadText = (content, filename, mimeType = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
