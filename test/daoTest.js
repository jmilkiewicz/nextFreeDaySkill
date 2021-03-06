'use strict';

const Code = require('code');
const Lab = require('lab');
const moment = require('moment');
const sut = require('../app/src/calendarDao');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('get free days from kayaposoft', () => {

  it('get year data for Poland', () => {
    return sut.get(2016,'pol').then((result) =>{
        expect(result).to.be.array();
        expect(result).to.not.be.empty();
        result.forEach(elem =>{
          expect(elem).to.include('localName');
          expect(elem).to.include('englishName');
          expect(elem).to.include('date');
          expect(elem.date).to.include('day');
          expect(elem.date).to.include('month');
          expect(elem.date).to.include('year');
        })
    });
  });
});
