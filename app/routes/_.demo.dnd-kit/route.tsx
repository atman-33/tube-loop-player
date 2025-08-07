import { useState, useRef } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

interface DemoItem {
  id: string;
  title: string;
  color: string;
}

interface DemoContainer {
  id: string;
  title: string;
  items: DemoItem[];
  color: string;
}

// Sortable & Droppable Container Component
const SortableDroppableContainer = ({
  container,
  onAddItem
}: {
  container: DemoContainer;
  onAddItem: (containerId: string, item: DemoItem) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: container.id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `container-${container.id}`,
  });

  const { active } = useDndContext();

  // Check if we're dragging an item (not a container)
  const isDraggingItem = active && active.id.toString().startsWith('item-');

  // Conditionally disable sortable when dragging items
  const conditionalSortableRef = isDraggingItem ? () => { } : setSortableRef;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={conditionalSortableRef}
      style={style}
      className="relative"
      {...(isDraggingItem ? {} : attributes)}
      {...(isDraggingItem ? {} : listeners)}
    >
      <div ref={setDroppableRef} className="w-full h-full">
        <Card
          className={`
            transition-all duration-200 cursor-pointer
            ${isOver && !isDragging ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
            ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}
          `}
          style={{ borderColor: container.color }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span style={{ color: container.color }}>{container.title}</span>
              <Badge variant="secondary">{container.items.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[120px]">
              <SortableContext items={container.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {container.items.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </SortableContext>

              {container.items.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
                  Drop items here
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Drop indicator overlay */}
        {isOver && !isDragging && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none bg-blue-100/20 dark:bg-blue-900/20" />
        )}
      </div>
    </div>
  );
};

// Sortable Item Component
const SortableItem = ({ item }: { item: DemoItem; }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 rounded-lg border cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'shadow-lg z-10' : 'hover:shadow-sm'}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-medium">{item.title}</span>
      </div>
    </div>
  );
};

export default function DndKitDemo() {
  const [containers, setContainers] = useState<DemoContainer[]>([
    {
      id: 'container-1',
      title: 'Container A',
      color: '#ef4444',
      items: [
        { id: 'item-1', title: 'Red Item 1', color: '#ef4444' },
        { id: 'item-2', title: 'Red Item 2', color: '#dc2626' },
      ]
    },
    {
      id: 'container-2',
      title: 'Container B',
      color: '#3b82f6',
      items: [
        { id: 'item-3', title: 'Blue Item 1', color: '#3b82f6' },
        { id: 'item-4', title: 'Blue Item 2', color: '#2563eb' },
      ]
    },
    {
      id: 'container-3',
      title: 'Container C',
      color: '#10b981',
      items: [
        { id: 'item-5', title: 'Green Item 1', color: '#10b981' },
      ]
    }
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const isDragProcessingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Only used for visual feedback - no state changes here
    // All actual item movements are handled in handleDragEnd
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Prevent duplicate execution
    if (isDragProcessingRef.current) {
      console.log('🚫 Drag already processing - skipping duplicate execution');
      return;
    }

    isDragProcessingRef.current = true;
    console.log('🔒 Setting drag processing flag to true');
    setActiveId(null);

    if (!over) {
      isDragProcessingRef.current = false;
      console.log('🔓 Resetting drag processing flag (no over)');
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    console.log('🎯 DRAG END START:', { activeId, overId });

    // Handle container reordering
    if (activeId.startsWith('container-') && overId.startsWith('container-')) {
      const activeIndex = containers.findIndex(c => c.id === activeId);
      const overIndex = containers.findIndex(c => c.id === overId);

      if (activeIndex !== overIndex) {
        setContainers(prev => arrayMove(prev, activeIndex, overIndex));
      }
      isDragProcessingRef.current = false;
      console.log('🔓 Resetting drag processing flag (container reorder)');
      return; // Exit early to prevent further processing
    }

    // Handle item operations
    if (activeId.startsWith('item-')) {
      const activeItem = findItem(activeId);
      console.log('📦 Active Item:', activeItem);
      if (!activeItem) return;

      let targetContainerId: string | null = null;
      let overItem: { item: DemoItem; containerId: string; } | null = null;

      // Determine target container and get over item info
      if (overId.startsWith('container-')) {
        // Direct drop on container
        targetContainerId = overId.replace('container-', '');
        console.log('🎯 Drop on container:', targetContainerId);
      } else if (overId.startsWith('item-')) {
        // Drop on item - find which container the target item belongs to
        overItem = findItem(overId);
        console.log('🎯 Over Item:', overItem);
        if (overItem) {
          targetContainerId = overItem.containerId;
        }
      }

      console.log('🎯 Target Container ID:', targetContainerId);
      if (!targetContainerId) return;

      // Check if this is a cross-container move
      if (activeItem.containerId !== targetContainerId) {
        console.log('🔄 Cross-container move detected');
        console.log('📤 Source:', activeItem.containerId, '📥 Target:', targetContainerId);

        // Cross-container move
        setContainers(prev => {
          console.log('🔍 BEFORE UPDATE - Containers state:');
          prev.forEach(c => {
            console.log(`  ${c.id}: [${c.items.map(i => i.id).join(', ')}]`);
          });

          // Deep copy containers to avoid reference issues
          const newContainers = prev.map(c => ({
            ...c,
            items: [...c.items]
          }));

          // Remove from source container
          const sourceContainer = newContainers.find(c => c.id === activeItem.containerId);
          console.log('📤 Source container found:', !!sourceContainer);
          if (sourceContainer) {
            const beforeRemove = sourceContainer.items.map(i => i.id);
            sourceContainer.items = sourceContainer.items.filter(item => item.id !== activeId);
            const afterRemove = sourceContainer.items.map(i => i.id);
            console.log('📤 Remove from source:', beforeRemove, '→', afterRemove);
          }

          // Add to target container
          const targetContainer = newContainers.find(c => c.id === targetContainerId);
          console.log('📥 Target container found:', !!targetContainer);
          if (targetContainer) {
            const beforeAdd = targetContainer.items.map(i => i.id);

            // Create a copy of the item to avoid reference issues
            const movedItem = { ...activeItem.item };
            console.log('📋 Created item copy:', movedItem);

            // If dropped on an item, insert at that position
            if (overItem) {
              const insertIndex = targetContainer.items.findIndex(item => item.id === overId);
              console.log('📍 Insert index for', overId, ':', insertIndex);
              if (insertIndex >= 0) {
                targetContainer.items.splice(insertIndex, 0, movedItem);
                console.log('📥 Inserted at position', insertIndex);
              } else {
                // Fallback: add to end if index not found
                targetContainer.items.push(movedItem);
                console.log('📥 Added to end (fallback)');
              }
            } else {
              // If dropped on container, add to end
              targetContainer.items.push(movedItem);
              console.log('📥 Added to end (container drop)');
            }

            const afterAdd = targetContainer.items.map(i => i.id);
            console.log('📥 Add to target:', beforeAdd, '→', afterAdd);
          }

          console.log('🔍 AFTER UPDATE - Containers state:');
          newContainers.forEach(c => {
            console.log(`  ${c.id}: [${c.items.map(i => i.id).join(', ')}]`);
          });

          return newContainers;
        });
        isDragProcessingRef.current = false;
        console.log('🔓 Resetting drag processing flag (cross-container move)');
      } else {
        // Same container reordering (only if dropped on an item)
        if (overId.startsWith('item-')) {
          setContainers(prev => {
            // Deep copy containers to avoid reference issues
            const newContainers = prev.map(c => ({
              ...c,
              items: [...c.items]
            }));
            const container = newContainers.find(c => c.id === activeItem.containerId);

            if (container) {
              const activeIndex = container.items.findIndex(item => item.id === activeId);
              const overIndex = container.items.findIndex(item => item.id === overId);

              if (activeIndex !== overIndex && activeIndex >= 0 && overIndex >= 0) {
                container.items = arrayMove(container.items, activeIndex, overIndex);
              }
            }

            return newContainers;
          });
        }
        isDragProcessingRef.current = false;
        console.log('🔓 Resetting drag processing flag (same container reorder)');
      }
    }

    // Ensure flag is reset even if no processing occurred
    isDragProcessingRef.current = false;
    console.log('🔓 Resetting drag processing flag (fallback)');
  };

  const findItem = (id: string) => {
    for (const container of containers) {
      const item = container.items.find(item => item.id === id);
      if (item) {
        return { item, containerId: container.id };
      }
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DnD Kit Demo: Sortable + Droppable</h1>
        <p className="text-muted-foreground">
          This demo shows containers that are both sortable (can be reordered) and droppable (can accept items).
          Items can be dragged between containers and reordered within containers.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SortableContext items={containers.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {containers.map((container) => (
              <SortableDroppableContainer
                key={container.id}
                container={container}
                onAddItem={(containerId, item) => {
                  // This would be used for programmatic item addition
                }}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• <strong>Containers</strong> can be dragged to reorder them (sortable)</li>
          <li>• <strong>Containers</strong> can accept items dropped on them (droppable)</li>
          <li>• <strong>Items</strong> can be dragged between containers or reordered within containers</li>
          <li>• <strong>Conditional behavior</strong>: Container sorting is disabled when dragging items</li>
          <li>• <strong>Visual feedback</strong>: Hover states and drop indicators show valid drop zones</li>
        </ul>
      </div>
    </div>
  );
}