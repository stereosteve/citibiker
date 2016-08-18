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

    trip.durationHours = convertDuration(trip.duration)

    // One time I didn't dock a bike properly and eneded up with a 13 hour ride.
    // Assume that rides longer than 6 hours are bogus
    if (trip.durationHours > 6) return

    trips.push(trip)
  })

})

function convertDuration(dur) {
      var s = parseInt(dur.match(/(\d+) s/))
      var m = parseInt(dur.match(/(\d+) min/))
      var h = parseInt(dur.match(/(\d+) h/))

      var seconds = 0
      if (s) seconds += s
      if (m) seconds += m * 60
      if (h) seconds += h * 3600

      return seconds / 3600
}


fs.writeFileSync("trips.json", JSON.stringify(trips, undefined, 2))


// -----------------------------------------------------------------------------


// load station data
var stationData = JSON.parse(fs.readFileSync("data/stations.json", "utf8"))
var stationMap = {}
stationData.stationBeanList.forEach(function (s) {
  stationMap[s.stationName] = s
})


// render HTML
var nunjucks = require('nunjucks')
nunjucks.configure('views', { autoescape: true });
var html = nunjucks.render('t.html', { trips: trips, stationMap: stationMap });
fs.writeFileSync("trips.html", html)
