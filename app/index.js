'use strict';

const Alexa = require('alexa-sdk');
const dao = require('./src/calendarDao');
const GetNextFreeDaysService = require('./src/getNextFreeDays');
const noCalendarForCountry = GetNextFreeDaysService.noCalendarForCountry;
const noCountrySpecified = GetNextFreeDaysService.noCountrySpecified;
const GetNextFreeDays = GetNextFreeDaysService(dao);
const moment = require('moment');


const APP_ID = 'amzn1.ask.skill.d9073608-3e5d-4fcc-8004-100b26b7f460';

const languageStrings = {
  'en-GB': {
    translation: {
      SKILL_NAME: 'Next free day',
      GET_FACT_MESSAGE: "Next free day is: ",
      HELP_MESSAGE: 'You can say tell me what is the next day i can stay in bed till noon... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      DISPLAY_CARD_TITLE: "The Next Free Day in %s.",
      NEXT_FREE_DAY: "The Next free day in %s is %s , %s . Have fun ! Bye",
      COUNTRY_NOT_DEFINED: "I\'m sorry, I do not know in which country to look for.",
      CALENDAR_NOT_FOUND: "I can not find a calendar for %s .",
      "NOT_FOUND_REPROMPT": "What else can I help with?",
      STOP_MESSAGE: 'Goodbye!',
      WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, what\'s the next free day in Poland? ... Now, what can I help you with.",
      WELCOME_REPROMT: "For instructions on what you can say, please say help me.",
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Next free day',
      GET_FACT_MESSAGE: "Next free day is: ",
      HELP_MESSAGE: 'You can say tell me what is the next day i can stay in bed till noon... What can I help you with?',
      HELP_REPROMPT: 'What can I help you with?',
      DISPLAY_CARD_TITLE: "%s  - Next Free Day in %s .",
      NEXT_FREE_DAY: "The Next free day in %s is %s , %s . Have fun ! Bye",
      COUNTRY_NOT_DEFINED: "I\'m sorry, I do not know in which country to look for",
      CALENDAR_NOT_FOUND: "I can not find a calendar for %s .",
      "NOT_FOUND_REPROMPT": "What else can I help with?",
      STOP_MESSAGE: 'Goodbye!',
      WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, what\'s the next free day in Poland? ... Now, what can I help you with.",
      WELCOME_REPROMT: "For instructions on what you can say, please say help me.",
    },
  }
};

const handlers = {
  'LaunchRequest': function () {
    this.emit(':ask', this.t("WELCOME_MESSAGE", this.t("SKILL_NAME")), this.t("WELCOME_REPROMT"));
  },
  'GetNextFreeDayIntent': function () {
    this.emit('GetNextFreeDay');
  },
  'GetNextFreeDay': function () {

    const itemSlot = this.event.request.intent.slots.Country;
    const country = itemSlot ? itemSlot.value : undefined;

    GetNextFreeDays(moment(), country).then(result => {
      if (result === noCountrySpecified || result === noCalendarForCountry) {

        let speechOutput;
        if (result === noCountrySpecified) {
          speechOutput = this.t("COUNTRY_NOT_DEFINED");
        } else {
          speechOutput = this.t("CALENDAR_NOT_FOUND", country);
        }
        const reprompt = this.t("NOT_FOUND_REPROMPT");
        this.emit(':ask', speechOutput + reprompt, reprompt);
        return;
      }

      const cardTitle = this.t("DISPLAY_CARD_TITLE", country);
      const speechOutput = this.t("NEXT_FREE_DAY", country, result.englishName, result.date.fromNow());
      this.emit(':tellWithCard', speechOutput, cardTitle, speechOutput);
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
