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

    'Our Connections': {
      x: sep,
      y: sep + rectH + sep + rectH + sep + rectH + sep,
      width: rectSmallW,
      height: rectH
    },

    'Notes': {
      x: width * 2/3 + sep,
      y: sep,
      width: rectSmallW,
      height: rectH
    },

    'Partners': {
      x: sep,
      y: sep,
      width: rectSmallW,
      height: rectH
    },

    'Legend': {
      x: width * 2/3 + sep,
      y: sep + rectH + sep + rectH + sep + rectH + 20,
      width: rectSmallW + 40,
      height: rectH + 50
    }
  };

  d3.json('data/orgchart.json', function (json) {
    var people = json.People;

    var peopleByType = _.groupBy(people, 'Type');

    people.map(function (person) {
      var idx = peopleByType[person.Type].indexOf(person);
      person.x = pos[person.Type].x + 20;
      person.y = pos[person.Type].y + 40 + idx * 16;
    });

    var relationships = json.Relationships;
    console.log('relationships', relationships);
    window.relationships = relationships;
    window.people = people;

    var us = _.unique(_.pluck(relationships, 'Us'));
    var relationshipsByUs = _.groupBy(relationships, 'Us');

    var ourPeople = [];
    us.map(function (name) {
      ourPeople.push({
        Name: name,
        Type: 'Our Connections',
        Relationships: relationshipsByUs[name]
      });
    });

    ourPeople.map(function (person) {
      var idx = ourPeople.indexOf(person);
      //person.x = pos[person.Type].x + 20;
      //person.y = pos[person.Type].y + 40 + idx * 16;
      person.x = 20;
      person.y = 40 + idx * 16;
    });

    relationships.map(function (relationship) {
      relationship.OurPerson = _.find(ourPeople, { 'Name': relationship.Us });
      relationship.TheirPerson = _.find(people, { 'Name': relationship.Them });
    });

    var orgchart = [];
    var types = _.unique(_.pluck(people, 'Type'));

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

    var svg = d3.select('#viz').append('svg')
      .attr('width', width)
      .attr('height', height);

    svg
      .append('line')
      .attr('x1', function () {
        var type = 'Fiduciary';
        return pos[type].x + pos[type].width/2;
      })
      .attr('y1', function () {
        var type = 'Fiduciary';
        return pos[type].y + pos[type].height/2;
      })
      .attr('x2', function () {
        var type = 'Facilities';
        return pos[type].x + pos[type].width/2;
      })
      .attr('y2', function () {
        var type = 'Facilities';
        return pos[type].y + pos[type].height/2;
      });

    svg
      .append('line')
      .attr('x1', function () {
        var type = 'Highly Integrated';
        return pos[type].x + pos[type].width/2;
      })
      .attr('y1', function () {
        var type = 'Highly Integrated';
        return pos[type].y + pos[type].height/2;
      })
      .attr('x2', function () {
        var type = 'Operational Delivery';
        return pos[type].x + pos[type].width/2;
      })
      .attr('y2', function () {
        var type = 'Operational Delivery';
        return pos[type].y + pos[type].height/2;
      });

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
      .style('fill', 'white')
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
      var peopleGroup = svg.append('g')
        .attr('class', 'people');

      peopleGroup
        .selectAll('rect')
        .data(peopleByType[type]).enter()
        .append('rect')
        .attr('class', function (d) {
          return d.Role.toLowerCase().replace(' ', '-');
        })
        .attr('x', function (d) {
          return d.x;
        })
        .attr('y', function (d) {
          return d.y - 10;
        })
        .attr('width', function (d) {
          var nameAndTitle = d.Name + ', ' + d.Title;
          return nameAndTitle.length * 5.2;
        })
        .attr('height', function (d) {
          return 12;
        });

      peopleGroup
        .selectAll('text')
        .data(peopleByType[type]).enter()
        .append('text')
        .attr('class', function (d) {
          return d.Role.toLowerCase().replace(' ', '-');
        })
        .attr('x', function (d) {
          return d.x;
        })
        .attr('y', function (d) {
          return d.y;
        })
        .text(function (d) {
          return d.Name + ', ' + d.Title;
        });
    });


    var ourPeopleGroup = svg.append('g')
      .attr('transform', function () {
        var type = 'Our Connections';
        return 'translate(' + pos[type].x + ',' + pos[type].y + ')';
      })
      .attr('class', 'our-connections');

    ourPeopleGroup
      .append('rect')
      .attr('width', 200)
      .attr('height', 100)
      .attr('rx', 10)
      .style('fill', 'none')
      .style('stroke', '#777');

    ourPeopleGroup
      .append('text')
      .text('Our Connections')
      .attr('x', 20)
      .attr('y', 20)
      .style('font-weight', 'bold');

    ourPeopleGroup
      .append('g')
      .selectAll('text')
      .data(ourPeople).enter()
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

    var links = svg.append('g')
      .selectAll('line')
      .data(relationships)
      .enter().append('line');

    var type = 'Our Connections';
    links
      .attr('class', function (d) {
        return d.Strength.toLowerCase();
      })
      .attr('stroke-dasharray', function (d) {
        if (d.Strength === 'Weak') {
          return '2,2';
        }
      })
      .attr('x1', function (d) {
        return d.OurPerson.x + pos[type].x + d.OurPerson.Name.length * 5.1;
      })
      .attr('y1', function (d) {
        return d.OurPerson.y + pos[type].y - 4;
      })
      .attr('x2', function (d) {
        return d.TheirPerson.x - 4;
      })
      .attr('y2', function (d) {
        return d.TheirPerson.y - 4;
      });


    type = 'Notes';
    var notesGroup = svg.append('g')
      .attr('transform', 'translate(' + pos[type].x + ',' + pos[type].y + ')');

    notesGroup
      .append('rect')
      .attr('class', 'light')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pos[type].width)
      .attr('height', pos[type].height);

    notesGroup
      .append('text')
      .text('Notes')
      .attr('x', 20)
      .attr('y', 20)
      .style('font-weight', 'bold');

    notesGroup
      .append('foreignObject')
      .attr('x', 12)
      .attr('y', 40)
      .attr('width', pos[type].width)
      .attr('height', pos[type].height)
      .append('xhtml:body')
      .style('font', '10px sans-serif')
      .html(json.Notes);

    type = 'Partners';
    var partnersGroup = svg.append('g')
      .attr('transform', 'translate(' + pos[type].x + ',' + pos[type].y + ')');

    partnersGroup
      .append('rect')
      .attr('class', 'light')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pos[type].width)
      .attr('height', pos[type].height);

    partnersGroup
      .append('text')
      .text('Project Delivery Partners')
      .attr('x', 20)
      .attr('y', 20)
      .style('font-weight', 'bold');

    partnersGroup
      .append('text')
      .text('Project Participants')
      .attr('x', 20)
      .attr('y', 45)
      .style('font-weight', 'bold');

    partnersGroup
      .append('foreignObject')
      .attr('x', 12)
      .attr('y', 55)
      .attr('width', pos[type].width - 40)
      .attr('height', pos[type].height)
      .append('xhtml:body')
      .style('font', '10px sans-serif')
      .html(json.Partners);


    type = 'Legend';
    var legendGroup = svg.append('g')
      .attr('transform', 'translate(' + pos[type].x + ',' + pos[type].y + ')');

    legendGroup
      .append('rect')
      .attr('class', 'light')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pos[type].width)
      .attr('height', pos[type].height);

    legendGroup
      .append('text')
      .text('Legend')
      .attr('x', 20)
      .attr('y', 20)
      .style('font-weight', 'bold');

    var legend = '';
    legend = legend + '<dl>';
    legend = legend + '<dt class="decision-maker" >Decision Maker</dt>';
    legend = legend + '<dd>A person with decision making power who can advance your goals.</dd>';

    legend = legend + '<dt class="navigator">Navigator</dt>';
    legend = legend + '<dd>A person who can guide you through the organization</dd>';

    legend = legend + '<dt class="champion">Champion</dt>';
    legend = legend + '<dd>A person with leadership level influence who wants to win for their own greater good reasons</dd>';
    legend = legend + '</dl>';

    legendGroup
      .append('foreignObject')
      .attr('x', 12)
      .attr('y', 32)
      .attr('width', pos[type].width - 20)
      .attr('height', pos[type].height)
      .append('xhtml:body')
      .style('font', '10px sans-serif')
      .html(legend);


  });
})();
