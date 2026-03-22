// lib/utils/calendar.ts

interface ContestData {
    name: string;
    startTime: string;
    endTime?: string;
    url: string;
    platform: string;
    duration?: number; // in seconds
}

export function generateICS(contest: ContestData): string {
    const formatTime = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const start = new Date(contest.startTime);
    const end = contest.endTime 
        ? new Date(contest.endTime) 
        : new Date(start.getTime() + (contest.duration || 3600) * 1000);

    const uid = `${contest.platform}-${start.getTime()}-${encodeURIComponent(contest.name).substring(0, 20)}@placement-intel.info`;
    
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PlacementIntel//Contest Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatTime(new Date())}`,
        `DTSTART:${formatTime(start)}`,
        `DTEND:${formatTime(end)}`,
        `SUMMARY:${contest.name} [${contest.platform.toUpperCase()}]`,
        `DESCRIPTION:Strategic contest on ${contest.platform}. URL: ${contest.url}`,
        `LOCATION:${contest.platform.toUpperCase()}`,
        `URL:${contest.url}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return lines.join('\r\n');
}

export function downloadICS(contest: ContestData) {
    const icsContent = generateICS(contest);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${contest.name.replace(/[^\w]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function getGoogleCalendarUrl(contest: ContestData): string {
    const formatTime = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const start = new Date(contest.startTime);
    const end = contest.endTime 
        ? new Date(contest.endTime) 
        : new Date(start.getTime() + (contest.duration || 3600) * 1000);

    const details = `Strategic contest on ${contest.platform}.\nURL: ${contest.url}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.name)}&dates=${formatTime(start)}/${formatTime(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(contest.url)}`;
}
