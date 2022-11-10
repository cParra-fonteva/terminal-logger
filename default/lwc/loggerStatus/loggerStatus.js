import { LightningElement } from "lwc";
import { subscribe, unsubscribe } from "lightning/empApi";

export default class LoggerStatus extends LightningElement {
  channelName = "/event/LTE__LogEvent__e";
  isSubscribeDisabled = false;
  isUnsubscribeDisabled = !this.isSubscribeDisabled;

  subscription = {};

  handleSubscribe() {
    console.log('in handleSubscribe');
    const messageCallback = function(response) {
      const log = {
        'userId': response.data.payload.lte__UserId__c,
        'class': response.data.payload.lte__ApexClass__c,
        'level': response.data.payload.lte__LoggingLevel__c,
        'column': response.data.payload.lte__ColumnNumber__c,
        'method': response.data.payload.lte__ApexMethod__c,
        'message': JSON.parse(response.data.payload.lte__Body__c),
        'line': response.data.payload.lte__LineNumber__c,
        'displayType': response.data.payload.lte__DisplayType__c
      };

      if (log.displayType === 'table') {
        console.log('class:', log.class, 'method:', log.method, 'line:', log.line, 'column:', log.column);
        console.table(log.message);
        return;
      }

      if (log.level === 'Error') {
        console.error(JSON.stringify(log));
        return;
      }

      if (log.level === 'Info') {
        console.info(JSON.stringify(log));
        return;
      }

      if (log.level === 'Warn') {
        console.warn(JSON.stringify(log));
        return;
      }

      console.log(JSON.stringify(log));
    };

    // Invoke subscribe method of empApi. Pass reference to messageCallback
    subscribe(this.channelName, -1, messageCallback).then(response => {
      // Response contains the subscription information on successful subscribe call
      console.log("Logging started");
      this.subscription = response;
      this.toggleSubscribeButton(true);
    }).catch((e) => console.error(e));
  }

  connectedCallback() {
    console.log('subscribing');
    this.handleSubscribe();
  }

  handleUnsubscribe() {
    this.toggleSubscribeButton(false);

    // Invoke unsubscribe method of empApi
    unsubscribe(this.subscription, response => {
      console.log("Logging stopped");
    });
  }

  toggleSubscribeButton(enableSubscribe) {
    this.isSubscribeDisabled = enableSubscribe;
    this.isUnsubscribeDisabled = !enableSubscribe;
  }
}
