import Ember from 'ember';
import format from 'ember-moment/computeds/format';
import momentComputed from 'ember-moment/computeds/moment';
import fromNow from 'ember-moment/computeds/from-now';

export default Ember.Controller.extend({
	selectedDate: null,
	moment: Ember.inject.service(),
	computedSelected: format('selectedDate'),
	dateCurrent: format(),
	// computedFromNow: fromNow(momentComputed('selectedDate'), false), 
	computedFromNow: 0,
	daysString: ''
});