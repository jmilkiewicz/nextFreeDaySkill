'use strict';

const _ = require('lodash/fp');
const countries = require('./countryCodes');
const moment = require('moment');

const toEvent = (x) => ({
  date: moment(`${x.date.day}-${x.date.month}-${x.date.year}`, "DD-MM-YYYY"),
  localName: x.localName,
  englishName: x.englishName
});


const isEventAfterPredicate = _.curry((date, event) => event.date.isAfter(date));

const byFullNamePredicate = (countryName) => _.flow(_.getOr('', 'fullName'), _.lowerCase, _.isEqual(countryName.toLowerCase()));

const getCountryCode = (countryName) => _.flow(_.find(byFullNamePredicate(countryName)), _.get('countryCode'))(countries);

const freeEventAfter = (from) => _.flow(_.map(toEvent), _.find(isEventAfterPredicate(from)));

module.exports = (dao) => {

  return (from, location) => {

    const findFreeEventInYear = (year) => dao.get(year, countryCode).then(freeEventAfter(from));

    //TODO when no country code found
    const countryCode = getCountryCode(location);
    const currentYear = from.year();

    return findFreeEventInYear(currentYear).then(ev => {
      if (!ev) {
        return findFreeEventInYear(currentYear + 1);
      }
      return ev;
    });

  }
};