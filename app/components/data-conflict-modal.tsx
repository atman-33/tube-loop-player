import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

interface PlaylistItem {
  id: string;
  title?: string;
}

interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

interface UserPlaylistData {
  playlists: Playlist[];
  activePlaylistId: string;
  loopMode: 'all' | 'one';
  isShuffle: boolean;
}

interface DataConflictModalProps {
  isOpen: boolean;
  localData: UserPlaylistData | null;
  cloudData: UserPlaylistData | null;
  onResolve: (selectedData: UserPlaylistData | null, source: 'local' | 'cloud') => void;
  onCancel: () => void;
}

export function DataConflictModal({
  isOpen,
  localData,
  cloudData,
  onResolve,
  onCancel,
}: DataConflictModalProps) {
  const [selectedSource, setSelectedSource] = useState<'local' | 'cloud' | null>(null);

  const handleConfirm = () => {
    if (selectedSource) {
      const selectedData = selectedSource === 'local' ? localData : cloudData;
      onResolve(selectedData, selectedSource);
    }
  };

  const getDataSummary = (data: UserPlaylistData | null) => {
    if (!data || !data.playlists) {
      return { totalItems: 0, playlistNames: 'No data' };
    }
    const totalItems = data.playlists.reduce((sum, playlist) => sum + playlist.items.length, 0);
    const playlistNames = data.playlists.map(p => p.name).join(', ');
    return { totalItems, playlistNames };
  };

  const localSummary = getDataSummary(localData);
  const cloudSummary = getDataSummary(cloudData);

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Data Conflict Detected</DialogTitle>
          <DialogDescription>
            Both your device and cloud have playlist data. Please choose which data to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedSource === 'local'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setSelectedSource('local')}
          >
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                checked={selectedSource === 'local'}
                onChange={() => setSelectedSource('local')}
                className="text-blue-600"
              />
              <h3 className="font-semibold">Use This Device's Data</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Playlists: {localSummary.playlistNames}</p>
              <p>Total items: {localSummary.totalItems}</p>
              <p>Loop mode: {localData?.loopMode || 'Unknown'}, Shuffle: {localData?.isShuffle ? 'On' : 'Off'}</p>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedSource === 'cloud'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => setSelectedSource('cloud')}
          >
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                checked={selectedSource === 'cloud'}
                onChange={() => setSelectedSource('cloud')}
                className="text-blue-600"
              />
              <h3 className="font-semibold">Use Cloud Data</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Playlists: {cloudSummary.playlistNames}</p>
              <p>Total items: {cloudSummary.totalItems}</p>
              <p>Loop mode: {cloudData?.loopMode || 'Unknown'}, Shuffle: {cloudData?.isShuffle ? 'On' : 'Off'}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedSource}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}