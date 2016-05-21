import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		saveItem(catNew){
			 catNew.save();
		},

		createItem(){
			var newItem = this.store.createRecord('category', {				
			  name: this.controller.get('name'),		
			  desc: this.controller.get('desc'),	
			  imageURL: this.controller.get('imageURL')
			});

			newItem.save();	
			this.controller.set('name', '');
			this.controller.set('imageURL',  '');
			this.controller.set('desc',  '');
		}
	}
});
