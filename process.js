let cheerio = require('cheerio')
let fs = require('fs')

var trips = []

var files = fs.readdirSync('raw')
files.forEach(function (file) {

  var h = fs.readFileSync('raw/' + file, 'utf8')
  var $ = cheerio.load(h)

  $('.ed-table__item').each(function () {

    var trip = {}

    trip.date = $(this).find('.ed-table__item__info__sub-info_trip-start-date').text().trim()
    trip.startStation = $(this).find('.ed-table__item__info__sub-info_trip-start-station').text().trim()
    trip.endStation = $(this).find('.ed-table__item__info__sub-info_trip-end-station').text().trim()
    trip.duration = $(this).find('.ed-table__item__info_trip-duration').text().trim()
    trip.cost = $(this).find('.ed-table__col_trip-cost').text().trim()

    trips.push(trip)
  })

})

fs.writeFileSync("trips.json", JSON.stringify(trips, undefined, 2))
