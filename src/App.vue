<template>
  <div id="app">
    <div class="container form-container">
      <form-wizard @on-complete="onComplete" @on-change="onChange" ref="wizard" shape="square" color="#3fb618" error-color="#a94442"
                   title="" subtitle="" stepSize="xs">
        <tab-content title="Ваше имя" :before-change="validateFirstTab">
          <vue-form-generator :model="model" :schema="firstTabSchema" :options="formOptions"
                              ref="firstTabForm" id="firstTab"></vue-form-generator>
        </tab-content>
        <tab-content title="Как нашли" :before-change="validateSecondTab">
          <vue-form-generator :model="model" :schema="secondTabSchema" :options="formOptions"
                              ref="secondTabForm"></vue-form-generator>
        </tab-content>
        <tab-content title="Контактные данные" :before-change="validateThirdTab">
          <vue-form-generator :model="model" :schema="thirdTabSchema" :options="formOptions"
                              ref="thirdTabForm"></vue-form-generator>

        </tab-content>

        <tab-content title="Проверка">
          <legend>Все почти готово! Проверьте данные перед отправкой:</legend>
          <div class="panel-body">
            <p v-if="model"><b>{{model.client.name}} {{model.client.lastName}}</b></p>
            <p v-if="model"><b>Телефон:</b> {{model.client.phone.prefix + ' ' + model.client.phone.number}} </p>
            <p v-if="model.client.email.length>0"><b>Email:</b> {{model.client.email}} </p>
            <p v-if="model.infoSource.isCustom!==true"><b>Откуда вы о нас узнали: </b>{{model.infoSource.source}}</p>
            <p v-if="model.infoSource.isCustom===true"><b>Откуда вы о нас узнали: </b>{{model.infoSource.custom}}</p>
          </div>
          <div class="feedback"  v-if="model.isFromSms">
            <vue-form-generator :model="model" :schema="feedbackSchema" :options="formOptions"
                                ref="feedback" id="feedback"></vue-form-generator>
          </div>

          <div class="agreement text-center">
            <hr>
            <b>Нажимая кнопку "Отправить", вы соглашаетесь на обработку Ваших персональных данных.</b>
            <hr>
          </div>
          <div class="notification text-center">
            * При совершении покупки в шоу-румах скидка начинает действовать на следующий день
          </div>
        </tab-content>

        <button class="btn btn-default" slot="prev">Назад</button>
        <button class="btn btn-success" slot="next">Далее</button>
        <button class="btn btn-success" slot="finish">Отправить</button>

      </form-wizard>
      <div v-if="popup" id="fullscreen-popup">
        <h1>Все готово! Вы прекрасны!</h1>
        <h3>Спасибо, что выбрали DreamWhite!</h3>
        <p>На указанную электронную почту придут данные для входа на сайт.</p>
      </div>
    </div>
  </div>
</template>

<script>
  import VueFormGenerator from 'vue-form-generator';
  import {FormWizard, TabContent} from 'vue-form-wizard'
  import axios from 'axios'

  import { ycity, ycountry, counterparty, reachGoal, getClientId} from './main.js'
  //const Kladr = new kladrApi();




  let formWizard = null;
  let refs = null;

  let self = this;

  export default {
    name: 'app',
    mounted: function () {
      this.$nextTick(this.initFromCounterparty);
      this.$nextTick(this.init());
    },

    data() {
      return {
        popup: false,
        model: {
          client: {
            name: counterparty.name!==undefined ? counterparty.name : '',
            lastName: counterparty.lastName!==undefined ? counterparty.lastName : '',
            location: {
              country: counterparty.country || ycountry,
              city: counterparty.city || ycity,
              address: counterparty.address || '',
              postcode: counterparty.postcode ||''
            },
            phone: {
              prefix: counterparty.phone!==undefined ? counterparty.phone.prefix : '+7', // Depends on country
              number: counterparty.phone!==undefined ? counterparty.phone.number : '', // Input in cleave.js field
              full: ''
            },
            email: counterparty.email!==undefined ? counterparty.email : '',
            birthday: counterparty.birthday || '',
            promoCode: counterparty.promoCode || '',
            metricaClientId: counterparty.metricaClientId || ''
          },
          infoSource: {
            isCustom: false,
            source: '',
            custom: ''
          },
          feedback: '',
          isFromSms: counterparty.isFromSms,
          isAddress: false,
          isNew: true,
          date: '',
          time: '',
          id: counterparty.id || ''
        },

        formOptions: {
          validationErrorClass: "has-error",
          validationSuccessClass: "has-success",
          validateAfterChanged: true
        },
        firstTabSchema: {
          groups: [{
            legend: "Как Вас зовут?",
            fields: [{
              type: "input",
              inputType: "text",
              label: "Имя *",
              styleClasses: 'vc_col-sm-12 col-md-12',
              //placeholder: "Имя",
              model: "client.name",
              required: true,
              validator: VueFormGenerator.validators.string.locale({
                fieldIsRequired: "Необходимо ввести имя",
              }),
            },
              {
                type: "input",
                inputType: "text",
                styleClasses: 'vc_col-sm-12 col-md-12',
                label: "Фамилия",
                //placeholder: "Фамилия (по желанию)",
                model: "client.lastName",
                required: false,
              },
              {
                type: "cleave",
                label: "Дата рождения",
                styleClasses: "birthday vc_col-sm-12 col-md-12",

                placeholder: "Например, 28.09.1991",
                cleaveOptions: {
                  blocks: [2, 2, 4],
                  delimiter: '.',
                  numericOnly: true,
                  uppercase: false,
                  lowercase: false,
                  date: true,
                  datePattern: ['d', 'm', 'Y'],
                },
                model: "client.birthday",
                pattern: "(\\d)(\\d)(.)(\\d)(\\d)(.)(\\d)(\\d)(\\d)(\\d)",
                required: false,
                validator: VueFormGenerator.validators.regexp.locale({
                  invalidFormat: "Неправильный формат",
                  fieldIsRequired: "Необходимо ввести дату рождения",
                })
              },
              {
                type: "input",
                inputType: "text",
                styleClasses: 'vc_col-sm-12 col-md-12',
                label: "Промокод",
                model: "client.promoCode",
                required: false,
              },

            ]
          }]
        },
        secondTabSchema: {
          groups: [
            {
              legend: "Как Вы нас нашли?",
              fields: [
                {
                  type: "radios",
                  values: ["Яндекс поиск", "Google поиск", "Яндекс карты", "Google карты"],
                  label: "Поиск",
                  model: "infoSource.source",
                  required: true,
                  validator: VueFormGenerator.validators.string.locale({
                    fieldIsRequired: "Необходимо выбрать вариант из списка",
                  }),
                  onChanged: function (model, newVal, oldVal, field) {
                    model.isCustomInfoSource = false;
                    model.infoSourceCustom = "";
                    formWizard.nextTab();
                  },
                  styleClasses: 'vc_col-sm-4 col-md-4'
                },
                {
                  type: "radios",
                  values: ["Instagram", "Facebook", "Вконтакте", "Pinterest"],
                  label: "Соц. сети",
                  model: "infoSource.source",
                  required: true,
                  validator: VueFormGenerator.validators.string.locale({
                    fieldIsRequired: "Необходимо выбрать вариант из списка",
                  }),
                  onChanged: function (model, newVal, oldVal, field) {
                    model.isCustomInfoSource = false;
                    model.infoSourceCustom = "";
                    formWizard.nextTab();
                  },
                  styleClasses: 'vc_col-sm-4 col-md-4'
                },
                {
                  type: "radios",
                  values: ["По рекомендации", "Проходили мимо", "Повторная покупка"],
                  label: "Другие варианты",
                  model: "infoSource.source",
                  required: true,
                  validator: VueFormGenerator.validators.string.locale({
                    fieldIsRequired: "Необходимо выбрать вариант из списка",
                  }),
                  onChanged: function (model, newVal, oldVal, field) {
                    model.infoSource.isCustom = false;
                    model.infoSource.custom = "";
                    formWizard.nextTab();
                  },
                  styleClasses: 'vc_col-sm-4 col-md-4'
                },

                {
                  type: "textArea",
                  styleClasses: 'vc_col-sm-12 padded',
                  label: "Если представленные варианты не подошли, введите свой ответ:",
                  model: "infoSource.custom",
                  required: false,

                  onChanged: function (model, newVal, oldVal, field) {
                    if (newVal.length > 0) {
                      model.infoSource.source = "Свой ответ";
                      model.infoSource.isCustom = true;
                    }
                    else {
                      model.infoSource.source = "";
                      model.infoSource.isCustom = false;
                    }
                  },
                },
              ]
            }
          ],
        },
        thirdTabSchema: {
          groups: [{
            legend: "Ваши контактные данные:",
            fields: [
              {
                type: "select",
                label: "Страна",
                model: "client.location.country",
                styleClasses: 'vc_col-sm-6 col-md-6',
                required: true,
                set: function (model, value) {
                  model.client.location.country = value;
                  switch (value) {
                    case "Россия":
                      model.client.phone.prefix = "+7";

                      break;
                    case "Казахстан":
                      model.client.phone.prefix = "+7";
                      break;
                    case "Беларусь":
                      model.client.phone.prefix = "+375";
                      break;
                  }

                  /*model.client.phone.full = model.client.phone.prefix + ' ' + model.client.phone.number;
                  model.client.location.country = value;*/
                },
                selectOptions: {
                  hideNoneSelectedText: true,
                },

                values: ["Россия", "Казахстан", "Беларусь"],
                validator: VueFormGenerator.validators.required.locale({
                  fieldIsRequired: "Необходимо выбрать страну!",
                }),
              },
              {
                type: "input",
                label: "Город",
                inputType: "text",
                set: function (model, value) {
                  model.client.location.city = value;
                  model.isAddress = model.client.location.city !== 'Санкт-Петербург' && model.client.location.city !== 'Москва';

                },
                styleClasses: 'vc_col-sm-6 col-md-6',
                model: "client.location.city",
              },

              {
                type: "input",
                label: "Адрес",
                inputType: "text",
                placeholder: 'Улица, дом, корпус, квартира',
                visible(model) { return model.isAddress },
                styleClasses: 'vc_col-sm-8 col-md-8',
                model: "client.location.address",
              },
              {
                type: "input",
                label: "Почтовый индекс",
                placeholder: '123456',
                visible(model) { return model.isAddress },
                inputType: "text",
                styleClasses: 'vc_col-sm-4 col-md-4',
                model: "client.location.postcode",
              },

/*              {
                type: "input",
                label: "PHONE",
                inputType: "text",
                disabled: true,
                styleClasses: 'col-md-12 form-row form-row-first',
                model: "client.phone.full",
              },*/


              {
                type: "input",
                label: "Телефон *",
                inputType: "text",
                disabled: true,
                styleClasses: 'vc_col-xs-3 vc_col-sm-1 col-md-2 phone-prefix',
                model: "client.phone.prefix",
              },

              {
                type: "cleave",
                label: "‌‌ ",
                styleClasses: 'vc_col-xs-9 vc_col-sm-5 col-md-10 phone-number',
                /*set: function (model, value) {
                  model.client.phone.full = model.client.phone.prefix + ' ' + value;
                  model.client.phone.number = value;

                },*/
                cleaveOptions: {
                  blocks: [3, 3, 2, 2],
                  delimiter: ' ',
                  delimiters: [' ', '-', '-'],
                  numericOnly: true,
                  uppercase: false,
                  lowercase: false
                },
                model: "client.phone.number",
                placeholder: "999 111-22-33",
                pattern: "(\\d)(\\d)(\\d)(\\s+)(\\d)(\\d)(\\d)(-)(\\d)(\\d)(-)(\\d)(\\d)",
                required: true,
                validator: VueFormGenerator.validators.regexp.locale({
                  invalidFormat: "Не хватает цифр",
                  fieldIsRequired: "Необходимо ввести телефон",
                })
              },

              {
                type: "input",
                inputType: "text",
                label: "Email *",
                styleClasses: 'vc_col-sm-6 vc_col-xs-12 col-md-6',
                model: "client.email",
                required: true,
                validator: VueFormGenerator.validators.email.locale({
                  fieldIsRequired: "Необходимо ввести email",
                  invalidEmail: "Неправильный формат email"
                }),
              }
            ]
          }]
        },
        feedbackSchema: {
          groups: [{
            fields: [{
              label: "Мы хотим знать Ваше мнение, чтобы улучшить сервис, понять, чего Вам не хватает или потешить наше самолюбие :)\n" +
              "Огромное спасибо, если НЕ оставите поле ниже пустым ;)",
              type: "textArea",
              hint: "Максимум 500 символов",
              max: 500,
              rows: 4,
              model: "feedback",
              required: false,
              validator: VueFormGenerator.validators.string,
            },]
          },
          ]
        },
      }

    },
    computed: {
      fullPhone: function () {
        return this.model.client.phone.prefix + ' ' + this.model.client.phone.number;
      }
    },
    methods: {
      queryCity(input) {
        let q = {query: input, contentType: 'city', withParent: 0};
        Kladr.getData(q, (err, result)=>{
          console.log(err, result);
        });
      },
      init() {
        console.log('init')
        this.model.client.metricaClientId = getClientId();
        //this.model.client.phone.full  = this.fullPhone;

        if (!counterparty.isNew) {
          this.model.client.phone.full  = this.fullPhone;
          this.setDateAndTime();
          console.log(this.model);
          this.updateCounterparty()
        }

        //this.updateCounterparty()
      },

      onChange: function () {
        document.getElementById('app').scrollIntoView({block: 'start',  behaviour: 'smooth'});
      },

      onComplete: function () {
        this.model.client.phone.full  = this.fullPhone;
        this.setDateAndTime();


        if (counterparty.isNew) {
          this.createCounterparty();
        }
        else {
          this.updateCounterparty();
        }

        reachGoal('anketa-reg-registered');

        this.popup = true;
      },
      setDateAndTime: function() {
        let currentdate = new Date();
        this.model.date = currentdate.getDate() + "."
          + (currentdate.getMonth() + 1) + "."
          + currentdate.getFullYear();

        this.model.time = currentdate.getHours() + ":"
          + currentdate.getMinutes() + ":"
          + currentdate.getSeconds();
      },

      // create new counterparty
      createCounterparty: function() {
        axios.post('/api/v2/entities/counterparty/registration/post.php', {
          data: this.model
        })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      },

      // update existing counterparty
      updateCounterparty: function() {
        axios.post('/api/v2/entities/counterparty/registration/put.php', {
          data: this.model
        })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      },

      checkAddress: function() {
        this.model.isAddress = this.model.client.location.city !== 'Санкт-Петербург' && this.model.client.location.city !== 'Москва';
      },

      //Tab validation and goals
      validateFirstTab: function () {
        formWizard = this.$refs.wizard;
        reachGoal('anketa-reg-first-step-complete');
        return this.$refs.firstTabForm.validate();
      },
      validateSecondTab: function () {
        reachGoal('anketa-reg-second-step-complete');
        this.model.client.location.country = counterparty.country!== '' ? counterparty.country : ycountry;
        this.model.client.location.city = counterparty.city!== '' ? counterparty.city : ycity;
        this.checkAddress();
        return this.$refs.secondTabForm.validate();
      },
      validateThirdTab: function () {
        reachGoal('anketa-reg-third-step-complete');
        return this.$refs.thirdTabForm.validate();
      },
    }
  }
</script>


<style lang="less">
/*  @import './bootstrap/less/bootstrap.less';
  @import './less/bootswatch.less';
  @import './less/variables.less';*/

  #fullscreen-popup {
    background: white;
    width: 100%;
    height: 100%;
    text-align: center;
    //opacity: 0;
    position: absolute;
    top: 0;
  }

  /*  #firstTab label, #fourthTab label {
      display: none;
    }

    #feedback label {
      font-weight: normal;
      font-style: italic;
    }*/

  .header-image {
    margin-top: 30px;
    margin-bottom: 20px;
  }

  .panel-body {
    padding: 15px 0 15px 0;
  }

  div.radio-list label {
    display: block;
    padding-left: 4px;
    font-weight: normal;
  }

  .wizard-card-footer {
    padding: 0 !important;
  }

  .wizard-tab-content {
    padding: 30px 0px 10px !important;
  }

  .wizard-nav-pills {
    display: inline !important;
    li {
      display: inline-block !important;
      margin-right: 15px;
    }
  }

  .wizard-progress-with-circle {
    display: none !important;
  }

  .wizard-header {
    display: none;
  }

  .wizard-nav-pills {
    display: none !important;
  }

  .vue-form-wizard.xs .wizard-nav-pills > li .wizard-icon {
    font-size: 16px;
    font-style: normal;
  }

  .vue-form-wizard .wizard-nav-pills > li > a {
    //padding: 4px 10px;
    /*border: 2px solid black;*/
    color: #727272 !important;
    text-transform: uppercase;
    &:hover {
      color: #24690e !important;
    }
  }

  .vue-form-wizard.xs .wizard-icon-circle {
    display: none;
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .padded {
    padding-top: 16px;
    padding-left: 0px;
    padding-right: 0px;
  }

  label {
    padding-top: 8px;
  }

  input[type="radio"] {
    position: relative;
    top: 2px;
    margin-top: 16px;
    margin-right: 10px;
    margin-bottom: 16px;
  }

  /*input[type="radio"] {
    margin-top: 12px;
    margin-right: 10px;
    margin-bottom: 8px;
    display: none;
  }*/

  .field-radios {
    padding: 0px;
  }

  label {
  min-width: 96px;
  }

  label.is-checked {
    color: #3fb618 !important;
  }

  /*input[type="radio"]:checked,
  input[type="radio"]:not(:checked) {
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    line-height: 20px;
    display: inline-block;
    color: #666;
  }

  input[type="radio"]:checked::before,
  input[type="radio"]:not(:checked)::before {
    content: ' ';
    display: inline-block;
    position: relative;
    left: -3px;
    top: -1px;
    width: 18px;
    height: 18px;
    border: 2px solid #727272;
    border-radius: 100%;
    background: #fff;
  }

  input[type="radio"]:checked::after,
  input[type="radio"]:not(:checked)::after {
    content: '';
    width: 10px;
    height: 10px;
    background: rgb(63, 182, 24);
    position: absolute;
    top: 3px;
    left: 1px;
    border-radius: 100%;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
  }

  input[type="radio"]:not(:checked)::after {
    opacity: 1;
    -webkit-transform: scale(0);
    transform: scale(0);
  }

  input[type="radio"]:checked::after {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }*/


  .vue-form-generator .field-switch .field-wrap label {
    position: relative;
    display: block;
    vertical-align: top;
    width: 132px;
    height: 42px;
    padding: 0;
    margin: 0 10px 10px 0;
    border-radius: 0px;
    box-shadow: inset 0 -1px #fff, inset 0 1px 1px rgba(0, 0, 0, .05);
    cursor: pointer
  }

  .vue-form-generator .field-switch input {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0
  }

  .vue-form-generator .field-switch .label {
    position: relative;
    display: block;
    height: inherit;
    font-size: 10px;
    text-transform: uppercase;
    background: #eceeef;
    border-radius: inherit;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .12), inset 0 0 2px rgba(0, 0, 0, .15)
  }

  .vue-form-generator .field-switch .label:after, .vue-form-generator .field-switch .label:before {
    position: absolute;
    top: 50%;
    margin-top: -.5em;
    line-height: 1;
    -webkit-transition: inherit;
    -moz-transition: inherit;
    -o-transition: inherit;
    transition: inherit
  }

  .vue-form-generator .field-switch .label:before {
    content: attr(data-off);
    right: 11px;
    color: #aaa;
    text-shadow: 0 1px hsla(0, 0%, 100%, .5)
  }

  .vue-form-generator .field-switch .label:after {
    content: attr(data-on);
    left: 11px;
    color: #fff;
    text-shadow: 0 1px rgba(0, 0, 0, .2);
    opacity: 0
  }

  .vue-form-generator .field-switch input:checked ~ .label {
    background: #6AB165;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .15), inset 0 0 3px rgba(0, 0, 0, .2)
  }

  .vue-form-generator .field-switch input:checked ~ .label:before {
    opacity: 0
  }

  .vue-form-generator .field-switch input:checked ~ .label:after {
    opacity: 1
  }

  .vue-form-generator .field-switch .handle {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 40px;
    height: 40px;
    background: linear-gradient(180deg, #fff 40%, #f0f0f0);
    background-image: -webkit-linear-gradient(top, #fff 40%, #f0f0f0);
    border-radius: 0;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, .2)
  }

  .vue-form-generator .field-switch .handle:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -6px 0 0 -6px;
    width: 12px;
    height: 12px;
    background: linear-gradient(180deg, #eee, #fff);
    background-image: -webkit-linear-gradient(top, #eee, #fff);
    border-radius: 0px;
    box-shadow: inset 0 1px rgba(0, 0, 0, .02)
  }

  .vue-form-generator .field-switch input:checked ~ .handle {
    left: 91px;
    /*left: calc(100% - ($field-switch-height - 1px));*/
    box-shadow: -1px 1px 5px rgba(0, 0, 0, .2)
  }

  .vue-form-generator .field-switch .handle, .vue-form-generator .field-switch .label {
    transition: all .3s ease
  }


  .phone-prefix {
     padding-right: 0 !important;
    input {
      text-align: center;
      padding-left: 0;
      padding-right: 0;

      &:disabled{
        -webkit-text-fill-color: #2d2d2d;
        -webkit-opacity: 1;
      }
    }

   }

  .phone-number {
  padding-left: 0 !important;
  }

  .errors {
    color: #ff4757;

  }

  .help-block {
    font-size: 0.8rem;
    margin-top: -1rem;
  }


  input {
    &::placeholder {
      color: #b0b0b0;
    }
    &::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: #b0b0b0;
    }
    &::-moz-placeholder { /* Firefox 19+ */
      color: #b0b0b0;
    }
    &:-ms-input-placeholder { /* IE 10+ */
      color: #b0b0b0;
    }
    &:-moz-placeholder { /* Firefox 18- */
      color: #b0b0b0;
      opacity: 1;
    }

  }




</style>
