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

  describe("allows creating new versions", function () {
    var specs = {
      date: "setDate",
      Date: "setDate",
      fullYear: "setFullYear",
      FullYear: "setFullYear",
      full_year: "setFullYear",
      hours: "setHours",
      Hours: "setHours",
      milliseconds: "setMilliseconds",
      Milliseconds: "setMilliseconds",
      minutes: "setMinutes",
      Minutes: "setMinutes",
      month: "setMonth",
      Month: "setMonth",
      seconds: "setSeconds",
      Seconds: "setSeconds",
      time: "setTime",
      Time: "setTime",
      utcDate: "setUTCDate",
      UTCDate: "setUTCDate",
      utc_date: "setUTCDate",
      utcFullYear: "setUTCFullYear",
      UTCFullYear: "setUTCFullYear",
      utc_full_year: "setUTCFullYear",
      utcHours: "setUTCHours",
      UTCHours: "setUTCHours",
      utc_hours: "setUTCHours",
      utcMilliseconds: "setUTCMilliseconds",
      UTCMilliseconds: "setUTCMilliseconds",
      utc_milliseconds: "setUTCMilliseconds",
      utcMinutes: "setUTCMinutes",
      UTCMinutes: "setUTCMinutes",
      utc_minutes: "setUTCMinutes",
      utcMonth: "setUTCMonth",
      UTCMonth: "setUTCMonth",
      utc_month: "setUTCMonth",
      utcSeconds: "setUTCSeconds",
      UTCSeconds: "setUTCSeconds",
      utc_seconds: "setUTCSeconds"
    };

    store(specs).forEach(function (method, field) {
      var value = 6;
      it("set " + field, function () {
        var date = new Date(0);
        date[method](value);
        var stored = store(new Date(0)).set(field, value);
        expect(stored.dump()).toEqual(date);
      });
    });

    store(specs).forEach(function (set_method, field) {
      var get_method = set_method.replace(/^set/, "get");
      it("update " + field, function () {
        var date = new Date(0);
        date[set_method](date[get_method]() + 1);
        var stored = store(new Date(0)).update(field, function (value) {
          return value + 1;
        });
        expect(stored.dump()).toEqual(date);
      });
    });


    it("with patch", function () {
      var stored = store(new Date(0)).patch({ full_year: 1987, month: 10, date: 2 });
      var date = new Date(1987, 10, 2);
      expect(stored.dump()).toEqual(date);
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
