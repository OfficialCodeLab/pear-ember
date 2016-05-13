import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('about');
  this.route('home');
  this.route('categories');
  this.route('user', function() {
    this.route('new', {path: '/new'});
    this.route('account', {path: '/:user_id'});
  });
});

export default Router;
