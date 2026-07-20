export default function getNotificationsWithPreferences(notifications, user) {
  if (!notifications || !user) return [];
  console.log("Notifications:", notifications);
  const settings = user.notificationSettings;
  if (!settings) return [];

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Parse quiet hours
  const [quietStartHour, quietStartMin] = settings.quietHours?.start?.split(':').map(Number) || [22, 0];
  const [quietEndHour, quietEndMin] = settings.quietHours?.end?.split(':').map(Number) || [8, 0];
  const quietStartTime = quietStartHour * 60 + quietStartMin;
  const quietEndTime = quietEndHour * 60 + quietEndMin;
  
  // Check if currently in quiet hours
  const inQuietHours = quietStartTime < quietEndTime 
    ? currentTime >= quietStartTime && currentTime < quietEndTime
    : currentTime >= quietStartTime || currentTime < quietEndTime;

  // If quiet hours enabled and currently in quiet hours, return empty
  if (settings.quietHours?.enabled && inQuietHours) {
    return [];
  }

  // Filter notifications based on user preferences
  return notifications.filter(notif => {
    switch (notif.category) {
      case 'social':
        if (notif.message?.includes('comment')) return settings.newComments;
        if (notif.message?.includes('like')) return settings.newLikes;
        return true;
      case 'idea':
        if (notif.message?.includes('suggestion')) return settings.newSuggestions;
        return true;
      case 'startup':
        if (notif.message?.includes('request')) return settings.joinRequests;
        if (notif.message?.includes('approval')) return settings.approvals;
        return true;
      case 'story':
        return settings.storyViews;
      case 'post':
        return settings.postEngagement;
      default:
        return true;
    }
  });
}