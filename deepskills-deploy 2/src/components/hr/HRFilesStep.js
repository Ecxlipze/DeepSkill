import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  display: grid;
  gap: 18px;
`;

const Card = styled.div`
  background: #111318;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.06);
  color: #fff;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 10px;
  color: #fff;
  background: ${({ $secondary }) => ($secondary ? 'transparent' : '#4F8EF7')};
  border: 1px solid ${({ $secondary }) => ($secondary ? 'rgba(255,255,255,0.14)' : '#4F8EF7')};
  text-decoration: none;
  cursor: pointer;
`;

const ShareButton = styled.button`
  padding: 11px 16px;
  border-radius: 10px;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  cursor: pointer;
`;

const formatBytes = (value) => {
  if (!value) return 'PDF';
  const size = Number(value);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const labels = {
  acceptance_letter: 'Acceptance Letter',
  hiring_file: 'Hiring File'
};

const HRFilesStep = ({ files, loading, onShare }) => {
  if (!files.length) {
    return (
      <Card>
        <h2>Awaiting Final HR Documents</h2>
        <p>Your documents will appear here once the HR team finalizes your hiring package.</p>
      </Card>
    );
  }

  return (
    <Wrap>
      {files.map((file) => (
        <Card key={file.id}>
          <h3>{labels[file.file_type] || file.file_type}</h3>
          <p>{file.file_name || 'Generated PDF'} • {formatBytes(file.file_size)}</p>
          <Actions>
            <Button href={file.file_url} target="_blank" rel="noreferrer">Download PDF</Button>
            <ShareButton type="button" onClick={onShare} disabled={loading}>
              {loading ? 'Sharing...' : 'Share via Email'}
            </ShareButton>
          </Actions>
        </Card>
      ))}
    </Wrap>
  );
};

export default HRFilesStep;
