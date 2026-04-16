import { isSameDay, addDays, parseISO, startOfDay, isValid } from 'date-fns';

export const NotificationService = {
  checkNotifications: (projects) => {
    if (!projects || !Array.isArray(projects)) return [];
    
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const notifications = [];

    projects.forEach(p => {
      if (!p) return;

      // Check Survey Date
      if (p.surveyDate) {
        const sDate = parseISO(p.surveyDate);
        if (isValid(sDate)) {
          if (isSameDay(sDate, tomorrow)) {
            notifications.push({
              id: `survey-tomorrow-${p.id}`,
              projectId: p.id,
              title: '調査日前日',
              message: `明日は ${p.propertyName} の調査日です。`,
              type: 'alert',
              date: tomorrow.toISOString()
            });
          } else if (isSameDay(sDate, today)) {
            notifications.push({
              id: `survey-today-${p.id}`,
              projectId: p.id,
              title: '調査日当日',
              message: `本日は ${p.propertyName} の調査日です。`,
              type: 'warning',
              date: today.toISOString()
            });
          }
        }
      }

      // Check Construction Date
      if (p.constructionDate) {
        const cDate = parseISO(p.constructionDate);
        if (isValid(cDate)) {
          if (isSameDay(cDate, tomorrow)) {
            notifications.push({
              id: `const-tomorrow-${p.id}`,
              projectId: p.id,
              title: '工事日前日',
              message: `明日は ${p.propertyName} の工事日です。`,
              type: 'alert',
              date: tomorrow.toISOString()
            });
          } else if (isSameDay(cDate, today)) {
            notifications.push({
              id: `const-today-${p.id}`,
              projectId: p.id,
              title: '工事日当日',
              message: `本日は ${p.propertyName} の工事日です。`,
              type: 'warning',
              date: today.toISOString()
            });
          }
        }
      }
    });

    return notifications;
  },

  // Skeleton for future Webhook integration
  triggerWebhook: async (notification) => {
    // This is a placeholder for the user's future Webhook URL
    console.log('[Webhook Notification]:', notification.message);
    
    // Example:
    // try {
    //   await fetch('https://api.example.com/webhook', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(notification)
    //   });
    // } catch (e) { console.error('Webhook failed', e); }
  }
};
