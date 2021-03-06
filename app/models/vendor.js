
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  desc: attr('string'),
  email: attr('string'),
  company: attr('string'),
  region: attr('string'),
  addressL1: attr('string'),
  addressL2: attr('string'),
  city: attr('string'),
  country: attr('string'),
  postalcode: attr('string'),
  province: belongsTo('province'),
  website: attr('string'),
  cell: attr('string'),
  personalCell: attr('string'),
  maxItems: attr('string'),
  backgroundImage: attr('string'),
  brandImage: attr('string'),
  catItems: hasMany('cat-item', {inverse: 'vendor', async: true}),
  loggedInUsers: hasMany('user', {inverse: 'vendorAccount', async: true}),
});
