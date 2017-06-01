/**
* (C) Copyright IBM Corp. 2017. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
* in compliance with the License. You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software distributed under the License
* is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
* or implied. See the License for the specific language governing permissions and limitations under
* the License.
*/

var showLocationsLayout = require('./show-locations');
var requestGeolocationLatlongLayout = require('./request-geolocation-latlong');
var requestGeolocationZipcodeLayout = require('./request-geolocation-zipcode');
var chooseLocationTypeLayout = require('./choose-location-type');
var chooseLayout = require('./choose');
var formLayout = require('./form');
var creditCardLayout = require('./cc-validator');
var errorLayout = require('./error');
let rrSearch = require('./rr-search')
let pieChart = require('./pie-chart')
let billSummary = require('./bill-summary')
let billDetail = require('./bill-detail')
let billData = require('./bill-data')
let LoadTime = require('./LoadTime')
let planSuggest = require('./planSuggest')
let dataPieChart = require('./dataPieChart')
let dataUsage = require('./dataUsage')


module.exports = {
  showLocations: showLocationsLayout,
  requestGeolocationLatlong: requestGeolocationLatlongLayout,
  requestGeolocationZipcode: requestGeolocationZipcodeLayout,
  chooseLocationType: chooseLocationTypeLayout,
  choose: chooseLayout,
  creditCard: creditCardLayout,
  form: formLayout,
  error: errorLayout,
  rrSearch: rrSearch,
  pieChart: pieChart,
  billSummary: billSummary,
  billDetail: billDetail,
  billData: billData,
  LoadTime: LoadTime,
  planSuggest:planSuggest,
  dataPieChart: dataPieChart,
  dataUsage: dataUsage,
};
