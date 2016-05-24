import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		login: function (){
			let hash = this.hashCode(this.controller.get('email'));					//Hash the email address
			this.store.findRecord('vendorLogin', hash).then((vendor) => {			//Find the vendor account login
				if(vendor.get('password') === this.controller.get('password')){		//Compare passwords
					this.assignToUser(vendor.get('vendorID'));						//Assign vendor account to user
				} else {
					alert("Incorrect password!");
				}
			}, () => {
				alert("Account does not exist!");
			});
		}
	},
    hashCode: function(str) {  //String to hash function
        let hash = 0,
            i, chr, len;
        if (str.length === 0) {
            return hash;
        }
        for (i = 0, len = str.length; i < len; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    },
    assignToUser: function(id){
    	let user = this.store.peekRecord('user', this.get("session").content.currentUser.id);
    	user.set('vendorAccount', id);
    	user.save();
    }
});