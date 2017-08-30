"use strict"

const mocha = require('mocha');
const expect = require('chai').expect;
const dateFns = require('date-fns');
const path = require('path');

describe("Date fns learning tests", function(){
    it("should load dates from git format", function(){
        const date = dateFns.parse('Fri May 6 10:49:47 2016');
        
        expect(date.getTime()).to.equal(new Date(2016, 4, 6, 10, 49, 47).getTime());
    });

    it("should compare dates", function(){
        const dates = ['Fri May 7 10:49:47 2016', 'Fri May 6 10:49:47 2016'];

        const datesSorted = dates.sort(function(date1, date2){
            const date1Fns = dateFns.parse(date1);
            const date2Fns = dateFns.parse(date1);
            return dateFns.compareAsc(date1, date2);
        });
        
        expect(datesSorted[0]).to.equal('Fri May 6 10:49:47 2016');
    });
});