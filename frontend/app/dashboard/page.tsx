"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiLogOut,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import StatsCards from "@/components/StatsCards";
import ConfirmModal from "@/components/ConfirmModal";
import {
  fetchWithAuth,
  startTokenRefreshTimer,
  stopTokenRefreshTimer,
} from "@/lib/api";

interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  // ✅ Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "delete" as "delete" | "complete",
    taskId: "",
    taskTitle: "",
    action: null as (() => Promise<void>) | null,
  });

  const fetchTasks = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;
      const params = new URLSearchParams();
      if (filterPriority !== "all") params.append("priority", filterPriority);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetchWithAuth(url);

      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await res.json();
      setTasks(data.tasks);
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      );
      if (res.ok) {
        const user = await res.json();
        setUserName(user.name);
      }
    } catch (error) {
      console.error("Failed to fetch user");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUser();
    startTokenRefreshTimer();

    return () => {
      stopTokenRefreshTimer();
    };
  }, [filterPriority, filterStatus]);

  const handleLogout = async () => {
    try {
      stopTokenRefreshTimer();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // ✅ Show delete confirmation modal
  const confirmDelete = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      taskId: id,
      taskTitle: title,
      action: async () => {
        try {
          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
            { method: "DELETE" }
          );

          if (res.ok) {
            toast.success(`"${title}" deleted successfully`);
            fetchTasks();
          } else {
            toast.error("Failed to delete task");
          }
        } catch (error) {
          toast.error("Network error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ✅ Show complete confirmation modal
  const confirmComplete = (task: Task) => {
    setConfirmModal({
      isOpen: true,
      type: "complete",
      taskId: task._id,
      taskTitle: task.title,
      action: async () => {
        try {
          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task._id}`,
            {
              method: "PUT",
              body: JSON.stringify({ completed: true }),
            }
          );

          if (res.ok) {
            toast.success(`"${task.title}" completed! 🎉`);
            fetchTasks();
          } else {
            toast.error("Failed to complete task");
          }
        } catch (error) {
          toast.error("Network error");
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ✅ Reset filters - NO TOAST
  const handleResetFilters = () => {
    setFilterPriority("all");
    setFilterStatus("all");
    // ❌ Removed toast.success("Filters reset");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section - UPDATED with Image */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo_TaskHive.jpg"
                  alt="TaskHive Logo"
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                TaskHive
              </h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FiUser className="h-4 w-4" />
                <span className="text-sm">Welcome, {userName || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md font-medium"
              >
                <FiLogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards stats={stats} />

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input-field w-auto text-sm py-2"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔥 High Priority</option>
                <option value="medium">📊 Medium Priority</option>
                <option value="low">✅ Low Priority</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-auto text-sm py-2"
              >
                <option value="all">📋 All Tasks</option>
                <option value="active">⚡ Active</option>
                <option value="completed">✓ Completed</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              className="bg-purple-400 hover:bg-purple-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md font-medium"
            >
              <FiRefreshCw className="h-4 w-4" /> Reset Filters
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md font-medium"
          >
            <FiPlus className="h-4 w-4" /> Add New Task
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card text-center py-12"
            >
              <FiCheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500 mb-4">
                Click "Add New Task" to get started!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:scale-105 transition-all duration-200 font-medium"
              >
                <FiPlus className="h-4 w-4" /> Create Your First Task
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => confirmDelete(task._id, task.title)}
                    onToggleComplete={() => {
                      if (task.completed) {
                        toast.error("Task is already completed");
                      } else {
                        confirmComplete(task);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchTasks}
        editingTask={editingTask}
      />

      {/* ✅ Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          if (confirmModal.action) {
            await confirmModal.action();
          }
        }}
        title={confirmModal.type === "delete" ? "Delete Task" : "Complete Task"}
        message={
          confirmModal.type === "delete"
            ? "Are you sure you want to delete"
            : "Do you want to mark as complete"
        }
        type={confirmModal.type}
        itemName={confirmModal.taskTitle}
      />
    </div>
  );
}