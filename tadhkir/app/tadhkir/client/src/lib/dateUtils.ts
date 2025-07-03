// Utility functions for date/time formatting

export function formatLocalDateTime(dateString: string): { date: string; time: string } {
  // Parse the date string assuming it represents the intended local time
  // Remove the 'Z' suffix if present to treat it as local time
  const cleanDateString = dateString.replace('Z', '');
  const date = new Date(cleanDateString);
  
  const localDate = date.toLocaleDateString();
  const localTime = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  
  return { date: localDate, time: localTime };
}

export function formatNextReminder(dateString: string): string {
  const { date, time } = formatLocalDateTime(dateString);
  return `${date} at ${time}`;
}