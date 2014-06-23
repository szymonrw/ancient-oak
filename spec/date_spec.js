"use strict";

var store = require("../lib");

describe("storing dates, ", function () {

  describe("stored date", function () {
    it("is the same value as original", function () {
      var date = new Date();
      var result = store(date).value;

      expect(result).toEqual(date.valueOf());
    });
  });

  describe("allows getting date fields", function () {
    var date = new Date();
    var stored = store(date);

    var specs = {
      date: "getDate",
      Date: "getDate",
      day: "getDay",
      Day: "getDay",
      fullYear: "getFullYear",
      FullYear: "getFullYear",
      full_year: "getFullYear",
      hours: "getHours",
      Hours: "getHours",
      milliseconds: "getMilliseconds",
      Milliseconds: "getMilliseconds",
      minutes: "getMinutes",
      Minutes: "getMinutes",
      month: "getMonth",
      Month: "getMonth",
      seconds: "getSeconds",
      Seconds: "getSeconds",
      time: "getTime",
      Time: "getTime",
      timezoneOffset: "getTimezoneOffset",
      TimezoneOffset: "getTimezoneOffset",
      timezone_offset: "getTimezoneOffset",
      utcDate: "getUTCDate",
      UTCDate: "getUTCDate",
      utc_date: "getUTCDate",
      utcDay: "getUTCDay",
      UTCDay: "getUTCDay",
      utc_day: "getUTCDay",
      utcFullYear: "getUTCFullYear",
      UTCFullYear: "getUTCFullYear",
      utc_full_year: "getUTCFullYear",
      utcHours: "getUTCHours",
      UTCHours: "getUTCHours",
      utc_hours: "getUTCHours",
      utcMilliseconds: "getUTCMilliseconds",
      UTCMilliseconds: "getUTCMilliseconds",
      utc_milliseconds: "getUTCMilliseconds",
      utcMinutes: "getUTCMinutes",
      UTCMinutes: "getUTCMinutes",
      utc_minutes: "getUTCMinutes",
      utcMonth: "getUTCMonth",
      UTCMonth: "getUTCMonth",
      utc_month: "getUTCMonth",
      utcSeconds: "getUTCSeconds",
      UTCSeconds: "getUTCSeconds",
      utc_seconds: "getUTCSeconds"
    };

    store(specs).forEach(function (method, field) {
      it(field, function () {
        expect(stored(field)).toBe(date[method]());
      });
    });
  });

  describe("implements dumping", function () {
    var date = new Date();
    var stored = store(date);

    it("with dump method", function () {
      expect(stored.dump()).toEqual(date);
    });

    it("with json method", function () {
      expect(stored.json()).toEqual(JSON.stringify(date));
    });
  });
});