'use strict';

/* Filters */

angular.module('starter.filters', [])
.filter('activeStatus', function() {
  return function(input) {
    //return input == 1 ? '\uf00c' : '\uf00d';
		return input == 1 ? '<i class="fa fa-check"></i>' : '<i class="fa fa-close"></i>';
  };
})
.filter('carivarStatus', function() {
  return function(input) {
    //return input == 1 ? '\uf00c' : '\uf00d';
    return input == 1 ? '<i class="fa fa-check"></i>' : '<i class="fa fa-close"></i>';
  };
})
.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=1; i<=total; i++)
      input.push(i);
    return input;
  };
})
.filter('pagination_total_item', function(){
  //{{(search.page_number-1)*search.item_per_page+1}} - {{ ((search.page_number-1)*items_per_page+items_per_page) > TotalItems ? TotalItems :  ((search.page_number-1)*items_per_page+items_per_page) }}/{{TotalItems}}
  return function(input, item_per_page, total) {
    var start = (input-1)*item_per_page+1;
    var end = (input-1)*item_per_page+item_per_page;
    return start + ' - ' + (end > total ? total : end) + ' / ' + total;
  };
})
.filter('searchSelected', function($rootScope, $location, $sessionStorage) {
  return function(input) {
    if (input != undefined && $sessionStorage.onsearch == true) {
      if (input.link_type && input.link_type == 'link') {
        var type = input.type!='caviar'?input.type:'photo';
        $location.path('/' + type + '/view/' + input.id);
        $sessionStorage.onsearch = false;
      } else if (input.link_type && input.link_type == 'separation') {
        $location.path('/search').search({in: input.type,keywords:input.keywords});
        $sessionStorage.onsearch = false;
      }
    }
    return '';
  };
});
