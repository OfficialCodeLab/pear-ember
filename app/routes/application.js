import Ember from 'ember';


export default Ember.Route.extend({
	vendorId: null,
	vendorAcc: null,
	vendorLog: null,
	beforeModel: function() {
        return this.get("session").fetch().catch(function() {});
    },
	model: function() {
		//check server for the record of self
		try
		{
			let _id = this.get("session").get('currentUser').providerData[0].uid + "";
			return this.store.findRecord('user', _id);			
		} catch(ex) {}
		
	    // return new Ember.RSVP.Promise(function(resolve) {
	    //   setTimeout(resolve, 3000);
	    // });
	},

	afterModel: function (model, transition) {
		Ember.$('.loading-overlay').fadeOut("fast");
	},
	actions: {
		toggleMenu: function () {
			if(this.controller.get('menuOpen')){
   				Ember.$('#menu-overlay').fadeOut("slow");
   				Ember.$('#menu-icon-c').fadeOut(0);
   				Ember.$('#menu-icon-o').fadeIn("fast");
				this.controller.toggleProperty('menuOpen');
				//console.log("TEST" + this.controller.menuOpen);
			} else{
   				Ember.$('#menu-overlay').fadeIn("slow");
   				Ember.$('#menu-icon-o').fadeOut(0);
   				Ember.$('#menu-icon-c').fadeIn("fast");
				this.controller.toggleProperty('menuOpen');
				//console.log("TEST" + this.controller);
			}
		},
		didTransition() {
			Ember.$('#menu-overlay').fadeOut("slow");
			Ember.$('#menu-icon-c').fadeOut(0);
			Ember.$('#menu-icon-o').fadeIn("fast");
			this.controller.set('menuOpen', false);
		},
		login: function(provider) {
			Ember.$('#s2-overlay3').fadeOut("fast");	
			let _that = this;
			let scope = "";

			if(provider === "facebook"){
				scope = 'public_profile,user_friends,user_birthday';
			}
	        this.get("session").open("firebase", { 
	        	provider: provider, 
	        	settings: {
	    			scope: scope,
				}
			}).then((data) => {
	    		//alert("Your id is: " + this.get("session").get('currentUser').providerData[0].uid);  
				this.store.findRecord('user', data.currentUser.providerData[0].uid).then((user)=>{

					if(!this.get('vendorId')){
						this.transitionTo('index');
						window.scrollTo(0,0);
						this.controller.get('notifications').info('Logged in successfully.',{
				          autoClear: true
			      		});
			      	} else {
			      		if(user.get('vendorAccount')){
	    					this.get('session').close().then(()=> {
					      		this.controller.get('notifications').error('Account already has vendor account!',{
						          autoClear: true
					      		});
					      	});
							this.transitionTo('login');
							this.set('vendorId', null);
						} else {
							this.joinAccounts(user);
						}
			      	}
				}, ()=> {					
					if(this.get('vendorId')){
						this.createVendor();	
					} else {
						this.controller.get('notifications').info('User account created.',{
				          autoClear: true
				      	});
						this.transitionTo('user.new');
					}
				});
			}, (error) => {
				this.controller.get('notifications').error('An error occured, please try again later.',{
				    autoClear: true
				});
          	});
	    },
	    logout: function() {
    	  this.transitionTo('logout');
	      // this.get("session").close();
	      // this.controller.get('notifications').info('Logged out successfully.',{
	      //     autoClear: true
	      // });
	      //this.transitionTo('login');
	    },
	    storeVendorId: function(id, vendor, vendorLogin){
	    	this.set('vendorId', id);
	    	this.set('vendorAcc', vendor);
	    	this.set('vendorLog', vendorLogin);
	    },
	    showId: function(){
	    	alert("Your id is: " + JSON.stringify(this.get("session").content.currentUser));
	    },
	    navigate: function(route){
	    	this.transitionTo(route);
	    },
	    navigateCat: function(){
	    	this.transitionTo("categories");
	    },
	    addFavourite: function(id){
	    	let user = this.store.peekRecord('user', this.get("session").get('currentUser').providerData[0].uid);
	    	let item = this.store.peekRecord('cat-item', id);
	    	user.get('favourites').pushObject(item);
	    	user.save();
	    },
	    removeFavourite: function(id){
	    	let user = this.store.peekRecord('user', this.get("session").get('currentUser').providerData[0].uid);
	    	let item = this.store.peekRecord('cat-item', id);
	    	user.get('favourites').removeObject(item);
	    	user.save();
	    },
	    error: function(error) {
	      Ember.Logger.error(error);
	      this.get("session").close();
      	  this.transitionTo('login');
	    },
	    notimplemented: function(){
	    	alert("Sorry this feature is still under contruction!");
	    },
	    showLogins: function(){
	    	if(this.controller.get('menuOpen')) {
   				Ember.$('#menu-overlay').fadeOut("slow");
   				Ember.$('#menu-icon-c').fadeOut(0);
   				Ember.$('#menu-icon-o').fadeIn("fast");
				this.controller.toggleProperty('menuOpen');
	    	}
			Ember.$('#s2-overlay3').fadeIn("fast");	    	
	    },
	    hideLogins: function(){
			Ember.$('#s2-overlay3').fadeOut("fast"); 
	    },
	    showModal: function(name, model) {
	      this.render(name, {
	        into: 'application',
	        outlet: 'modal',
	        model: model
	      });
	    },
	    removeModal: function() {
	    	try{
	      		this.send('cancel');
	    	} catch (ex){}
	      this.disconnectOutlet({
	        outlet: 'modal',
	        parentView: 'application'
	      });
	    },
	    openContactModal: function(vname, vemail){
	    	let contact = this.store.createRecord('contact');
	    	if (typeof vname !== 'undefined') { contact.set('vendor', vname); }
	    	if (typeof vemail !== 'undefined') { contact.set('vendorEmail', vemail); }
	    	this.controller.set("messageN", contact);
	    	this.send('showModal', 'modal-contact', contact);
	    },
	    closeContactModal: function(){
	    	this.send('removeModal');
	    	let contact = this.controller.get("messageN");
	    	if(contact !== ''){
	    		contact.deleteRecord();
	    	}
	    	this.controller.set("messageN", "");
	    },
	    storeTransition: function (){

	    },
	    captchaStore: function(val){
	    	this.controller.set('captchaVerified', val);
	    },
	    ok: function(){
	    	 // this.transitionTo(this.controller.get('transition'));
	    },
	    submit: function(){
	    	let contact = this.controller.get("messageN");
	    	this.controller.set("messageN", "");
	    	let user_id;
	    	let email = contact.get('email');
	    	let message = contact.get('message');
	    	let subject;
	    	let to;
	    	if(email === null || email === '' || email === undefined){
	    		this.controller.get('notifications').error('Invalid email address',{
				    autoClear: true
				});
	    		contact.deleteRecord();
	    	} else if (message === null || message === '' || message === undefined) {
	    		this.controller.get('notifications').error('Please enter a message of 5 characters or more.',{
				    autoClear: true
				});
	    		contact.deleteRecord();
	    	} else {
				if (this.get("session").get('currentUser') !== undefined){
					user_id = this.get("session").get('currentUser').providerData[0].uid;
				} else {
					user_id = "Anonymous user";
				}				
		    	if (contact.get('subject')){
					subject = contact.get('subject');
		    	} else {
		    		subject = "New Contact request from " + contact.get('email');
		    	}
		    	if (contact.get('vendorEmail')){
		    		to = contact.get('vendorEmail');
		    	} else {
		    		to = "info@codelab.io";
		    	}
				if (this.controller.get('captchaVerified')) {
					let message = this.store.createRecord('message', {
					  to: to,
					  from: contact.get('email'),
					  subject: subject,
					  html: contact.get('message'),
					  senderId: user_id
					});
					message.save();

					contact.save().then(() => {
					  this.controller.get('notifications').info('Message sent successfully!',{
					    autoClear: true
					  });
	    			  contact.deleteRecord();
					});
				} else {
					this.controller.get('notifications').error('CAPTCHA form invalid!',{
					    autoClear: true
					});
	    			contact.deleteRecord();
				}
	    		
	    	}
	    }
	    // loading: function(transition, originRoute) {
		   // //this.controller.set('currentlyLoading', true);
		   // let controller = this.controllerFor('loading');
		   // alert("loading: " + controller.get('model').get('currentlyLoading'));
	    //   // displayLoadingSpinner();

	    //   // Return true to bubble this event to `FooRoute`
	    //   // or `ApplicationRoute`.
	    //   transition.promise.finally(function() {
		   // controller.set('currentlyLoading', false);
		   // alert("loading: " + controller.get('currentlyLoading'));
	    //   });
	    // }
	



		/*
		login: function (provider){	
			var ref = new Firebase("https://pear-server.firebaseio.com");
			ref.authWithOAuthPopup(provider, function(error, authData) {
			  if (error) {
			    console.log("Login Failed!", error);
			  } else {
			    // the access token will allow us to make Open Graph API calls
			    console.log("LOGGED IN AS: " + authData.name);
			  }
			});		
		    // this.get("session").open("firebase", { provider: provider}).then((data) => {
		    //   this.transitionTo('index');
		  //}); 
		}*/
		// login: function(provider) {
  //   	  this.get("session").open("firebase", { provider: provider}).then((data) => {
  //         console.log("LOGGED IN AS: " + data.name);
	 //      });
	 //    },
	 //    logout: function() {
	 //      this.get("session").close();
	 //      this.transitionTo('index');
	 //    }
	},

	    createVendor: function(){
	    	let _id = this.get("session").get('currentUser').providerData[0].uid;
	    	let vendor = this.get('vendorAcc');
	    	let vendorLogin = this.get('vendorLog');
        	let full_name = this.get("session").get('currentUser').providerData[0].displayName;
        	let x = full_name.indexOf(" ");
        	let name = full_name.substring(0, x);
        	let surname = full_name.substring(x+1, full_name.length);
			var user = this.store.createRecord('user', {
			  name: name,
			  surname: surname,
			  id: _id,
			  vendorAccount: this.get('vendorId')
			});				

			let wedding = this.store.createRecord('wedding', 
				{
					id: _id,
					user: user
				}
			);
			user.get('wedding').pushObject(wedding);

			wedding.save().then(() => {
				vendor.save().then(()=>{
					vendorLogin.save().then(()=>{
						user.save().then(()=>{
							this.transitionTo('index');
							this.controller.get('notifications').info('Vendor account created.',{
					          autoClear: true
					      	});
					    });
					});
				});
			});
	    },
	    joinAccounts: function(user){
	    	let vendor = this.get('vendorAcc');
	    	let vendorLogin = this.get('vendorLog');
	    	let _vendorid = this.get('vendorId');
	    	vendorLogin.set('vendorID', _vendorid);
	    	user.set('vendorAccount', _vendorid);
			vendor.save().then(()=>{
				vendorLogin.save().then(()=>{
					user.save().then(()=>{
						this.transitionTo('index');
						this.controller.get('notifications').info('Vendor account created.',{
				          autoClear: true
				      	});
				    });
				});
			});
	    },
	
	/*setupController: function(controller, model) {
		this.controller.set('menuOpen', false)
		console.log("TEST" + this.controller.get('menuOpen'));
		Ember.$('#menu-overlay').fadeOut("slow");
		

  	}*/
});
