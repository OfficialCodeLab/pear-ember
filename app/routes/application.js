import Ember from 'ember';
import moment from 'moment';
// import ResetScroll from 'pear/mixins/reset-scroll';

export default Ember.Route.extend({
  vendorId: null,
  vendorAcc: null,
  emailStored: null,
  passwordStored: null,
  vendorLog: null,
  vendorStatsId: null,
  isTodoSubmitted: null,
  isOverlay: false,
  metrics: Ember.inject.service(),
  firebaseApp: Ember.inject.service(),
  // uid: Ember.inject.service(),
  beforeModel: function() {
    return this.get("session").fetch().catch(function() {});

  },
  model: function() {
    let _this = this;
      //Filthy hackaround for password authentication ;)
      try {
        if (!_this.get('session.isAuthenticated')) {} else {
          return _this.generateUid().then((session) => {
            let _id = this.get("currentUser.uid") + "";
            return this.store.findRecord('user', _id);
          }, () => {
            this.transitionTo('logout');
          });

        }
      } catch (ex) {}

    //check server for the record of self
    // try {
    //   let _id = this.get("currentUser.uid") + "";
    //   return this.store.findRecord('user', _id);
    // } catch (ex) {}

    // return new Ember.RSVP.Promise(function(resolve) {
    //   setTimeout(resolve, 3000);
    // });
  },


  afterModel: function(model, transition) {
    Ember.$('.loading-overlay').fadeOut("fast");
  },
  actions: {
    toggleMenu: function() {
      if (this.controller.get('menuOpen')) {
        Ember.$('#menu-overlay').fadeOut("slow");
        Ember.$('#menu-icon-c').fadeOut(0);
        Ember.$('#menu-icon-o').fadeIn("fast");
        this.controller.toggleProperty('menuOpen');
        //console.log("TEST" + this.controller.menuOpen);
      } else {
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
      Ember.$('#s2-overlay4').fadeOut("fast");
      let email = "";
      let password = "";
      let _this = this;
      let scope = "";

      if (provider === "facebook") {
        scope = 'public_profile,user_friends,user_birthday,email';
      } else if (provider === "password") {
        email = this.get('emailStored');
        password = this.get('passwordStored');
      }
      this.get("session").open("firebase", {
        provider: provider,
        email: email,
        password: password,
        settings: {
          scope: scope,
        }
      }).then((data) => {
        _this.completeLogin(data);
      }, (error) => {
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/operation-not-supported-in-this-environment') {
          _this.loginRedirect(provider, scope);
        } else {
          _this.resetVendorSignup();
          _this.controller.get('notifications').error(errorMessage, {
            autoClear: true
          });
        }
      });
    },
    createAccount: function(provider) {
      Ember.$('#s2-overlay4').fadeOut("fast");
      let _this = this;
      let email = this.get('emailStored');
      let password = this.get('passwordStored');
      let firebase = this.get('firebaseApp');

      if (provider === "password") {
        firebase.auth().createUserWithEmailAndPassword(email, password).then((data) => {
          var user = firebase.auth().currentUser;
          this.logInWithEmail(email, password);
          //_this.get('session').set('currentUser', data);
          //...
        }).catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(error);
          if (errorCode === 'auth/email-already-in-use') {
            //Log in instead
            _this.logInWithEmail(email, password);
          } else {
            _this.resetVendorSignup();
            _this.controller.get('notifications').error(errorMessage, {
              autoClear: true
            });
          }
          // ...
        });
      }
    },
    loadSignupPage: function() {
      Ember.$('#s2-overlay3').fadeOut("fast");
      Ember.$('#s2-overlay4').fadeOut("fast");
      this.transitionTo('user-signup');
    },
    logout: function() {
      this.transitionTo('logout');
      // this.get("session").close();
      // this.controller.get('notifications').info('Logged out successfully.',{
      //     autoClear: true
      // });
      //this.transitionTo('login');
    },
    storeVendorId: function(id, vendor, vendorLogin) {
      this.set('vendorId', id);
      this.set('vendorAcc', vendor);
      this.set('vendorLog', vendorLogin);
    },
    storeEmailPass: function(email, pass) {
      this.set('emailStored', email);
      this.set('passwordStored', pass);
    },
    storeModalValueData: function(id) {
      this.controller.set('modelValueDataId', id);
    },
    storeVendorStatsId: function(vendorStatsId) {
      this.set('vendorStatsId', vendorStatsId);
    },
    showId: function() {
      alert("Your id is: " + JSON.stringify(this.get("session").content.currentUser));
    },
    navigate: function(route) {
      this.transitionTo(route);
    },
    navigateCat: function() {
      this.transitionTo("categories");
    },
    addFavourite: function(id) {
      let _id = this.get("currentUser.uid");
      let user = this.store.peekRecord('user', _id);
      let item = this.store.peekRecord('cat-item', id);
      let vendor = item.get('vendor');
      user.get('favourites').pushObject(item);
    },
    removeFavourite: function(id) {
      let user = this.store.peekRecord('user', this.get("currentUser.uid"));
      let item = this.store.peekRecord('cat-item', id);
      user.get('favourites').removeObject(item);
      user.save();
    },
    error: function(error) {
      Ember.Logger.error(error);
      this.get("session").close();
      this.transitionTo('login');
      this.controller.get('notifications').error("Please contact support with this error: " + error);
    },
    notimplemented: function() {
      alert("Sorry this feature is still under contruction!");
    },
    showLogins: function() {
      if (this.controller.get('menuOpen')) {
        Ember.$('#menu-overlay').fadeOut("slow");
        Ember.$('#menu-icon-c').fadeOut(0);
        Ember.$('#menu-icon-o').fadeIn("fast");
        this.controller.toggleProperty('menuOpen');
      }
      Ember.$('#s2-overlay3').fadeIn("fast");
    },
    hideLogins: function() {
      Ember.$('#s2-overlay3').fadeOut("fast");
    },
    showVendorLogins: function() {
      if (this.controller.get('menuOpen')) {
        Ember.$('#menu-overlay').fadeOut("slow");
        Ember.$('#menu-icon-c').fadeOut(0);
        Ember.$('#menu-icon-o').fadeIn("fast");
        this.controller.toggleProperty('menuOpen');
      }
      Ember.$('#s2-overlay4').fadeIn("fast");
    },
    hideVendorLogins: function() {
      this.resetVendorSignup();
      Ember.$('#s2-overlay4').fadeOut("fast");
    },
    showModal: function(name, model) {
      this.render(name, {
        into: 'application',
        outlet: 'modal',
        model: model
      });
    },

    saveValue(){
      this.set('isSavingValue', true);
      let dataId = this.controller.get('modelValueDataId');
      let data = this.store.peekRecord('edit-value-modal', dataId);
      let item = this.store.peekRecord(data.get('type'), data.get('_id'));
      item.set(data.get('field'), data.get('value'));
      item.save().then(()=>{
        this.set('isSavingValue', false);
        data.deleteRecord();
        this.send('removeModal');
      });
    },
    closeEditValue() {
      if(this.get('isSavingValue') === false) { //Clear Dirty Model
        let dataId = this.controller.get('modelValueDataId');
        let data = this.store.peekRecord('edit-value-modal', dataId);
        data.deleteRecord();
      }
      this.send('removeModal');
    },
    priceClickTest: function() {
      let metrics = Ember.get(this, 'metrics');
      metrics.trackEvent('Mixpanel', {
        'event': 'Price Click',
        'custom-property1': 'test',
        'custom-property2': 'test1',
      });
      metrics.trackEvent('GoogleAnalytics', {
        // (required) The name you supply for the group of objects you want to track.
        category: 'ui-interaction',
        // (required) A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object.
        action: 'Price Click',
        // (optional) string to provide additional dimensions to the event data.
        label: 'copied-deeplink',
        // (optional) An integer that you can use to provide numerical data about the user event.
        value: 1,
        // (optional) boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
        //noninteraction: false
      });
    },
    removeModal: function() {
      try {
        this.send('cancel');
      } catch (ex) {}
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    },
    openContactModal: function(vname, vemail, vid) {
      let contact = this.store.createRecord('contact');
      if (this.get('session.isAuthenticated')) {
        let user = this.store.peekRecord('user', this.get("currentUser.uid"));
        contact.set('email', user.get('email'));
      }
      if (typeof vname !== 'undefined') {
        contact.set('vendor', vname);
      }
      if (typeof vemail !== 'undefined') {
        contact.set('vendorEmail', vemail);
      }
      if (typeof vid !== 'undefined') {
        contact.set('vendorId', vid);
        contact.set('sendInfo', true);
        contact.set('subject', 'New contact request from Bloom User');
      }
      this.controller.set("messageN", contact);
      this.send('showModal', 'modal-contact', contact);
    },
    closeContactModal: function() {
      this.send('removeModal');
      let contact = this.controller.get("messageN");
      if (contact !== '') {
        contact.deleteRecord();
      }
      this.controller.set("messageN", "");
    },
    openTodoModal: function(task) {
      this.send('showModal', 'modal-todo', task);
    },
    closeTodoModal: function() {
      //Clean up dirty attributes
      // if(this.get('isTodoSubmitted') === false){
      //   		let task = this.controller.get('taskCurrent');
      //   		if(task.get('createdOn')){
      //   			task.rollbackAttributes();
      //   		} else {
      //   			task.deleteRecord();
      //   		}
      //   	}
      // this.set('isTodoSubmitted', false);
      this.send('removeModal');
    },
    openGuestModal: function(guest) {
      this.set('isGuestSubmitted', false);
      this.send('showModal', 'modal-guest-edit', guest);
    },
    closedGuestModal: function() {
      // if(this.get('isGuestSubmitted') === false){
      // let guest = this.get('sotredGuest');
      // guest.rollbackAttributes();
      this.send('removeModal');
      // }
    },
    storeTransition: function() {

    },
    captchaStore: function(val) {
      this.controller.set('captchaVerified', val);
    },
    ok: function() {
      // this.transitionTo(this.controller.get('transition'));
    },
    submit: function() {
      let _this = this;
      let contact = this.controller.get("messageN");
      this.controller.set("messageN", "");
      let user_id;
      let email = contact.get('email');
      let message = contact.get('message');
      let subject;
      let to;
      if (email === null || email === '' || email === undefined) {
        this.controller.get('notifications').error('Invalid email address', {
          autoClear: true
        });
        contact.deleteRecord();
      } else if (message === null || message === '' || message === undefined) {
        this.controller.get('notifications').error('Please enter a message of 5 characters or more.', {
          autoClear: true
        });
        contact.deleteRecord();
      } else {
        if (this.get("session").get('currentUser') !== undefined) {
          user_id = this.get("currentUser.uid");
        } else {
          user_id = "Anonymous user";
        }
        if (contact.get('subject')) {
          subject = contact.get('subject');
        } else {
          subject = "New Contact request from " + contact.get('email');
        }
        if (contact.get('vendorEmail')) {
          to = contact.get('vendorEmail');
        } else {
          // to = "support@bloomweddings.co.za";
        }
        if (this.controller.get('captchaVerified')) {
          let message = this.store.createRecord('message', {
            to: to,
            from: contact.get('email'),
            subject: subject,
            html: contact.get('message'),
            senderId: user_id,
            sendInfo: this.get("session").get('currentUser') ? contact.get('sendInfo') : false
          });
          message.save();

          // contact.save().then(() => {
          //this.trackEvent('contact', 'send', contact.get('email'), 1);
          this.controller.get('notifications').info('Message sent successfully!', {
            autoClear: true
          });


          _this.storeContactRequest(contact.get('vendorId'), contact.get('vendorEmail'), user_id);

          if (to) { //Send to Bloom Support
            contact.save();
          } else {
            contact.deleteRecord();
          }
          // });
        } else {
          this.controller.get('notifications').error('CAPTCHA form invalid!', {
            autoClear: true
          });
          contact.deleteRecord();
        }

      }
    },
    storeContactInfoRequest: function(vendorId, userId) {
      let metrics = Ember.get(this, 'metrics');
      metrics.trackEvent('GoogleAnalytics', {
        // (required) The name you supply for the group of objects you want to track.
        category: vendorId,
        // (required) A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object.
        action: 'Contact Info Request',
        // (optional) string to provide additional dimensions to the event data.
        label: userId,
        // (optional) An integer that you can use to provide numerical data about the user event.
        value: 1
        // (optional) boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
        //noninteraction: false
      });
      metrics.trackEvent('Mixpanel', {
        'event': 'Contact Info Request',
        'custom-property1': vendorId,
        'custom-property2': userId
      });
    },
    storeVendorProfileVisited: function(vendorId, userId) {
      let metrics = Ember.get(this, 'metrics');
      metrics.trackEvent('GoogleAnalytics', {
        // (required) The name you supply for the group of objects you want to track.
        category: vendorId,
        // (required) A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object.
        action: 'Visited Vendor Profile',
        // (optional) string to provide additional dimensions to the event data.
        label: userId,
        // (optional) An integer that you can use to provide numerical data about the user event.
        value: 1
        // (optional) boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
        //noninteraction: false
      });
      metrics.trackEvent('Mixpanel', {
        'event': 'Visited Vendor Profile',
        'custom-property1': vendorId,
        'custom-property2': userId
      });
    },
    storeWebsiteClick: function(vendorId, userId) {
        let prop = "Website visited by: " + userId;
        let metrics = Ember.get(this, 'metrics');
        metrics.trackEvent('GoogleAnalytics', {
          // (required) The name you supply for the group of objects you want to track.
          category: vendorId,
          // (required) A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object.
          action: 'Website Visit',
          // (optional) string to provide additional dimensions to the event data.
          label: prop,
          // (optional) An integer that you can use to provide numerical data about the user event.
          value: 1
          // (optional) boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
          //noninteraction: false
        });
        metrics.trackEvent('Mixpanel', {
          'event': 'Website Visit',
          'custom-property1': vendorId,
          'custom-property2': prop
        });
    },
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
  }, //ACTIONS
  storeContactRequest: function(vendorId, vendorEmail, userId) {
    let prop = vendorEmail + " contacted by: " + userId;
    let metrics = Ember.get(this, 'metrics');
    metrics.trackEvent('GoogleAnalytics', {
      // (required) The name you supply for the group of objects you want to track.
      category: vendorId,
      // (required) A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object.
      action: 'Contact Request',
      // (optional) string to provide additional dimensions to the event data.
      label: prop,
      // (optional) An integer that you can use to provide numerical data about the user event.
      value: 1
      // (optional) boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation.
      //noninteraction: false
    });
    metrics.trackEvent('Mixpanel', {
      'event': 'Contact Request',
      'custom-property1': vendorId,
      'custom-property2': prop
    });
  },
  logInWithEmail: function(email, password) {
    let _this = this;
    _this.get("session").open("firebase", {
      provider: "password",
      email: email,
      password: password
    }).then((d) => {
      _this.store.findRecord('user', this.get('session.currentUser').uid).then((user) => {
        user.get('vendorAccount').then((ven) => {
          if (ven === null || ven === undefined) {
            // _this.generateUid().then(()=>{
            	_this.joinAccounts(user);
						// });
          } else {
            _this.get('session').close().then(() => {
              _this.resetVendorSignup();
              _this.controller.get('notifications').error('Account already has vendor account!', {
                autoClear: true
              });
            });
            _this.set('vendorId', null);
          }
        }, () => {
          _this.resetVendorSignup();
          _this.controller.get('notifications').error('An unknown error occurred. Please contact support.', {
            autoClear: true
          });
        });
      }, () => {
        if (_this.get('vendorId')) {
          _this.createVendor(d.uid);
        } else {
          // _this.generateUid().then(()=>{
	          _this.controller.get('notifications').info('User account created.', {
	            autoClear: true
	          });
	          _this.transitionTo('user.new');
					// });
        }
      });

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      _this.resetVendorSignup();
      _this.controller.get('notifications').error(errorMessage, {
        autoClear: true
      });
      // ...
    });
  },
  resetVendorSignup: function() {
    this.store.unloadAll();
    try {
      this.controllerFor('vendor-signup').set('isCreating', false);
    } catch (ex) {}
  },
  generateUid: function() {
    let _this = this;
    return new Promise(function(resolve, reject) {
      if (_this.get("session.currentUser")) {
        let provData = _this.get("session.currentUser").providerData[0];
				let _uid;
        if (_this.get("session.provider") === "password") {
					_uid =  _this.get("session.currentUser").uid;
          Ember.set(provData, '_uid', _uid);
        } else {
					_uid =  _this.get("session.currentUser").providerData[0].uid;
          Ember.set(provData, '_uid', _uid);
        }
        resolve(_this.get("session"));
      } else {
        _this.get('session').close().then(() => {
          reject();
        });
      }
    });
  },
  updateUser: function(name) {
    let _this = this;
    let firebase = this.get('firebaseApp');
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
      //Updated
    }, function(error) {
      // An error happened.
    });
  },
  sendVerificationEmail: function() {
    let firebase = this.get('firebaseApp');
    var user = firebase.auth().currentUser;

    user.sendEmailVerification().then(function() {
      // Email sent.
    }, function(error) {
      // An error happened.
    });
    // Update successful.
  },
  completeLogin(data) {
    let _this = this;
    // this.generateUid().then((session) => {
      _this.store.findRecord('user', this.get('currentUser.uid')).then((user) => {
        if (!_this.get('vendorId')) {
          _this.transitionTo('index');
          window.scrollTo(0, 0);
          _this.controller.get('notifications').info('Logged in successfully.', {
            autoClear: true
          });
        } else {
          user.get('vendorAccount').then((ven) => {
            if (ven === null || ven === undefined) {
              _this.joinAccounts(user);
            } else {
              _this.get('session').close().then(() => {
                _this.resetVendorSignup();
                _this.controller.get('notifications').error('Account already has vendor account!', {
                  autoClear: true
                });
              });
              _this.transitionTo('login');
              _this.set('vendorId', null);
            }
          }, () => {});
        }
      }, () => {
        if (_this.get('vendorId')) {
          _this.createVendor();
        } else {
          _this.controller.get('notifications').info('User account created.', {
            autoClear: true
          });
          _this.generateUid().then(() => {
            _this.transitionTo('user.new');
          });
        }
      });


    // });
  },
  loginRedirect: function(provider, scope) {
    let _this = this;
    this.get('session').open('firebase', {
      provider: provider,
      redirect: true,
      settings: {
        scope: scope
      }
    }).then(function(result) {
      _this.completeLogin(result);
    }, function(error) {
      console.log(error);
      var errorCode = error.code;
      var errorMessage = error.message;
      _this.resetVendorSignup();
      _this.controller.get('notifications').error(errorMessage, {
        autoClear: true
      });
    });
  },

  createVendor: function(uniqueID) {
    this.generateUid().then(() => {

      let _id = uniqueID || this.get("currentUser.uid");
      let _vendorStats = this.store.peekRecord('vendorStat', this.get('vendorStatsId'));
      let vendor = this.get('vendorAcc');
      let vendorLogin = this.get('vendorLog');
      let nameVen;
      if (uniqueID) {
        nameVen = _vendorStats.get('repName');
      }
      let full_name = nameVen || this.get("session").get('currentUser').providerData[0].displayName;
      let x = full_name.indexOf(" ");
      let name = full_name.substring(0, x);
      let surname = full_name.substring(x + 1, full_name.length);
      this.updateUser(full_name);
      var user = this.store.createRecord('user', {
        name: name,
        surname: surname,
        id: _id,
        email: vendor.get('email'),
        cell: vendor.get('cell'),
        vendorAccount: vendor,
        mustTourWedding: true,
        mustTourFavourites: true,
        mustTourVendor: true,
        accountType: "vendor",
        created: moment()
      });

      let wedding = this.store.createRecord('wedding', {
        id: _id,
        user: user
      });


      let vendorStats = this.store.createRecord('vendorStat', {
        id: this.get('vendorId'),
        createdBy: _id,
        //Populate from other vendor stats model
        willingToTravel: _vendorStats.get('willingToTravel'),
        maxTravelDist: _vendorStats.get('maxTravelDist'),
        categories: _vendorStats.get('categories'),
        servicesDesc: _vendorStats.get('servicesDesc'),
        repName: _vendorStats.get('repName'),
        vatNum: _vendorStats.get('vatNum'),
        website: _vendorStats.get('website'),
        monthlyAnalytics: _vendorStats.get('monthlyAnalytics'),
        montlyNewsletter: _vendorStats.get('montlyNewsletter'),
        willContribute: _vendorStats.get('willContribute')
      });

      //need to save

      user.get('wedding').pushObject(wedding);

      wedding.save().then(() => {
        vendor.save().then(() => {
          vendorLogin.save().then(() => {
            user.save().then(() => {
              vendorStats.save().then(() => {
                this.transitionTo('index.vendor');
                this.sendVerificationEmail();
                this.controller.get('notifications').info('Vendor account created.', {
                  autoClear: true
                });
              });
            });
          });
        });
      });

    });
  },
  joinAccounts: function(user) {
    let _id = user.id;
    let vendor = this.get('vendorAcc');
    let vendorLogin = this.get('vendorLog');
    let _vendorid = this.get('vendorId');
    vendorLogin.set('vendorID', _vendorid);
    user.set('vendorAccount', vendor);
    user.set('accountType', "vendor");

    let _vendorStats = this.store.peekRecord('vendorStat', this.get('vendorStatsId'));

    let vendorStats = this.store.createRecord('vendorStat', {
      id: this.get('vendorId'),
      createdBy: _id,
      //Populate from other vendor stats model
      willingToTravel: _vendorStats.get('willingToTravel'),
      maxTravelDist: _vendorStats.get('maxTravelDist'),
      categories: _vendorStats.get('categories'),
      servicesDesc: _vendorStats.get('servicesDesc'),
      repName: _vendorStats.get('repName'),
      vatNum: _vendorStats.get('vatNum'),
      website: _vendorStats.get('website'),
      monthlyAnalytics: _vendorStats.get('monthlyAnalytics'),
      montlyNewsletter: _vendorStats.get('montlyNewsletter'),
      willContribute: _vendorStats.get('willContribute')
    });
    vendor.save().then(() => {
      vendorLogin.save().then(() => {
        user.save().then(() => {
          vendorStats.save().then(() => {
            this.transitionTo('index.vendor');
            this.controller.get('notifications').info('Vendor account created.', {
              autoClear: true
            });
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
