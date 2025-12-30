"use client";

import { Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, Trash2, Bell, MessageCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: number) => void;
}

export function NotificationList({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationListProps) {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'vote_milestone':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'question_status':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.question_id) {
      router.push(`/?q=${notification.question_id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
          <Bell className="w-7 h-7 text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">
          No notifications
        </p>
        <p className="text-xs text-stone-500">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-stone-900 dark:text-white">
          Notifications
        </h3>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs h-7 px-2 hover:bg-orange-50 dark:hover:bg-orange-950/50"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications */}
      <div className="p-2">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleNotificationClick(notification)}
            className={`group p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
              notification.read
                ? 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                : 'bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50'
            }`}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.read 
                  ? 'bg-stone-100 dark:bg-stone-800' 
                  : 'bg-orange-100 dark:bg-orange-900/50'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug mb-1 ${
                  notification.read 
                    ? 'text-stone-700 dark:text-stone-300' 
                    : 'text-stone-900 dark:text-white font-medium'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-stone-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="h-7 w-7 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
