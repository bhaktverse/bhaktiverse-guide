import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  currentFile: string | null;
}

export const useDownload = () => {
  const { toast } = useToast();
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    currentFile: null
  });

  const downloadFile = async (url: string, filename: string): Promise<boolean> => {
    if (!url) {
      toast({
        title: "Download Failed",
        description: "No file URL available",
        variant: "destructive",
      });
      return false;
    }

    try {
      setDownloadState({
        isDownloading: true,
        progress: 0,
        currentFile: filename
      });

      // Fetch the file with progress tracking
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        if (total > 0) {
          const progress = Math.round((received / total) * 100);
          setDownloadState(prev => ({ ...prev, progress }));
        }
      }

      // Combine chunks and create blob
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const blob = new Blob([combined]);
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "✅ Download Complete",
        description: `"${filename}" has been downloaded successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setDownloadState({
        isDownloading: false,
        progress: 0,
        currentFile: null
      });
    }
  };

  const downloadAudio = async (
    audioUrl: string, 
    title: string, 
    artist?: string
  ): Promise<boolean> => {
    const safeName = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const filename = artist 
      ? `${safeName} - ${artist}.mp3`
      : `${safeName}.mp3`;
    
    return downloadFile(audioUrl, filename);
  };

  return {
    downloadFile,
    downloadAudio,
    downloadState
  };
};

export default useDownload;
