var calendarId = ""; //Set this to the ID of the Google Calendar.
var baseUrl = ""; //The URL where the .ics file can be downloaded from.
var calendar = CalendarApp.getCalendarById(calendarId);

function updateCalendar()
{
  var date = new Date();
  createWeek(getMonday(date));
  date.setDate(date.getDate() + 7);
  createWeek(getMonday(date));
}

function createWeek(date)
{
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  date.setDate(date.getDate() + 1);
  clearDay(date);
  
  var cal = UrlFetchApp.fetch(baseUrl + date.getYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()).toString();
  var calEvents;
  try
  {
    calEvents = cal.split("CALSCALE:GREGORIAN")[1].split("BEGIN:VEVENT");
  }
  catch(e)
  {
    return;
  }
  
  for(i = 1; i < calEvents.length; i++)
  {
    var start;
    var end;
    var description;
    var summary;
    var location;
    var event = calEvents[i].replace("END:VEVENT", "").replace("END:VCALENDAR", "");
    var eventLines = event.split("\n");
    for(j = 0; j < eventLines.length; j++)
    {
      if(eventLines[j].indexOf("DTSTART") > -1)
        start = eventLines[j].split(":")[1];
        
      if(eventLines[j].indexOf("DTEND") > -1)
        end = eventLines[j].split(":")[1];
        
      if(eventLines[j].indexOf("DESCRIPTION") > -1)
        description = eventLines[j].split(":")[1];
        
      if(eventLines[j].indexOf("SUMMARY") > -1)
        summary = eventLines[j].split(":")[1];
        
      if(eventLines[j].indexOf("LOCATION") > -1)
        location = eventLines[j].split(":")[1];
    }
    
    var simultaniousEvents = calendar.getEvents(convertStringToDate(start), convertStringToDate(end));
    if(simultaniousEvents.length > 0)
    {
      simultaniousEvents[0].setDescription(simultaniousEvents[0].getDescription() + "\n" + description);
    }
    else if(summary.indexOf("Frokost/Lunch") == -1)
    {
      var event = calendar.createEvent(summary, convertStringToDate(start), convertStringToDate(end));
      event.setDescription(description + "\n" + getTimestamp());
      event.setLocation(location);
      Utilities.sleep(500);
    }
  }
}

function convertStringToDate(time)
{
  var timeString = "" + time;
  var year = +timeString.substring(0, 4);
  var month = +timeString.substring(4, 6);
  var day = +timeString.substring(6, 8);
  var hour = +timeString.substring(9, 11);
  var minute = +timeString.substring(11, 13);
  var second = +0;
  var date = new Date(year, month - 1, day, hour, minute, second);
  var startdate = date;
  startdate.setMinutes(date.getMinutes() - getLocalTimezoneOffset());
  return startdate;
}

function clearDay(day)
{
  var events = calendar.getEventsForDay(day);
  for(i = 0; i < events.length; i++)
  {
    events[i].deleteEvent();
  }
}

function getLocalTimezoneOffset()
{
  var d = new Date();
  return d.getTimezoneOffset();
}

function getMonday(d)
{
  d = new Date(d);
  var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6:1);
  return new Date(d.setDate(diff));
}

function getTimestamp()
{
  var d = new Date();
  var year = d.getFullYear();
  var month = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
  var day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
  var hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
  var minute = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
  var second = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
  return "Last updated: " + day + "-" + month + "-" + year + ", " + hour + ":" + minute;
}
