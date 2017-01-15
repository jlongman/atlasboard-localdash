# atlasboard-localdash

A collection of tools relevant to locally-oriented dashboards supporting car2go, biki bike sharing and the Montreal metro.  This is intended to run as an [atlasboard](https://bitbucket.org/atlassian/atlasboard) submodule.

<img src="https://cloud.githubusercontent.com/assets/1051995/21964260/a321c7c6-db16-11e6-88e4-857745bf25d7.png" width="600"/>

Note the shown dashboard includes [altlasboard-social](https://bitbucket.org/jlongman/atlasboard-social-package) for twitter, [atlasboard-weather](http://www.github.com/jlongman/atlasboard-weather/)  and a slightly modified `google-calendar` job/widget from the `atlasboard-demo` package. (middle-right, bottom-middle and middle-bottom, respectively.)


- [Metro514](#metro514)
- [Staticmap](#staticmap)
- [Traveltime](#traveltime)
- [Traveltimemap](#traveltimemap)

## [Metro514](#metro514)

<img align="right" src="https://cloud.githubusercontent.com/assets/1051995/21964291/54427abe-db17-11e6-8fe4-e47e478772c2.png">
Creates a table showing the current Montreal metro line status and the current message from the STM. Non-normal conditions are highlighted.  This works best as a 1-column, 2-row element.

### Configuration:

All configuration options are optional.

```javascript
  "metro514": {
    "language": "english"
  }
```

### Values

The `language` configuation option can be either `english` or `french`.


## [Staticmap](#staticmap)

<img align="right" src="https://maps.googleapis.com/maps/api/staticmap?center=45.518001045,-73.582190073&size=200x200&zoom=16&markers=color:green|label:X|45.518001045,-73.582190073&markers=color:red|label:1|45.522278,-73.577591&markers=color:red|label:6|45.515161,-73.581095|45.52102,-73.585514|45.522413,-73.58413&markers=color:red|label:9|45.520018,-73.579463&markers=color:red|label:9|45.516777,-73.577784|45.520655,-73.575871|45.519523,-73.583618|45.518593,-73.581566|45.5171,-73.57921|45.517643,-73.588928|45.51494,-73.57821|45.51561,-73.57569|45.5215,-73.5851|45.517354,-73.582129|45.519237,-73.577215|45.51496,-73.58503|45.51941,-73.58685|45.517,-73.589&markers=color:blue|45.51812,-73.58358|45.51815,-73.58368|45.51862,-73.58018|45.51825,-73.58475|45.51736,-73.58557|45.51843,-73.58621|45.51591,-73.57897|45.52023,-73.58813|45.52156,-73.58788|45.52276,-73.57858&style=feature:all|element:labels.text.fill|color:0xffffff|weight:0.20|lightness:28|saturation:23|visibility:off&style=feature:all|element:labels.text.stroke|color:0x494949|lightness:13|visibility:off&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative|element:geometry.fill|color:0x000000&style=feature:administrative|element:geometry.stroke|color:0x144b53|lightness:14|weight:1.4&style=feature:landscape|element:all|color:0x08304b&style=feature:poi|element:geometry|color:0x0c4152|lightness:5&style=feature:road.highway|element:geometry.fill|color:0x000000&style=feature:road.highway|element:geometry.stroke|color:0x0b434f|lightness:25&style=feature:road.arterial|element:geometry.fill|color:0x000000&style=feature:road.arterial|element:geometry.stroke|color:0x0b3d51|lightness:16&style=feature:road.local|element:geometry|color:0x000000&style=feature:transit|element:all|color:0x146474&style=feature:water|element:all|color:0x021019" />
Creates a static image Google Map which is themeable and can have bixi-style bike sharing stations with bike availability added as markers. 
At this time only bixi bike sharing and Car2Go car sharing services are supported. General Bikeshare Feed Specification (GBFS) is not supported.

The motivation to use a static map is that the ChromeCast is slow to render JavaScript maps (e.g. add a webanimation showing a glowing point around your origin and watch it crash!)

The `jobs` code has the bike sharing-parsing portion and theming portion separable.  (My node/atlasboard knowledge doesn't know how to break this out, PRs welcome).

### Configuration:

```javascript
  "mystaticmap": {
     "lat": 40.76727,
     "lon":-73.99392888,
     "limit": 600,
     "count": 20,
     "maptype": "terrain",
     "size": "640x640",
     "zoom": 16,
     "theme": "midnightcommander"
     "bixi":{
       "city": "montreal"
     },
     "car2go":{
       "loc": "montreal",
       "apikey": "Your Car2GoConsumerKey"
     }
  }
```
### Mandatory

- `lat` and `lon` are mandatory
- if you use `bixi` you must set a `city`
- if you use `car2go` you must set a `loc` and `apikey` 

### Values

Supported city bike sharing service values:
   montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
   
All car2go values for `car2go.loc` are supported.  
 
`limit` is the distance in meters from the `lat` and `lon` position.

`count` is the max number of stations to gather independent of distance.

`size` is limited to 640x640 without a premium account

`zoom` is optional, but I find the default guess is pretty wide angle.

`theme` is detailed below.

`maptype` can be `roadmap`, `satellite`, `hybrid` or `terrain`

`transitcolor` is any valid Google Maps API colour and highlights non-specified links. E.g. if a leg has no specified colour it will use the `transitcolor`. Most useful with themes.

#### Google Static Maps API Key

Adding a Static Maps API Key permits access to higher resolution and more features, at a premium.  It also permits them to track by API key instead of by IP address.  It is mandatory if you want a map larger than 640x640.

In your `globalAuth.json` you should add:
```javascript
    "staticmap": {
        "apikey" : "YourGoogleStaticMapAPIKey"
    }
```

#### Theming

Full credit goes to:
 *  http://stackoverflow.com/a/23154011/128165
 *  http://jsfiddle.net/s6Dyp/18/

Themes are files in the `jobs/themes/` directories and are JSON files as in the [Snazzymaps](https://snazzymaps.com) JSON format.  (Unfortunately at this time I don't have an easier way than cut and paste to get these files.  I've looked at their dev API and it doesn't immediately do what I want.)

## [Traveltime](#traveltime)

<img align="right" src="https://cloud.githubusercontent.com/assets/1051995/15907327/b6180884-2d8a-11e6-98c8-16f18aab7034.png"/>Show a travel time a specific origin and destination. 

### Configuration:
```javascript
  "mystaticmap": {
     "origin_lat": 40.76727,
     "origin_lon":-73.99392888,
     "destination_lat": 40.0,
     "destination_lon":-73.0,
     "mode": "bicycling",
  }
```
Also valid:
```javascript
  "mystaticmap": {
     "origin": "4200 Saint Laurent, Montreal, PQ, Canada",
     "destination": "Old Montreal, Montreal, PQ, Canada",
     "mode": "driving"
  }
```
### Mandatory

- `origin_lat` and `origin_lon` (together) OR `origin` are mandatory
- `destination_lat` and `destination_lon`(together) OR `destination` are mandatory

### Values

`mode` can be `driving`, `walking`, `bicycling`, `transit`. Default is `driving`.

#### Google API Key

Adding a Google API Key permits access more features, at a premium.  It also permits them to track by API key instead of by IP address.  

In your `globalAuth.json` you should add:
```javascript
    "traveltime": {
        "apikey" : "YourGoogleAPIKey"
    }
```

*TODO*:  confirm distinction with static map and directions api keys, possibly distinguish


## [Traveltimemap](#traveltimemap)

<img align="right" src="https://cloud.githubusercontent.com/assets/1051995/15907326/b609bbbc-2d8a-11e6-94e3-08dcdf35dcba.png"/>Show a travel time and route for a specific origin and destination.

### Configuration:
```javascript
  "mystaticmap": {
     "origin_lat": 40.76727,
     "origin_lon":-73.99392888,
     "destination_lat": 40.0,
     "destination_lon":-73.0,
     "mode": "bicycling",
     "maptype": "terrain",
     "size": "200x200",
     "transitcolor": "red",
  }
```
Also valid:
```javascript
  "mystaticmap": {
     "origin": "4200 Saint Laurent, Montreal, PQ, Canada",
     "destination": "Old Montreal, Montreal, PQ, Canada",
  }
```

### Mandatory

- `origin_lat` and `origin_lon` (together) OR `origin` are mandatory
- `destination_lat` and `destination_lon`(together) OR `destination` are mandatory

### Values

`mode` can be `driving`, `walking`, `bicycling`, `transit`

`size` is limited to 640x640 without a premium account

`zoom` is optional, but the default guess works

`theme` is detailed below.

`maptype` can be `roadmap`, `satellite`, `hybrid` or `terrain`

`transitcolor` is any valid Google Maps API colour and highlights non-specified links. E.g. if a leg has no specified colour it will use the `transitcolor`. Most useful with themes.

#### Google Static Maps API Key

Adding a Static Maps API Key permits access to higher resolution and more features, at a premium.  It also permits them to track by API key instead of by IP address.  It is mandatory if you want a map larger than 640x640.

In your `globalAuth.json` you should add:
```javascript
    "traveltimemap": {
        "apikey" : "YourGoogleStaticMapAPIKey"
    }
```

*TODO*:  confirm distinction with static map and directions api keys, possibly distinguish

#### Theming

(!) At this time themes are only static strings.  Once I understand how to share themes with [Staticmap] I will add this.

```javascript
  "themeString": "&style=feature:all|element:labels.text.fill|color:0xffffff|weight:0.20|lightness:28|saturation:23|visibility:off&style=feature:all|element:labels.text.stroke|color:0x494949|lightness:13|visibility:off&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative|element:geometry.fill|color:0x000000&style=feature:administrative|element:geometry.stroke|color:0x144b53|lightness:14|weight:1.4&style=feature:landscape|element:all|color:0x08304b&style=feature:poi|element:geometry|color:0x0c4152|lightness:5&style=feature:road.highway|element:geometry.fill|color:0x000000&style=feature:road.highway|element:geometry.stroke|color:0x0b434f|lightness:25&style=feature:road.arterial|element:geometry.fill|color:0x000000&style=feature:road.arterial|element:geometry.stroke|color:0x0b3d51|lightness:16&style=feature:road.local|element:geometry|color:0x000000&style=feature:transit|element:all|color:0x146474&style=feature:water|element:all|color:0x021019"
```
