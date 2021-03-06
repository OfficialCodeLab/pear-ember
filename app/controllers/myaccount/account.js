import Ember from 'ember';
import format from 'ember-moment/computeds/format';

export default Ember.Controller.extend({
	moment: Ember.inject.service(),
	dateCurrent: format(),
	showAccount: true,
	notifications: Ember.inject.service('notification-messages')
});
