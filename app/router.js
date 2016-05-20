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
  this.route('myaccount');
  this.route('not-found', { path: '/*path' });
  this.route('index', {path: '/' }, function() {
    this.route('favourites', {path: '/' });
    this.route('mywedding');
    this.route('item-single');
  });
  this.route('admin', {path:'/admin'}, function() {
    this.route('requests');
    this.route('messages');
    this.route('users');
    this.route('vendors');
    this.route('cat-items');
  });
});

export default Router;
