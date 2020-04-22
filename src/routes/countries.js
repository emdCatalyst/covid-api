const cheerio = require('cheerio'),
  request = require('request-promise'),
  config = require('../config.json'),
  util = (require('require-dir'))('../util');

const clean = (string) => {
  let segments = string.split('-') ? string.split('-') : [string];
  segments.forEach((segment, index) => segments[index] = segment.substring(0, 1).toUpperCase() + segment.substring(1, segment.length));
  return segments.join(' ');
};

const getAll = async (continent = 'all') => {
  continent = continent.toLowerCase();
  return request(config.worldometers).then(html => {
    const $ = cheerio.load(html),
      labels = ['countryName', 'cases.total', 'cases.new', 'cases.closed.deaths.total', 'cases.closed.deaths.new', 'cases.active.recovered', 'cases.active.total', 'cases.active.critical', 'stats.casesPerMillion', 'stats.deathsPerMillion', 'tests.total', 'tests.perMillion', 'stats.continent'];
    let data = {
      count: 0,
      countries: []
    };
    if (!['all', 'europe', 'north-america', 'asia', 'south-america', 'africa', 'oceania'].includes(continent))
      continent = 'all';
    $('tbody').children().each((parentIndex, tr) => {
      if ([0, 1, 2, 3, 4, 5, 6, 7].includes(parentIndex)) return;
      let countrySpecific = {};
      $(tr).children().each((index, td) => {
        countrySpecific[labels[index]] = $(td).text().trim().replace(/[,+]/g, '');
      });
      const ids = util.getIDS(countrySpecific.countryName);
      countrySpecific.ranking = parentIndex++;
      Object.assign(countrySpecific, ids);
      data.countries.push(countrySpecific);
    });
    data.count = data.countries.length;
    return continent == 'all' ? {
      status: 200,
      body: data
    } : {
      status: 200,
      body: {
        count: data.countries.filter(country => country['stats.continent'] == clean(continent)).length,
        countries: data.countries.filter(country => country['stats.continent'] == clean(continent))
      }
    };
  }).catch(e => {
    return {
      status: 404,
      body: e
    };
  });
}

module.exports = (req, res) => {
  if (!req.query.continent)
    req.query.continent = 'all';
  getAll(req.query.continent).then(data => res.status(data.status).json(data.body));
};