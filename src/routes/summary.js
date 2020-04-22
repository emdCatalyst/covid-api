const request = require('request-promise'),
  cheerio = require('cheerio'),
  config = require('../config.json');

const getSummary = async () => {
  return request(config.worldometers).then(html => {
    const $ = cheerio.load(html),
      labels = ['countryName', 'cases.total', 'cases.new', 'cases.closed.deaths.total', 'cases.closed.deaths.new', 'cases.active.recovered', 'cases.active.total', 'cases.active.critical', 'stats.casesPerMillion', 'stats.deathsPerMillion', 'tests.total', 'tests.perMillion', 'stats.continent'];
    let data = {
      world: {},
      continents: []
    };
    $('tbody').children().each((parentIndex, tr) => {
      if (parentIndex == 7) {
        $(tr).children().each((index, td) => {
          data.world[labels[index]] = $(td).text().trim().replace(/[,+]/g, '');
        });
      } else if ([0, 1, 2, 3, 4, 5].includes(parentIndex)) {
        let countrySpecific = {};
        $(tr).children().each((index, td) => {
          countrySpecific[labels[index]] = $(td).text().trim().replace(/[,+]/g, '');
        });
        data.continents.push(countrySpecific);
      }
    });
    return {
      status: 200,
      body: data
    };
  }).catch(e => {
    return {
      status: 404,
      body: e
    };
  });
}

module.exports = (res) => getSummary().then(data => res.status(data.status).json(data.body));