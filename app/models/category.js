import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  imageURL: attr('string'),
  desc: attr('string'),
  style: attr('string'),
  icon: attr('string'),
  iconName: attr('string'),
  catItems: hasMany('cat-item', {inverse: 'category', async: true})
});
