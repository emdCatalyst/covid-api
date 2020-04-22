const cheerio = require('cheerio'),
  request = require('request-promise'),
  config = require('../config.json'),
  codes = require('countries-code');

const getCountry = async (id) => {
  id = codes.getCountry(id);
  return request(config.worldometers).then(html => {
    const $ = cheerio.load(html),
      labels = ['countryName', 'cases.total', 'cases.new', 'cases.closed.deaths.total', 'cases.closed.deaths.new', 'cases.active.recovered', 'cases.active.total', 'cases.active.critical', 'stats.casesPerMillion', 'stats.deathsPerMillion', 'tests.total', 'tests.perMillion', 'stats.continent'],
      countries = [];

    $('tbody').children().each((parentIndex, tr) => {
      let countryStats = {};
      $(tr).children().each((index, td) => {
        countryStats[labels[index]] = $(td).text().trim().replace(/[,+]/g, '');
      });
      countries.push(countryStats);
    });
    return countries.find(country => country.countryName == id) ? {
      status: 200,
      body: countries.find(country => country.countryName == id)
    } : {
      status: 404,
      body: {
        error: 'Not found'
      }
    };
  }).catch(e => {
    return {
      status: 404,
      body: e
    };
  });
}

module.exports = (req, res) => getCountry(req.query.id).then(data => res.status(data.status).json(data.body));