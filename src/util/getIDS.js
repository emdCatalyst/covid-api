const codes = require('countries-code'),
	  config = require('../config.json');

module.exports = (country) => {
		const data = codes.allCountriesList();
		country = data.find(pCountry => pCountry["country_name_en"] == country);
		return country ? {alpha2: country.alpha2,alpha3: country.alpha3} : undefined;
}

