var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })
var vo = require('vo');


var citibikeEmail = process.env['CITIBIKE_EMAIL']
var citibikePassword = process.env['CITIBIKE_PASSWORD']

if (!citibikeEmail || !citibikePassword) {
  throw("environment variables CITIBIKE_EMAIL and CITIBIKE_PASSWORD are required!")
}

vo(run)(function(err, result) {
    if (err) throw err;
});



function* run() {

  var nm = nightmare
    .goto('https://member.citibikenyc.com/profile/login')
    .insert('form[action*="login_check"] [name=_username]', citibikeEmail)
    .insert('form[action*="login_check"] [name=_password]', citibikePassword)
    .click('form[action*="login_check"] [type=submit]')
    .wait('.ed-profile-menu__link_trips')
    .click('.ed-profile-menu__link_trips a')
    .wait('.ed-table__item')

  var numPages = yield nm.evaluate(function () {
    return document.querySelector('.ed-paginated-navigation__jump-to__last-page').innerText
  })


  for (var page = 1; page <= numPages; page++) {
    yield nm.html("raw/page" + page + ".html", "HTMLOnly")
            .click(".ed-paginated-navigation__pages-group__link_next")
            .wait(2000)
  }


  yield nm.end()

}
