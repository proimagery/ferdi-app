/**
 * Shared helpers for determining active trips and computing progress.
 */

/**
 * Returns all currently active trips (today falls within the trip's date range).
 */
export function getActiveTrips(trips) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return trips.filter(trip => {
    const allDates = trip.countries
      .filter(c => c.startDate && c.endDate)
      .flatMap(c => [c.startDate, c.endDate]);

    if (allDates.length === 0) return false;

    const dates = allDates.map(d => typeof d === 'string' ? new Date(d) : d);
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    earliestDate.setHours(0, 0, 0, 0);
    latestDate.setHours(0, 0, 0, 0);

    return earliestDate <= today && latestDate >= today;
  });
}

/**
 * Returns progress info for a trip: days elapsed, total days, and percentage.
 */
export function getTripProgress(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = trip.countries
    .filter(c => c.startDate && c.endDate)
    .flatMap(c => [c.startDate, c.endDate])
    .map(d => typeof d === 'string' ? new Date(d) : d);

  if (allDates.length === 0) return { daysElapsed: 0, totalDays: 0, percentComplete: 0 };

  const earliestDate = new Date(Math.min(...allDates));
  const latestDate = new Date(Math.max(...allDates));
  earliestDate.setHours(0, 0, 0, 0);
  latestDate.setHours(0, 0, 0, 0);

  const totalDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
  const daysElapsed = Math.min(
    Math.ceil((today - earliestDate) / (1000 * 60 * 60 * 24)) + 1,
    totalDays
  );
  const percentComplete = Math.round((daysElapsed / totalDays) * 100);

  return { daysElapsed, totalDays, percentComplete };
}

/**
 * Returns the country the user is currently in based on today's date.
 * Falls back to the first country if none match.
 */
export function getCurrentCountry(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...trip.countries]
    .filter(c => c.startDate && c.endDate)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  for (const country of sorted) {
    const start = new Date(country.startDate);
    const end = new Date(country.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today >= start && today <= end) {
      return country;
    }
  }

  // If between countries (travel day), return the next upcoming one
  for (const country of sorted) {
    const start = new Date(country.startDate);
    start.setHours(0, 0, 0, 0);
    if (today < start) {
      return country;
    }
  }

  // Fallback to last country
  return sorted[sorted.length - 1] || trip.countries[0];
}

/**
 * Returns stop status for each country: 'completed', 'current', or 'upcoming'.
 */
export function getStopStatus(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...trip.countries]
    .filter(c => c.startDate && c.endDate)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return sorted.map(country => {
    const start = new Date(country.startDate);
    const end = new Date(country.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const countryName = country.country_name || country.name;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let status;
    if (today > end) {
      status = 'completed';
    } else if (today >= start && today <= end) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return {
      country: countryName,
      status,
      startDate: start,
      endDate: end,
      days,
      order_index: country.order_index,
    };
  });
}

/**
 * Returns true if today is the last day of the trip.
 */
export function isLastDay(trip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allEndDates = trip.countries
    .filter(c => c.endDate)
    .map(c => {
      const d = new Date(c.endDate);
      d.setHours(0, 0, 0, 0);
      return d;
    });

  if (allEndDates.length === 0) return false;

  const latestEnd = new Date(Math.max(...allEndDates));
  return today.getTime() === latestEnd.getTime();
}
