import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import utilsPagination from 'angular-utils-pagination';

import { Counts } from 'meteor/tmeasday:publish-counts';

import template from './partiesList.html';
import { Parties } from '../../../api/parties';
import { name as PartiesSort } from '../partiesSort/partiesSort';
import { name as PartiesMap } from '../partiesMap/partiesMap';
import { name as PartyAddButton } from '../partyAddButton/partyAddButton';
import { name as PartyRemove } from '../partyRemove/partyRemove';
import { name as PartyCreator } from '../partyCreator/partyCreator';
import { name as PartyRsvp } from '../partyRsvp/partyRsvp';
import { name as PartyRsvpsList } from '../partyRsvpsList/partyRsvpsList';
import { name as PartyImage } from '../partyImage/partyImage';

class PartiesList {
  constructor($scope, $reactive) {
    'ngInject';

    $reactive(this).attach($scope);

    this.fields = ['Name', 'State', 'Page'];
    this.firstField = {criteria: 'Page', order: 0};
    this.fieldsSelected = [{criteria: 'Page', order: 0}];
    this.perPage = 3;
    this.page = 1;
    this.sort = {
      name: 1
    };
    this.searchText = '';

    this.subscribe('parties', () => [{
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sort')
      }, this.getReactively('searchText')
    ]);

    this.subscribe('users');
    this.subscribe('images');

    this.helpers({
      parties() {
        return Parties.find({}, {
          sort : this.getReactively('sort')
        });
      },
      partiesCount() {
        return Counts.get('numberOfParties');
      },
      isLoggedIn() {
        return !!Meteor.userId();
      },
      currentUserId() {
        return Meteor.userId();
      }
    });
  }

  isOwner(party) {
    return this.isLoggedIn && party.owner === this.currentUserId;
  }

  pageChanged(newPage) {
    this.page = newPage;
  }

  sortChanged(sort) {
    this.sort = sort;
  }

  getSelected(pos) {
    const _this = this;
    return function(field) {
      const selected = _this.fieldsSelected[pos] || {};
      const value = field ? (selected.criteria = field) : selected.criteria;
      if (field) {
        console.log(_this.fieldsSelected);
      }
      return value;
    }
  }

  firstCriteria(pos) {
    const value = field ? (this.firstField.criteria = field) : this.firstField.criteria;
    if (field) {
      console.log(this.firstField);
    }
    return value;
  }

  firstOrder(order) {
    return typeof(order) == 'number'  ? (this.firstField.order = order) : this.firstField.order;
  }

  getFields(pos) {
    const self = this;
    const selecteds = this.fieldsSelected.map(function(item) {return item.criteria;})
    return this.fields.filter(function(item) {
      return selecteds.indexOf(item) < 0;
    });
  }
}

const name = 'partiesList';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  utilsPagination,
  PartiesSort,
  PartiesMap,
  PartyAddButton,
  PartyRemove,
  PartyCreator,
  PartyRsvp,
  PartyRsvpsList,
  PartyImage
]).component(name, {
  template,
  controllerAs: name,
  controller: PartiesList
})
  .config(config);

function config($stateProvider) {
  'ngInject';
  $stateProvider
    .state('parties', {
      url: '/parties',
      template: '<parties-list></parties-list>'
    });
}
