const generateICS = (event) => {
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Job Tracker//Interview Calendar//EN
BEGIN:VEVENT
UID:${event.id}@jobtracker.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || 'Online'}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Interview in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return ics;
};

const createInterviewCalendarEvent = (interview, job) => {
  const endDate = new Date(interview.date);
  endDate.setHours(endDate.getHours() + 1);

  return generateICS({
    id: interview._id,
    title: `Interview: ${job.title} at ${job.company}`,
    description: `Interview Type: ${interview.type}\nCompany: ${job.company}\nPosition: ${job.title}\nNotes: ${interview.notes || 'N/A'}`,
    location: interview.location || 'Online',
    startDate: interview.date,
    endDate: endDate
  });
};

const createDeadlineCalendarEvent = (job) => {
  const startDate = new Date(job.applicationDeadline);
  startDate.setHours(9, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(10, 0, 0, 0);

  return generateICS({
    id: job._id,
    title: `Application Deadline: ${job.title} at ${job.company}`,
    description: `Company: ${job.company}\nPosition: ${job.title}\nLocation: ${job.location}\nType: ${job.type}`,
    location: job.location,
    startDate: startDate,
    endDate: endDate
  });
};

module.exports = {
  generateICS,
  createInterviewCalendarEvent,
  createDeadlineCalendarEvent
};
