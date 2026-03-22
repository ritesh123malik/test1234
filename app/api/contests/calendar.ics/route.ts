// app/api/contests/calendar.ics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contestAPI } from '@/lib/contests/api';

export async function GET(req: NextRequest) {
  try {
    const contests = await contestAPI.fetchUpcomingContests();

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PlacementIntel//Contest Radar//EN',
      'X-WR-CALNAME:Coding Contests (PlacementIntel)',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    contests.forEach(contest => {
      const start = new Date(contest.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(contest.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${contest.id}@placementintel.com`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:[${contest.platform.toUpperCase()}] ${contest.name}`,
        `DESCRIPTION:Join the contest at ${contest.url}`,
        `URL:${contest.url}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="contests.ics"',
      },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}
