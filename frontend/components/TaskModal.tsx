'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSuccess, editingTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; priority?: string; dueDate?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setErrors({});
  }, [editingTask]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; priority?: string; dueDate?: string } = {};
    
    // ✅ Title is required
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // ✅ Priority is required
    if (!priority) {
      newErrors.priority = 'Priority is required';
    }
    
    // ✅ Due Date is required
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length > 200) {
      toast.error('Title must be less than 200 characters');
      return;
    }
    
    // ✅ Validate required fields
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null
    };
    
    try {
      const url = editingTask
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTask._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;
      
      const res = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData)
      });
      
      if (res.ok) {
        toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save task');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition rounded-lg p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Title - NOW WITH RED ASTERISK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter task title"
                  maxLength={200}
                  disabled={loading}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Enter task description (optional)"
                  maxLength={2000}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/2000 characters
                </p>
              </div>
              
              {/* ✅ Priority - WITH RED ASTERISK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as 'low' | 'medium' | 'high');
                    setErrors((prev) => ({ ...prev, priority: undefined }));
                  }}
                  className={`input-field ${errors.priority ? 'border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🔵 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
                {errors.priority && (
                  <p className="text-xs text-red-500 mt-1">{errors.priority}</p>
                )}
              </div>
              
              {/* ✅ Due Date - WITH RED ASTERISK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setErrors((prev) => ({ ...prev, dueDate: undefined }));
                  }}
                  className={`input-field ${errors.dueDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                  disabled={loading}
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingTask ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingTask ? 'Update Task' : 'Create Task'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}