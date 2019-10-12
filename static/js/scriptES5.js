'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  // Local Storage
  var ls = window.localStorage;

  var contactBook = void 0;

  // ContactBook Class

  var Contacts = function () {
    function Contacts(title, data) {
      var _this = this;

      _classCallCheck(this, Contacts);

      this.data = data, this.title = title, this.el = this.template(), this.list = $(this.el).find('.contacts__list'), this.sortDirection = ls.getItem('contactsSortDirection');

      if (this.sortDirection == 'za') $(this.el).find('.sort').addClass('sort_reverse');

      $('.app').append(this.el);
      this.generateContactsList(this.data);

      $(this.el).find('.sort').on('click', function (e) {

        _this.clearContacts();
        _this.data = _this.sortContacts();
        _this.sortDirection == 'za' ? $(e.currentTarget).addClass('sort_reverse') : $(e.currentTarget).removeClass('sort_reverse');

        ls.setItem('contactsData', JSON.stringify(_this.data));

        _this.generateContactsList(_this.data);

        $('.contacts__search input').val('');
      });

      $(this.el).find('.contacts__search input').on('keyup', function (e) {
        var value = e.target.value.toLowerCase();
        _this.searchContact(value);
      });
    }

    _createClass(Contacts, [{
      key: 'template',
      value: function template() {
        return $('\n        <div class="contacts">\n          <div class="contacts__head">\n            <h1 class="title">' + this.title + '</h1>\n          </div>\n          <div class="contacts__body">\n            <button class="sort">\n              <svg>\n                <use xlink:href="#svg-az"/>\n              </svg>\n              <svg>\n                <use xlink:href="#svg-za"/>\n              </svg>\n            </button>\n            <div class="contacts__search">\n              <span>Search:</span>\n              <input type="search" placeholder="Type a contact..."/>\n            </div>\n            <div class="contacts__list"></div>\n          </div>\n        </div>\n      ');
      }
    }, {
      key: 'generateContactsList',
      value: function generateContactsList(data) {
        var _this2 = this;

        $(data).each(function (i, d) {
          var p = new Person(d);

          p.index = i;
          p.createElement();

          $(_this2.list).append(p.template);

          setTimeout(function () {
            p.toggleDisplay();
          }, i * 2 + '0');
        });
      }
    }, {
      key: 'sortContacts',
      value: function sortContacts() {
        this.sortDirection = this.sortDirection == 'az' ? 'za' : 'az';

        ls.setItem('contactsSortDirection', this.sortDirection);

        return this.sortDirection == 'az' ? $(this.data).sort(function (p1, p2) {
          return p1.name < p2.name ? -1 : 1;
        }) : $(this.data).sort(function (p1, p2) {
          return p1.name > p2.name ? -1 : 1;
        });
      }
    }, {
      key: 'clearContacts',
      value: function clearContacts() {
        $(this.list).html('');
      }
    }, {
      key: 'searchContact',
      value: function searchContact(value) {
        $(this.el).find('.person').each(function (i, el) {
          var pName = $(el).find('.person__name').text().trim().toLowerCase();
          var pass = true;

          for (var k = 0; k < value.length; k++) {
            if (pName[k] !== value[k]) pass = false;
          }

          if (pass) {
            $(el).show();
            $(el).removeClass('person_hidden');
          } else {
            $(el).addClass('person_hidden');
            setTimeout(function () {
              $(el).hide();
            }, 500);
          }
        });
      }
    }]);

    return Contacts;
  }();

  var Person = function () {
    function Person(data) {
      var _this3 = this;

      _classCallCheck(this, Person);

      this.editable = 0, this.avatar = data.avatar;
      this.name = data.name;
      this.details = {
        username: {
          name: 'Username',
          value: data.username
        },
        email: {
          name: 'E-mail',
          value: data.email
        },
        phone: {
          name: 'Phone',
          value: data.phone
        },
        company: {
          name: 'Company',
          value: data.company
        },
        website: {
          name: 'Website',
          value: data.website
        },
        location: {
          name: 'Location',
          value: data.location
        } };

      this.template = $('<details class="person person_hidden">\n          <summary class="person__name">\n            <span>' + this.name + '</span>\n          </summary>\n          <div class="person__info">\n            <div class="person__avatar avatar">\n              <img src="' + this.avatar + '" alt="' + this.name + '"/>\n            </div>\n            <ul class="info">\n            </ul>\n            <button class="person__edit">Edit data</button>\n          </div>\n        </details>');

      $(this.template).find('.person__edit').on('click', function (e) {
        switch (_this3.editable) {
          case 0:
            $(e.currentTarget).text('Save data');
            _this3.editElementData();
            break;
          case 1:
            $(e.currentTarget).text('Edit data');
            _this3.saveElementData();
            break;
          default:
            console.log('Default action');
        }

        _this3.editable = +!_this3.editable;
      });
    }

    _createClass(Person, [{
      key: 'createElement',
      value: function createElement() {
        var info = $(this.template).find('.info');

        for (var property in this.details) {
          $(info).append('\n          <li class="info__item">\n            <strong>' + this.details[property].name + ':</strong>\n            <span data-editable>' + this.details[property].value + '</span>\n          </li>\n        ');
        }
      }
    }, {
      key: 'editElementData',
      value: function editElementData() {
        $(this.template).find('[data-editable]').each(function (i, field) {
          $(field).after('<input type="text" value="' + field.textContent + '"/>');
        });
      }
    }, {
      key: 'saveElementData',
      value: function saveElementData() {
        var i = 0;

        for (var property in this.details) {
          var field = $(this.template).find('.info input')[i];

          contactBook.data[this.index][property] = field.value;
          $(field).parent().find('[data-editable]').text(field.value);
          i++;
        }

        $(this.template).find('.info input').remove();

        ls.setItem('contactsData', JSON.stringify(contactBook.data));
      }
    }, {
      key: 'toggleDisplay',
      value: function toggleDisplay() {
        $(this.template).toggleClass('person_hidden');
      }
    }]);

    return Person;
  }();

  // Ajax


  $.ajax({
    url: 'http://demo.sibers.com/users',
    success: function success(data) {
      // Local Storage Check data
      if (!ls.getItem('contactsData')) {
        (function () {
          var contactsData = [];

          // Create structure data
          $(data).each(function (i, item) {
            var obj = {
              avatar: item.avatar,
              name: item.name,
              username: item.username,
              email: item.email,
              phone: item.phone,
              company: item.company.name,
              website: item.website,
              location: item.address.country + ', ' + item.address.city
            };

            contactsData.push(obj);
          });

          // Save data in Local Storage
          ls.setItem('contactsData', JSON.stringify(contactsData));
          contactBook = new Contacts('Contact book', contactsData);
        })();
      } else {
        // Get data from Local Storage
        contactBook = new Contacts('Contact book', JSON.parse(ls.getItem('contactsData')));
      }
    }
  });
})(window);
