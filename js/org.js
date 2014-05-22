/* global d3, _, console, window */
(function () {
  'use strict';

  var width = 960;
  var height = 550;

  var rectW = width/3;
  var rectSmallW = width/4;
  var rectH = 100;

  var sep = 25;

  var pos = {
    'Fiduciary': {
      x: width/3,
      y: sep,
      width: rectW,
      height: rectH
    },
    'C-Level': {
      x: width/3,
      y: sep + rectH + sep,
      width: rectW,
      height: rectH
    },

    'Highly Integrated': {
      x: width * 0.20,
      y: sep + rectH + sep + rectH + sep,
      width: rectSmallW,
      height: rectH
    },
    'Operational Delivery': {
      x: width * 0.55,
      y: sep + rectH + sep + rectH + sep,
      width: rectSmallW,
      height: rectH
    },

    'Facilities': {
      x: width/3,
      y: sep + rectH + sep + rectH + sep + rectH + sep,
      width: rectW,
      height: rectH
    },
  };

  d3.json('data/orgchart.json', function (json) {
    var people = json.People;

    var peopleByType = _.groupBy(people, 'Type');

    people.map(function (person) {
      var idx = peopleByType[person.Type].indexOf(person);
      console.log('idx', idx);
      person.x = pos[person.Type].x + 20;
      person.y = pos[person.Type].y + 40 + idx * 16;
      //console.log('person', person);
    });

    var relationships = json.Relationships;

    var orgchart = [];
    var types = _.unique(_.pluck(people, 'Type'));
    //console.log(types);

    //console.log('peopleByType', peopleByType);

    types.map(function (type) {
      if (!pos[type]) {
        return;
      }

      orgchart.push({
        type: type,
        people: peopleByType[type],
        x: pos[type].x,
        y: pos[type].y,
        width: pos[type].width,
        height: pos[type].height
      });
    });

    var emptyTypes = ['Highly Integrated'];

    emptyTypes.map(function (type) {
      orgchart.push({
        type: type,
        people: [],
        x: pos[type].x,
        y: pos[type].y,
        width: pos[type].width,
        height: pos[type].height
      });
    });

    console.log('orgchart', orgchart);
    //console.log('orgchart', orgchart[0]);

    var svg = d3.select('#viz').append('svg')
      .attr('width', width)
      .attr('height', height);

    var rectGroup = svg.selectAll('g')
      .data(orgchart).enter()
      .append('g')
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    rectGroup
      .append('rect')
      .attr('width', function (d) { return d.width; })
      .attr('height', function (d) { return d.height; })
      .attr('rx', 10)
      .style('fill', 'none')
      .style('stroke', '#777');

    rectGroup
      .append('text')
      .attr('x', 20)
      .attr('y', 20)
      .style('font-weight', 'bold')
      .text(function (d) {
        return d.type;
      });


    types.map(function (type) {
      console.log(type, peopleByType[type]);
      var peopleGroup = svg.append('g')
        .attr('class', 'people')

      peopleGroup
        .selectAll('text')
        .data(peopleByType[type]).enter()
        .append('text')
        .attr('x', function (d) {
          return d.x;
        })
        .attr('y', function (d) {
          return d.y;
        })
        .text(function (d) {
          return d.Name;
        });
    });


  });
})();
