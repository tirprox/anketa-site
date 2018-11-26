require('es6-promise').polyfill();

import Cleave from 'cleave.js';
import Vue from 'vue';
import App from './App';
import VueFormWizard from 'vue-form-wizard';
import VueFormGenerator from 'vue-form-generator';
//import "vue-form-generator/dist/vfg.css";
import axios from 'axios'
import 'vue-form-wizard/dist/vue-form-wizard.min.css';

Vue.use(VueFormGenerator);
Vue.use(VueFormWizard);
Vue.config.productionTip = false;

let counterparty = [];
counterparty.phone  = [];

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

counterparty.phone.prefix = '+7';
counterparty.phone.number = getURLParameter("n");

if (counterparty.phone.number == null) {

  counterparty.phone.number = '';
  counterparty.name= '';
  counterparty.lastName= '';
  counterparty.birthday= '';
  counterparty.email= '';
  counterparty.id='';
  counterparty.country= '';
  counterparty.city= '';
  counterparty.address= '';
  counterparty.postcode= '';
  counterparty.promoCode= '';
  //counterparty.metricaClientId = getClientId();
  counterparty.isNew = true;
  counterparty.isFromSms = false;
  initVue();

}
else {
  counterparty.isFromSms = true;
  requestData();
}


function requestData() {
  axios.post('/api/v2/entities/counterparty/registration/get.php', {phone: counterparty.phone.number})
    .then(function (response) {
      //console.log(response.data);
      counterparty.name=response.data.firstName || '';
      counterparty.lastName=response.data.lastName || '';
      counterparty.birthday=response.data.birthday || '';
      counterparty.email=response.data.email || '';
      counterparty.phone=response.data.phone || counterparty.phone;
      counterparty.phone.number = formatPhone(counterparty.phone.number);
      counterparty.id=response.data.id || '';
      counterparty.country=response.data.country || '';
      counterparty.city=response.data.city || '';
      counterparty.address=response.data.address || '';
      counterparty.postcode=response.data.postcode || '';
      counterparty.promoCode=response.data.promoCode || '';
      counterparty.metricaClientId=getClientId() || '';
      counterparty.isNew = false;

      console.log(counterparty);
      initVue()
    })
    .catch(function (error) {
      console.log(error);

      initVue()
    });
}


let ycity = '', ycountry = '';

window.onload = function() {

  reachGoal('anketa-reg-open');
  window.ymaps.ready(function() {
    ycity = window.ymaps.geolocation.city;
    ycountry = window.ymaps.geolocation.country;
  });
};

let vm;
function initVue() {
  var counter = getMetricaCounter();
  if (counter === undefined) {
    document.addEventListener('yacounter42085949inited', function() {
      vm = new Vue({
        el: '#app',
        template: '<App/>',
        components: {App}
      });
    });
    document.addEventListener('yacounter48896408inited', function() {
      vm = new Vue({
        el: '#app',
        template: '<App/>',
        components: {App}
      });
    })
  }
  else {
    vm = new Vue({
      el: '#app',
      template: '<App/>',
      components: {App}
    });
  }



}

function getMetricaCounter() {
  var counter = null;
  if (window.yaCounter42085949 !== undefined) {
    counter = window.yaCounter42085949
  }

  if (window.yaCounter48896408 !== undefined) {
    counter = window.yaCounter48896408
  }
  return counter;
}

function getClientId() {
  var yaCounter = getMetricaCounter();
  var clientID = null;
  if (yaCounter!== null) {
    clientID = getMetricaCounter().getClientID();
  }
  console.log('ClientID: ' + clientID);
  return clientID;
}

function reachGoal(goal) {

  var yaCounter = getMetricaCounter();
  if (yaCounter!== null) {
    yaCounter.reachGoal(goal);
  }
  if (window.ga !== undefined) {
    ga('send', 'event', 'anketa-reg', goal, 'test');
  }
  console.log('Goals: ' + goal + ' reached!')
}

function formatPhone(r) {
  if (r!=='' && r.length===10) {
    let first = r.substr(0, 3);
    let second = r.substr(3, 3);
    let third = r.substr(6, 2);
    let fourth = r.substr(8, 2);

    return first + " " + second + "-" + third + "-" + fourth;
  }
  return r;
}

export {
  ycity,
  ycountry,
  counterparty,
  reachGoal,
  getClientId,
  getMetricaCounter
}
