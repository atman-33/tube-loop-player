import { Cloud, Monitor, Plus, Minus, ArrowUpDown, FileEdit } from "lucide-react";
import { useState } from "react";
import type { DataDiff } from "~/lib/data-diff-calculator";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

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
  loopMode: "all" | "one";
  isShuffle: boolean;
}

interface DataConflictModalProps {
  isOpen: boolean;
  localData: UserPlaylistData | null;
  cloudData: UserPlaylistData | null;
  diff: DataDiff;
  onResolve: (
    selectedData: UserPlaylistData | null,
    source: "local" | "cloud",
  ) => void;
  onDecideLater: () => void;
}

export function DataConflictModal({
  isOpen,
  localData,
  cloudData,
  diff,
  onResolve,
  onDecideLater,
}: DataConflictModalProps) {
  const [selectedSource, setSelectedSource] = useState<"local" | "cloud" | null>(
    null,
  );

  const handleConfirm = () => {
    if (selectedSource) {
      const selectedData = selectedSource === "local" ? localData : cloudData;
      onResolve(selectedData, selectedSource);
    }
  };

  const hasChanges =
    diff.summary.playlistsAdded > 0 ||
    diff.summary.playlistsRemoved > 0 ||
    diff.summary.playlistsModified > 0 ||
    diff.summary.playlistsReordered > 0 ||
    diff.summary.songsAdded > 0 ||
    diff.summary.songsRemoved > 0 ||
    diff.summary.songsReordered > 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="flex flex-col h-[90vh] sm:h-[85vh] sm:max-w-[700px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        {/* Header: Fixed */}
        <div className="flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Data Conflict Detected
            </DialogTitle>
            <DialogDescription>
              Your local and cloud data have differences. Review the changes below
              and choose which version to keep.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs Area: Flexible with scroll */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Tabs defaultValue="summary" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="summary">📝 Summary</TabsTrigger>
              <TabsTrigger value="playlists">📁 Playlists</TabsTrigger>
              <TabsTrigger value="songs">🎵 Songs</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Changes Overview</h3>
              {!hasChanges ? (
                <p className="text-sm text-muted-foreground">
                  No changes detected
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {diff.summary.playlistsAdded > 0 && (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      <span>
                        {diff.summary.playlistsAdded} playlist(s) added in cloud
                      </span>
                    </div>
                  )}
                  {diff.summary.playlistsRemoved > 0 && (
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      <span>
                        {diff.summary.playlistsRemoved} playlist(s) removed in
                        cloud
                      </span>
                    </div>
                  )}
                  {diff.summary.playlistsModified > 0 && (
                    <div className="flex items-center gap-2">
                      <FileEdit className="h-4 w-4 text-yellow-600" />
                      <span>
                        {diff.summary.playlistsModified} playlist(s) modified
                      </span>
                    </div>
                  )}
                  {diff.summary.playlistsReordered > 0 && (
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      <span>
                        {diff.summary.playlistsReordered} playlist(s) reordered
                      </span>
                    </div>
                  )}
                  {diff.summary.songsAdded > 0 && (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      <span>{diff.summary.songsAdded} song(s) added</span>
                    </div>
                  )}
                  {diff.summary.songsRemoved > 0 && (
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      <span>{diff.summary.songsRemoved} song(s) removed</span>
                    </div>
                  )}
                  {diff.summary.songsReordered > 0 && (
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      <span>
                        {diff.summary.songsReordered} song(s) reordered
                      </span>
                    </div>
                  )}
                </div>
              )}
                </div>
              </TabsContent>

              <TabsContent value="playlists" className="mt-4">
            <div className="space-y-4">
              {diff.playlistDiffs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No playlist changes
                </p>
              ) : (
                diff.playlistDiffs.map((playlistDiff) => (
                  <div
                    key={playlistDiff.playlistId}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {playlistDiff.playlistName}
                      </span>
                      {playlistDiff.changeType === "added" && (
                        <Badge variant="default" className="bg-green-600">
                          <Plus className="h-3 w-3 mr-1" />
                          Added in Cloud
                        </Badge>
                      )}
                      {playlistDiff.changeType === "removed" && (
                        <Badge variant="destructive">
                          <Minus className="h-3 w-3 mr-1" />
                          Removed in Cloud
                        </Badge>
                      )}
                      {playlistDiff.changeType === "modified" && (
                        <Badge variant="secondary">
                          <FileEdit className="h-3 w-3 mr-1" />
                          Modified
                        </Badge>
                      )}
                      {(playlistDiff.changeType === "reordered" ||
                        (playlistDiff.changeType === "modified" &&
                          playlistDiff.localIndex !== undefined &&
                          playlistDiff.cloudIndex !== undefined &&
                          playlistDiff.localIndex !== playlistDiff.cloudIndex)) && (
                        <Badge
                          variant="outline"
                          className="border-blue-500 text-blue-600"
                        >
                          <ArrowUpDown className="h-3 w-3 mr-1" />
                          Reordered (Local #{playlistDiff.localIndex! + 1} / Cloud #{playlistDiff.cloudIndex! + 1})
                        </Badge>
                      )}
                    </div>
                    {playlistDiff.changeType === "modified" &&
                      playlistDiff.localName !== playlistDiff.cloudName && (
                        <div className="text-sm mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            <span>Local: {playlistDiff.localName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            <span>Cloud: {playlistDiff.cloudName}</span>
                          </div>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="songs" className="mt-4">
            <div className="space-y-4">
              {diff.playlistDiffs.filter((p) => p.itemDiffs && p.itemDiffs.length > 0)
                .length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No song changes
                </p>
              ) : (
                diff.playlistDiffs
                  .filter((p) => p.itemDiffs && p.itemDiffs.length > 0)
                  .map((playlistDiff) => (
                    <div
                      key={playlistDiff.playlistId}
                      className="rounded-lg border p-3"
                    >
                      <h4 className="font-medium mb-2">
                        📁 {playlistDiff.playlistName}
                      </h4>
                      <div className="space-y-1">
                        {playlistDiff.itemDiffs?.map((itemDiff) => (
                          <div
                            key={itemDiff.itemId}
                            className="text-sm flex items-center gap-2 py-1"
                          >
                            {itemDiff.changeType === "added" && (
                              <>
                                <Plus className="h-3 w-3 text-green-600 flex-shrink-0" />
                                <span className="text-green-700 dark:text-green-400">
                                  {itemDiff.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs ml-auto"
                                >
                                  Added
                                </Badge>
                              </>
                            )}
                            {itemDiff.changeType === "removed" && (
                              <>
                                <Minus className="h-3 w-3 text-red-600 flex-shrink-0" />
                                <span className="text-red-700 dark:text-red-400 line-through">
                                  {itemDiff.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs ml-auto"
                                >
                                  Removed
                                </Badge>
                              </>
                            )}
                            {itemDiff.changeType === "reordered" && (
                              <>
                                <ArrowUpDown className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span className="text-blue-700 dark:text-blue-400">
                                  {itemDiff.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs ml-auto"
                                >
                                  Local #{itemDiff.localIndex! + 1} / Cloud #
                                  {itemDiff.cloudIndex! + 1}
                                </Badge>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Data Source Selection: Fixed */}
        <div className="flex-shrink-0 space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Choose data source:</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedSource("local")}
              className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                selectedSource === "local"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                <span className="font-semibold">Local Device</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {localData?.playlists.length || 0} playlists
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSource("cloud")}
              className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                selectedSource === "cloud"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                <span className="font-semibold">Cloud Data</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {cloudData?.playlists.length || 0} playlists
              </p>
            </button>
          </div>
        </div>

        {/* Footer: Fixed */}
        <div className="flex-shrink-0">
          <DialogFooter>
            <Button variant="outline" onClick={onDecideLater}>
              Decide Later
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedSource}>
              {selectedSource === "local" ? "Use Local Data" : "Use Cloud Data"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}