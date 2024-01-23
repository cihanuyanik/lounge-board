import { Timestamp } from "@firebase/firestore-types";

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
