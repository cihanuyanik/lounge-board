import { Timestamp } from "@firebase/firestore-types";
import moment from "moment";

declare global {
  interface Date {
    toLocaleISOString(): string;
    isLessThan(date2: Date | Timestamp | number): boolean;
  }
}

Date.prototype.toLocaleISOString = function () {
  const dateStrSplit = this.toLocaleDateString("en-UK").split("/");
  const timeStrSplit = this.toLocaleTimeString("en-UK").split(":");
  return `${dateStrSplit[2]}-${dateStrSplit[1]}-${dateStrSplit[0]}T${timeStrSplit[0]}:${timeStrSplit[1]}`;
};

Date.prototype.isLessThan = function (date2: Date | Timestamp | number) {
  const date1Ms = this.getTime();
  const date2Ms =
    date2 instanceof Date
      ? date2.getTime()
      : typeof date2 === "number"
        ? date2
        : date2.toDate().getTime();

  return date1Ms < date2Ms;
};

export function toDate(
  source: Date | object | string | null | undefined,
): Date {
  if (source === null || source === undefined)
    // @ts-ignore
    return undefined;

  if (source instanceof Date) return source;

  // @ts-ignore
  if (typeof source === "object" && source.toDate !== undefined)
    // @ts-ignore
    return source.toDate();
  if (typeof source === "string") return new Date(source);
  return new Date();
}

export function buildDurationString(
  startAt: Date | Timestamp | string,
  endAt: Date | Timestamp | string,
) {
  const startsAt = moment(toDate(startAt));
  const endsAt = moment(toDate(endAt));
  const duration = moment.duration(endsAt.diff(startsAt));

  let minutes = duration.minutes();
  let hours = duration.hours();
  let days = duration.days();

  // If minutes is 59, set it to 0 and increment hours
  if (minutes === 59) {
    minutes = 0;
    hours++;
  }

  // Build duration string
  let durationString = "";
  if (days > 0) durationString += `${days}D `;
  if (hours > 0) durationString += `${hours}H `;
  if (minutes > 0) durationString += `${minutes}M `;
  return durationString.trim();
}
