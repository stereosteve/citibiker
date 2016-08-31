[WIP] Scrape your personal ride data from the citibike website using nightmare.js.

```
npm install
CITIBIKE_EMAIL="one@two.com"  CITIBIKE_PASSWORD="xxxyyyzzz"  node scrape.js
node process.js
cat trips.json
```

---

## Identifying your trips in the public record

Starting with db created by [this cool project](http://toddwschneider.com/posts/a-tale-of-twenty-two-million-citi-bikes-analyzing-the-nyc-bike-share-system/)

```sql
    CREATE TABLE my_trips_raw (
      first_name varchar,
      last_name varchar,
      username varchar,
      email varchar,
      gender integer,
      birth_year integer,
      dob timestamp without time zone,
      member_since timestamp without time zone,

      start_time timestamp without time zone,
      trip_duration numeric,
      start_station_name varchar,
      end_station_name varchar,

      start_station_id integer,
      end_station_id integer
    );
```

```
    cat trips.csv | psql nyc-citibike-data -c "COPY my_trips_raw FROM stdin WITH CSV HEADER;"
```

```sql
    UPDATE my_trips_raw
    SET start_station_id = s.id
    FROM stations s
    WHERE my_trips_raw.start_station_name = s.name;

    UPDATE my_trips_raw
    SET end_station_id = s.id
    FROM stations s
    WHERE my_trips_raw.end_station_name = s.name;

```

Now identify your trips from the global trip record:
The trip start times + durations are sometimes off by a second,
so there is a range for start time and trip duration,
which is slow but seems to identify all the trips.

```sql
    SELECT
        t.*
    FROM
        trips t,
        my_trips_raw me
    WHERE
        date_trunc('minute', t.start_time) = date_trunc('minute', me.start_time) AND
        t.trip_duration > me.trip_duration - 2 AND
        t.trip_duration < me.trip_duration + 2 AND
        t.gender = me.gender AND
        t.birth_year = me.birth_year;
```

---

Credits

* http://stackoverflow.com/questions/34596811/dynamic-paging-with-nightmare-electron-page-scrape
* https://github.com/toddwschneider/nyc-citibike-data
