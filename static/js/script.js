(function() {

  // Local Storage
  const ls = window.localStorage

  let contactBook

  // ContactBook Class
  class Contacts {
    constructor(title, data) {
      this.data = data,
      this.title = title,
      this.el = this.template(),
      this.list = $(this.el).find('.contacts__list'),
      this.sortDirection = ls.getItem('contactsSortDirection')

      if (this.sortDirection == 'za') $(this.el).find('.sort').addClass('sort_reverse')

      $('.app').append(this.el)
      this.generateContactsList(this.data)

      $(this.el).find('.sort').on('click', (e) => {

        this.clearContacts()
        this.data = this.sortContacts()
        this.sortDirection == 'za' ? $(e.currentTarget).addClass('sort_reverse') : $(e.currentTarget).removeClass('sort_reverse')

        ls.setItem('contactsData', JSON.stringify(this.data))

        this.generateContactsList(this.data)

        $('.contacts__search input').val('')
      })

      $(this.el).find('.contacts__search input').on('keyup', (e) => {
        const value = e.target.value.toLowerCase()
        this.searchContact(value)
      })
    }

    template() {
      return $(`
        <div class="contacts">
          <div class="contacts__head">
            <h1 class="title">${this.title}</h1>
          </div>
          <div class="contacts__body">
            <button class="sort">
              <svg>
                <use xlink:href="#svg-az"/>
              </svg>
              <svg>
                <use xlink:href="#svg-za"/>
              </svg>
            </button>
            <div class="contacts__search">
              <span>Search:</span>
              <input type="search" placeholder="Type a contact..."/>
            </div>
            <div class="contacts__list"></div>
          </div>
        </div>
      `)
    }

    generateContactsList(data) {
      $(data).each((i, d) => {
        const p = new Person(d);

        p.index = i
        p.createElement()

        $(this.list).append(p.template)

        setTimeout(() => {
          p.toggleDisplay()
        }, `${i*2}0`)
      })
    }

    sortContacts() {
      this.sortDirection = this.sortDirection == 'az' ? 'za' : 'az'

      ls.setItem('contactsSortDirection', this.sortDirection)

      return this.sortDirection == 'az' ?
        $(this.data).sort((p1,p2) => p1.name < p2.name ? -1 : 1 ) :
        $(this.data).sort((p1,p2) => p1.name > p2.name ? -1 : 1 )
    }

    clearContacts() {
      $(this.list).html('')
    }

    searchContact(value) {
      $(this.el).find('.person').each((i, el) => {
        const pName = $(el).find('.person__name').text().trim().toLowerCase();
        let pass = true

        for (let k = 0; k < value.length; k++) {
          if (pName[k] !== value[k]) pass = false
        }

        if (pass) {
          $(el).show()
          $(el).removeClass('person_hidden')
        } else {
          $(el).addClass('person_hidden')
          setTimeout(() => {
            $(el).hide()
          }, 500)
        }
      })
    }

  }

  class Person {
    constructor(data) {
      this.editable = 0,
      this.avatar = data.avatar;
      this.name = data.name;
      this.details = {
        username: {
          name: 'Username',
          value: data.username,
        },
        email: {
          name: 'E-mail',
          value: data.email,
        },
        phone: {
          name: 'Phone',
          value: data.phone,
        },
        company: {
          name: 'Company',
          value: data.company,
        },
        website: {
          name: 'Website',
          value: data.website,
        },
        location: {
          name: 'Location',
          value: data.location
        }}

      this.template =
        $(`<details class="person person_hidden">
          <summary class="person__name">
            <span>${this.name}</span>
          </summary>
          <div class="person__info">
            <div class="person__avatar avatar">
              <img src="${this.avatar}" alt="${this.name}"/>
            </div>
            <ul class="info">
            </ul>
            <button class="person__edit">Edit data</button>
          </div>
        </details>`);

        $(this.template).find('.person__edit').on('click', (e) => {
          switch (this.editable) {
            case 0:
              $(e.currentTarget).text('Save data');
              this.editElementData();
              break;
            case 1:
              $(e.currentTarget).text('Edit data')
              this.saveElementData();
              break;
            default:
              console.log('Default action')
          }

          this.editable = +!this.editable

        })
    }

    createElement() {
      const info = $(this.template).find('.info');

      for (let property in this.details) {
        $(info).append(`
          <li class="info__item">
            <strong>${this.details[property].name}:</strong>
            <span data-editable>${this.details[property].value}</span>
          </li>
        `)
      }
    }

    editElementData() {
      $(this.template).find('[data-editable]').each((i, field) => {
        $(field).after(`<input type="text" value="${field.textContent}"/>`)
      })
    }

    saveElementData() {
      let i = 0;

      for (let property in this.details) {
        const field = $(this.template).find('.info input')[i];

        contactBook.data[this.index][property] = field.value
        $(field).parent().find('[data-editable]').text(field.value)
        i++
      }

      $(this.template).find('.info input').remove()

      ls.setItem('contactsData', JSON.stringify(contactBook.data))
    }

    toggleDisplay() {
      $(this.template).toggleClass('person_hidden')
    }
  }

  // Ajax
  $.ajax({
    url: 'http://demo.sibers.com/users',
    success: (data) => {
      // Local Storage Check data
      if (ls.getItem('contactsData') === null) {
        const contactsData = [];

        // Create structure data
        $(data).each((i, item) => {
          const obj = {
            avatar: item.avatar,
            name: item.name,
            username: item.username,
            email: item.email,
            phone: item.phone,
            company: item.company.name,
            website: item.website,
            location: `${item.address.country}, ${item.address.city}`
          }

          contactsData.push(obj)
        });

        // Save data in Local Storage
        ls.setItem('contactsData', JSON.stringify(contactsData))
        contactBook = new Contacts('Contact book', contactsData)

      } else {
        // Get data from Local Storage
        contactBook = new Contacts('Contact book', JSON.parse(ls.getItem('contactsData')))
      }
    }
  })


})(window);
