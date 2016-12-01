'use strict';

const Alexa = require('alexa-sdk');
const dao = require('./src/calendarDao');
const GetNextFreeDays = require('./src/getNextFreeDays')(dao);
const moment = require('moment');


const APP_ID = 'amzn1.ask.skill.d9073608-3e5d-4fcc-8004-100b26b7f460';

const languageStrings = {
  'en-GB': {
    translation: {
      SKILL_NAME: 'Next free day',
      GET_FACT_MESSAGE: "Next free day is: ",
      HELP_MESSAGE: 'You can say tell me what is the next day i can stay in bed till noon... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Next free day',
      GET_FACT_MESSAGE: "Next free day is: ",
      HELP_MESSAGE: 'You can say tell me what is the next day i can stay in bed till noon... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
    },
  }
};

const handlers = {
  'LaunchRequest': function () {
    this.emit('GetNextFreeDay');
  },
  'GetNextFreeDayIntent': function () {
    this.emit('GetNextFreeDay');
  },
  'GetNextFreeDay': function () {
    GetNextFreeDays(moment(), "Poland").then(event => {
      const speechOutput = `${event.localName} ${event.date.fromNow()}`;
      this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), speechOutput);
    }, error => {
      this.emit(':tellWithCard', "sth broke", this.t('SKILL_NAME'), error);
    });
  },
  'AMAZON.HelpIntent': function () {
    const speechOutput = this.t('HELP_MESSAGE');
    const reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'SessionEndedRequest': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
