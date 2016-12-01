'use strict';

const Code = require('code');
const _ = require('lodash/fp');
const Lab = require('lab');
const Sinon = require('sinon');
const moment = require('moment');
const SutFactory = require('../app/src/getNextFreeDays');
const noCountrySpecified = SutFactory.noCountrySpecified;
const noCalendarForCountry = SutFactory.noCalendarForCountry;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;

const expect = Code.expect;


describe('get free days', () => {

  let sut;
  let fetchFreedays;

  beforeEach((done) => {

    fetchFreedays = Sinon.stub();
    sut = SutFactory({
      get: fetchFreedays
    });
    done();
  });

  const bankHolidays2016 = [
    {
      "date": {
        "day": 6,
        "month": 1,
        "year": 2016,
        "dayOfWeek": 3
      },
      "localName": "Święto Trzech Króli",
      "englishName": "Epiphany"
    },
    {
      "date": {
        "day": 26,
        "month": 12,
        "year": 2016,
        "dayOfWeek": 1
      },
      "localName": "Drugi dzień Bożego Narodzenia",
      "englishName": "Second day of Christmas"
    }
  ];

  const bankHolidays2017 = [
    {
      "date": {
        "day": 1,
        "month": 1,
        "year": 2017,
        "dayOfWeek": 7
      },
      "localName": "Nowy Rok",
      "englishName": "New Year's Day"
    },
    {
      "date": {
        "day": 6,
        "month": 1,
        "year": 2017,
        "dayOfWeek": 5
      },
      "localName": "Święto Trzech Króli",
      "englishName": "Epiphany"
    }
  ];

  describe('when still free day in this year', () => {

    let result;
    beforeEach(() => {
      fetchFreedays.returns(Promise.resolve(bankHolidays2016));
      result = sut(moment('6-1-2016', "DD-MM-YYYY"), 'poland');
      return result.catch(_.noop)
    });

    it('returns the first free day after particular date', () => {
      const expectedEvent = {
        date: moment('26-12-2016', "DD-MM-YYYY"),
        localName: "Drugi dzień Bożego Narodzenia",
        englishName: "Second day of Christmas"
      };

      return result.then((event) => expect(event).to.equal(expectedEvent));
    });

    it('calls dao with proper parameter', (done) => {

      expect(fetchFreedays.calledOnce).to.be.true;
      expect(fetchFreedays.args[0]).to.be.equal([2016, 'pol']);
      done();
    });

  });

  describe('validation errors', () => {

    it('returns noCountrySpecified when country is not defined', () => {
      return sut(moment('6-1-2016', "DD-MM-YYYY"), undefined).then(result=>{
        expect(result).to.be.equal(noCountrySpecified)
      } );
    });

    it('returns noCalendarForCountry when no callendar for country is defined', () => {
      return sut(moment('6-1-2016', "DD-MM-YYYY"), 'Szuflandia').then(result=>{
        expect(result).to.be.equal(noCalendarForCountry)
      } );
    });


  });

  describe('when free day in this next year', () => {

    let result;
    beforeEach(() => {
      fetchFreedays.onCall(0).returns(Promise.resolve(bankHolidays2016));
      fetchFreedays.onCall(1).returns(Promise.resolve(bankHolidays2017));


      result = sut(moment('31-12-2016', "DD-MM-YYYY"), 'poland');
      return result.catch(_.noop)
    });

    it('returns the first free day after particular date', () => {
      const expectedEvent = {
        date: moment('1-1-2017', "DD-MM-YYYY"),
        localName: "Nowy Rok",
        englishName: "New Year's Day"
      };

      return result.then((event) => expect(event).to.equal(expectedEvent));
    });

    it('calls dao with proper parameter', (done) => {

      expect(fetchFreedays.calledTwice).to.be.true;
      expect(fetchFreedays.args[1]).to.be.equal([2017, 'pol']);
      done();
    });

  })
});
