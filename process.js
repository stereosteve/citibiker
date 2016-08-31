let cheerio = require('cheerio')
let fs = require('fs')
var csvWriter = require('csv-write-stream')


var trips = processTrips();
var profile = processProfile();

fs.writeFileSync("trips.json", JSON.stringify(trips, undefined, 2))


// -------------------------------------
var writer = csvWriter({ headers: [
  "first_name",
  "last_name",
  "username",
  "email",
  "gender",
  "birth_year",
  "dob",
  "member_since",

  "start_time",
  "trip_duration",
  "start_station_name",
  "end_station_name",

  "start_station_id",
  "end_station_id",
]})
writer.pipe(fs.createWriteStream('trips.csv'))
trips.forEach(function (trip) {

  var gender = profile.gender == 'Male' ? 1 : 2;
  var birthYear = new Date(profile.dateOfBirth).getUTCFullYear();

  writer.write([
    profile.firstName,
    profile.lastName,
    profile.username,
    profile.email,
    gender,
    birthYear,
    profile.dateOfBirth,
    profile.member_since,

    trip.date,
    trip.durationSeconds,
    trip.startStation,
    trip.endStation,

    0,
    0
  ])
})


// -----------------------------------------------------------------------------

function processProfile() {
  var profile = {}
  var h = fs.readFileSync('raw/intro.html', 'utf8')
  var $ = cheerio.load(h)
  profile.firstName = $('.ed-panel__info__value_firstname').text().trim()
  profile.lastName = $('.ed-panel__info__value_lastname').text().trim()
  profile.username = $('.ed-panel__info__value_username').text().trim()
  profile.dateOfBirth = $('.ed-panel__info__value_date-of-birth').text().trim()
  profile.gender = $('.ed-panel__info__value_gender').text().trim()
  profile.email = $('.ed-panel__info__value_email').text().trim()
  profile.memberSince = $('.ed-panel__info__value_member-since').text().trim()
  return profile
}


function processTrips() {
  var trips = []
  var files = fs.readdirSync('raw')
  files.forEach(function (file) {
    if (file.indexOf("page") != 0) return;

    var h = fs.readFileSync('raw/' + file, 'utf8')
    var $ = cheerio.load(h)

    $('.ed-table__item').each(function () {

      var trip = {}

      trip.date = $(this).find('.ed-table__item__info__sub-info_trip-start-date').text().trim()
      trip.startStation = $(this).find('.ed-table__item__info__sub-info_trip-start-station').text().trim()
      trip.endStation = $(this).find('.ed-table__item__info__sub-info_trip-end-station').text().trim()
      trip.duration = $(this).find('.ed-table__item__info_trip-duration').text().trim()
      trip.cost = $(this).find('.ed-table__col_trip-cost').text().trim()

      trip.durationSeconds = convertDuration(trip.duration)
      trip.displayDate = new Date(trip.date)

      // One time I didn't dock a bike properly and eneded up with a 13 hour ride.
      // Assume that rides longer than 6 hours are bogus
      if (trip.durationHours > 6) return

      trips.push(trip)
    })
  })
  return trips
}

function convertDuration(dur) {
  var s = parseInt(dur.match(/(\d+) s/))
  var m = parseInt(dur.match(/(\d+) min/))
  var h = parseInt(dur.match(/(\d+) h/))

  var seconds = 0
  if (s) seconds += s
  if (m) seconds += m * 60
  if (h) seconds += h * 3600

  return seconds
}
