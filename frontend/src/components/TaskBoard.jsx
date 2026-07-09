import React from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

const Column = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-200 p-4 rounded w-1/3 min-h-[400px]">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <DraggableTask key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
};

const DraggableTask = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} {...listeners} {...attributes} style={style}
      className="bg-white p-3 rounded shadow cursor-grab active:cursor-grabbing border-l-4"
      style={{
        ...style,
        borderLeftColor: task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : 'green'
      }}
    >
      <div className="font-semibold">{task.title}</div>
      <div className="text-xs text-gray-500 mt-2">
        Assigned to: {task.assignedTo?.name || 'Unassigned'}
      </div>
    </div>
  );
};

export default function TaskBoard({ tasks, updateTaskStatus }) {
  const statuses = ['Pending', 'In Progress', 'Completed'];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Find the task
      const task = tasks.find(t => t._id === active.id);
      if (task && task.status !== over.id) {
        updateTaskStatus(active.id, over.id);
      }
     else i
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        {statuses.map(status => (
          <Column 
            key={status} 
            id={status} 
            title={status} 
            tasks={tasks.filter(t => t.status === status)} 
          />
        ))}
      </div>
    </DndContext>
  );
}
