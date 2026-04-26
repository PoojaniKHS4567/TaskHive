'use client';
import { formatDistanceToNow, format } from 'date-fns';
import { FiEdit2, FiTrash2, FiCheckCircle, FiCircle, FiCalendar } from 'react-icons/fi';

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const priorityConfig = {
  low: { label: 'Low', className: 'priority-low', icon: '🟢' },
  medium: { label: 'Medium', className: 'priority-medium', icon: '🔵' },
  high: { label: 'High', className: 'priority-high', icon: '🔴' },
};

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  // ✅ FIX: Proper overdue check - only PAST dates, NOT today
  const getIsOverdue = () => {
    if (!task.dueDate) return false;
    if (task.completed) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // ✅ Only true if due date is BEFORE today
    return dueDate < today;
  };
  
  const isOverdue = getIsOverdue();
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isToday = dueDateObj && 
    new Date(dueDateObj).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
  
  return (
    <div className={`card transition-all duration-200 ${task.completed ? 'opacity-75 bg-gray-50' : 'hover:shadow-lg'}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          className="mt-1 focus:outline-none transform transition hover:scale-110"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? (
            <FiCheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <FiCircle className="h-6 w-6 text-gray-400 hover:text-primary-500 transition" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <span className={priorityConfig[task.priority].className}>
              {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
            </span>
            {task.completed && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Completed
              </span>
            )}
            {/* ✅ Overdue badge - ONLY for PAST dates */}
            {isOverdue && !task.completed && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                ⚠️ Overdue
              </span>
            )}
            {/* ✅ Due Today badge (optional - shows it's due today but not overdue) */}
            {isToday && !task.completed && !isOverdue && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                📅 Due Today
              </span>
            )}
          </div>
          
          {task.description && (
            <p className={`text-gray-600 mt-2 ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
            <span>
              Created {formatDistanceToNow(new Date(task.createdAt))} ago
            </span>
            {dueDateObj && (
              <span className="flex items-center gap-1">
                <FiCalendar className="h-3 w-3" />
                Due: {format(dueDateObj, 'MMM d, yyyy')}
                {isToday && !task.completed && !isOverdue && (
                  <span className="text-orange-500 ml-1">(Today)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-primary-600 transition rounded-lg hover:bg-gray-100"
            aria-label="Edit task"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 transition rounded-lg hover:bg-gray-100"
            aria-label="Delete task"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}