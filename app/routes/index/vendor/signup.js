import Ember from 'ember';

export default Ember.Route.extend({

	beforeModel: function() {
	  	return this.get("session").fetch().catch(function() {});
    },
    actions: {
        signBtn() {
            let regex = this.controller.get('isValidEmail');
            let passLength = this.controller.get('passwordLength');
            let customID = this.controller.get('customID');
            let email = this.controller.get('email');
            let hash = this.hashCode(email);

            if (this.controller.get('name')) {  															//Check name field
                if (passLength) {																			//Check password length
                    if (this.controller.get('password') === this.controller.get('passwordConfirm')) {		//Check passwords match
                        if (regex) {																		//Check email with regex
                            if (customID) {																	//Check if user is using custom ID
                                this.store.findRecord('vendor', customID).then(() => {						//Check if ID exists already
                                    alert("User ID Already exists");
                                }, () => {
                                    this.store.find('vendorLogin', hash).then(() => {						//Check if email is in use
                                        alert("Email address already in use");
                                    }, () => {
                                        let vendorLogin = this.store.createRecord('vendorLogin', {			//Create vendorLogin record
                                            id: hash,
                                            email: email,
                                            password: this.controller.get('password')
                                        });
                                        vendorLogin.save().then(() => {										//Save vendorLogin
                                            let vendor = this.store.createRecord('vendor', {				//Create vendor record
                                                id: this.controller.get('customID'),
                                                name: this.controller.get('name'),
                                                email: this.controller.get('email'),
                                                desc: this.controller.get('desc'),
                                                addressL1: this.controller.get('addressL1'),
                                                addressL2: this.controller.get('addressL2'),
                                                city: this.controller.get('city'),
                                                postalcode: this.controller.get('postalcode'),
                                                cell: this.controller.get('cell')
                                            });
	                                        vendor.save().then(()=>	{										//Save vendor
	                                        	let _vendorid = vendor.get('id');										
	                                        	this.assignToUser(_vendorid);								//Add id to user
	                                        	vendorLogin.set('vendorID', _vendorid);						//Add id to vendorLogin
	                                        	vendorLogin.save();
	                                        });
                                        });
                                    });
                                });
                            } else {
                                this.store.find('vendorLogin', hash).then(() => {							//Check if email is in use
                                    alert("Email address already in use");
                                }, () => {
                                    let vendorLogin = this.store.createRecord('vendorLogin', {				//Create vendorLogin record
                                        id: hash,
                                        email: email,
                                        password: this.controller.get('password')
                                    });
                                    vendorLogin.save().then(() => {											//Save vendorLogin
                                        let vendor = this.store.createRecord('vendor', {					//Create vendor record
                                            name: this.controller.get('name'),
                                            email: this.controller.get('email'),
                                            desc: this.controller.get('desc'),
                                            addressL1: this.controller.get('addressL1'),
                                            addressL2: this.controller.get('addressL2'),
                                            city: this.controller.get('city'),
                                            postalcode: this.controller.get('postalcode'),
                                            cell: this.controller.get('cell')
                                        });
                                        vendor.save().then(()=>	{											//Save vendor
                                        	let _vendorid = vendor.get('id');												
                                        	this.assignToUser(_vendorid);									//Add id to user
                                        	vendorLogin.set('vendorID', _vendorid);							//Add id to vendorLogin
                                        	vendorLogin.save();
                                        });		
                                    });
                                });
                            }

                        } else {
                            alert("Not a valid email address");
                        }
                    } else {
                        alert("Passwords don't match");
                    }
                } else {
                    alert("Password not long enough");
                }

            } else {
                alert("Pls enter naem");
            }
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