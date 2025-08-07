import { useState } from 'react';
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

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle item to container drop
    if (activeId.startsWith('item-') && overId.startsWith('container-')) {
      const activeItem = findItem(activeId);
      const overContainer = containers.find(c => `container-${c.id}` === overId);

      if (activeItem && overContainer && activeItem.containerId !== overContainer.id) {
        setContainers(prev => {
          const newContainers = [...prev];

          // Remove from source
          const sourceContainer = newContainers.find(c => c.id === activeItem.containerId);
          if (sourceContainer) {
            sourceContainer.items = sourceContainer.items.filter(item => item.id !== activeId);
          }

          // Add to target
          const targetContainer = newContainers.find(c => c.id === overContainer.id);
          if (targetContainer) {
            targetContainer.items.push(activeItem.item);
          }

          return newContainers;
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle container reordering
    if (activeId.startsWith('container-') && overId.startsWith('container-')) {
      const activeIndex = containers.findIndex(c => c.id === activeId);
      const overIndex = containers.findIndex(c => c.id === overId);

      if (activeIndex !== overIndex) {
        setContainers(prev => arrayMove(prev, activeIndex, overIndex));
      }
    }

    // Handle item reordering within same container
    if (activeId.startsWith('item-') && overId.startsWith('item-')) {
      const activeItem = findItem(activeId);
      const overItem = findItem(overId);

      if (activeItem && overItem && activeItem.containerId === overItem.containerId) {
        setContainers(prev => {
          const newContainers = [...prev];
          const container = newContainers.find(c => c.id === activeItem.containerId);

          if (container) {
            const activeIndex = container.items.findIndex(item => item.id === activeId);
            const overIndex = container.items.findIndex(item => item.id === overId);
            container.items = arrayMove(container.items, activeIndex, overIndex);
          }

          return newContainers;
        });
      }
    }
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