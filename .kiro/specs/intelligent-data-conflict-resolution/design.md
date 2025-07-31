# Design Document

## Overview

The intelligent data conflict resolution system will enhance the current playlist synchronization mechanism by implementing smart conflict detection that only shows the conflict modal when there are actual differences between local and cloud data. The system will use deep comparison algorithms to normalize and compare playlist data structures, automatically syncing identical data without user intervention.

## Architecture

### Core Components

1. **DataComparator** - Utility class for deep comparison of playlist data structures
2. **ConflictResolver** - Enhanced conflict resolution logic with automatic sync capabilities  
3. **DataNormalizer** - Utility for normalizing data structures for consistent comparison
4. **Enhanced usePlaylistSync Hook** - Updated hook with intelligent conflict detection

### Data Flow

```
User Authentication → Load Cloud Data → Normalize Both Datasets → Deep Compare → 
  ↓
Identical? → Yes → Auto Sync (Silent) → Update Local State
  ↓
No → Show Conflict Modal → User Selection → Resolve & Sync
```

## Components and Interfaces

### DataComparator Interface

```typescript
interface DataComparator {
  /**
   * Performs deep comparison of two UserPlaylistData objects
   * @param local - Local playlist data
   * @param cloud - Cloud playlist data  
   * @returns boolean indicating if data is identical
   */
  areDataSetsIdentical(local: UserPlaylistData, cloud: UserPlaylistData): boolean;
  
  /**
   * Normalizes playlist data for consistent comparison
   * @param data - Raw playlist data
   * @returns normalized data structure
   */
  normalizeData(data: UserPlaylistData): NormalizedUserPlaylistData;
}
```

### Enhanced ConflictResolver Interface

```typescript
interface ConflictResolver {
  /**
   * Determines if conflict resolution is needed
   * @param local - Local playlist data
   * @param cloud - Cloud playlist data
   * @returns ConflictResolution indicating action to take
   */
  analyzeConflict(local: UserPlaylistData, cloud: UserPlaylistData): ConflictResolution;
  
  /**
   * Performs automatic sync when data is identical
   * @param cloudData - Cloud data to sync
   */
  performAutoSync(cloudData: UserPlaylistData): Promise<void>;
}

type ConflictResolution = 
  | { type: 'auto-sync'; data: UserPlaylistData }
  | { type: 'show-modal'; local: UserPlaylistData; cloud: UserPlaylistData }
  | { type: 'no-action' };
```

### Data Normalization Structure

```typescript
interface NormalizedUserPlaylistData {
  playlists: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      title: string; // Always string, never undefined
    }>;
  }>; // Sorted by ID
  activePlaylistId: string;
  loopMode: 'all' | 'one';
  isShuffle: boolean;
}
```

## Data Models

### Comparison Result Model

```typescript
interface ComparisonResult {
  isIdentical: boolean;
  differences?: {
    playlists?: {
      added: string[];
      removed: string[];
      modified: string[];
    };
    settings?: {
      activePlaylistId?: boolean;
      loopMode?: boolean;
      isShuffle?: boolean;
    };
  };
}
```

### Conflict Analysis Model

```typescript
interface ConflictAnalysis {
  hasConflict: boolean;
  conflictType: 'identical' | 'different' | 'empty-local' | 'empty-cloud';
  recommendedAction: 'auto-sync' | 'show-modal' | 'sync-local-to-cloud';
  metadata: {
    localItemCount: number;
    cloudItemCount: number;
    localPlaylistCount: number;
    cloudPlaylistCount: number;
  };
}
```

## Error Handling

### Comparison Errors
- **Malformed Data**: Fall back to showing conflict modal if data structure is invalid
- **Comparison Timeout**: Implement 100ms timeout for comparison operations
- **Memory Errors**: Handle large dataset comparisons gracefully

### Sync Errors
- **Network Failures**: Maintain local state and retry sync later
- **Server Errors**: Show conflict modal as fallback when auto-sync fails
- **Authentication Errors**: Handle expired sessions during sync operations

### Fallback Strategy
```typescript
try {
  const isIdentical = await dataComparator.areDataSetsIdentical(local, cloud);
  if (isIdentical) {
    await conflictResolver.performAutoSync(cloud);
  } else {
    showConflictModal(local, cloud);
  }
} catch (error) {
  console.error('Conflict resolution failed:', error);
  // Fallback to existing behavior
  showConflictModal(local, cloud);
}
```

## Testing Strategy

### Unit Tests
- **DataComparator Tests**: Test deep comparison with various data structures
- **DataNormalizer Tests**: Verify consistent normalization of edge cases
- **ConflictResolver Tests**: Test all conflict resolution scenarios

### Integration Tests  
- **Sync Flow Tests**: Test complete sync flow from detection to resolution
- **Error Handling Tests**: Verify graceful handling of all error scenarios
- **Performance Tests**: Ensure comparison completes within 100ms threshold

### Test Data Scenarios
```typescript
const testScenarios = [
  {
    name: 'Identical data with different ordering',
    local: { /* shuffled playlists */ },
    cloud: { /* same data, different order */ },
    expected: 'auto-sync'
  },
  {
    name: 'Different playlist names',
    local: { /* playlist named "Work" */ },
    cloud: { /* same playlist named "Office" */ },
    expected: 'show-modal'
  },
  {
    name: 'Undefined vs empty string titles',
    local: { /* items with undefined titles */ },
    cloud: { /* same items with empty string titles */ },
    expected: 'auto-sync'
  }
];
```

### Performance Benchmarks
- Comparison of 100 playlists with 1000 items each: < 100ms
- Memory usage during comparison: < 50MB additional heap
- UI responsiveness: No blocking of main thread

## Implementation Approach

### Phase 1: Core Comparison Logic
1. Implement DataNormalizer utility
2. Implement DataComparator with deep comparison
3. Add comprehensive unit tests

### Phase 2: Conflict Resolution Enhancement
1. Update ConflictResolver with auto-sync capability
2. Integrate with existing usePlaylistSync hook
3. Add error handling and fallback mechanisms

### Phase 3: Integration and Testing
1. Update usePlaylistSync hook to use new conflict resolution
2. Add integration tests for complete flow
3. Performance testing and optimization

### Backward Compatibility
- Existing DataConflictModal component remains unchanged
- Current conflict resolution API maintained for fallback scenarios
- Gradual rollout with feature flag support