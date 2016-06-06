# atlasboard-localdash

A collection of tools relevant to locally-oriented dashboards.  This is intended to run as an [atlasboard](https://bitbucket.org/atlassian/atlasboard) submodule.

## Staticmap
<img align="right" src="http://maps.googleapis.com/maps/api/staticmap?center=45.496849,-73.574701&size=200x200&zoom=15&markers=color:green|label:X|45.496849,-73.574701&style=feature:all|element:labels.text.fill|color:0xffffff|weight:0.20|lightness:28|saturation:23|visibility:off&style=feature:all|element:labels.text.stroke|color:0x494949|lightness:13|visibility:off&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative|element:geometry.fill|color:0x000000&style=feature:administrative|element:geometry.stroke|color:0x144b53|lightness:14|weight:1.4&style=feature:landscape|element:all|color:0x08304b&style=feature:poi|element:geometry|color:0x0c4152|lightness:5&style=feature:road.highway|element:geometry.fill|color:0x000000&style=feature:road.highway|element:geometry.stroke|color:0x0b434f|lightness:25&style=feature:road.arterial|element:geometry.fill|color:0x000000&style=feature:road.arterial|element:geometry.stroke|color:0x0b3d51|lightness:16&style=feature:road.local|element:geometry|color:0x000000&style=feature:transit|element:all|color:0x146474&style=feature:water|element:all|color:0x021019&markers=color:gray|size=small|label:0|45.50023354666628,-73.57112646102905&markers=color:red|label:3|45.4996771,-73.57884854&markers=color:red|label:4|45.49486,-73.57108&markers=color:red|label:7|45.5014018,-73.5718136|45.49684196538493,-73.57885122299194|45.49449932378212,-73.57417345046997&markers=color:red|label:9|45.49863930330429,-73.57422709465027|45.49220043196677,-73.57639700174332&markers=color:red|label:9|45.49947,-73.57591|45.49642,-73.57616|45.50171494932855,-73.57413053512573|45.50015,-73.56928|45.493718,-73.579186|45.49606,-73.57348|45.50038,-73.57507|45.50068473942228,-73.57215642929077|45.497697,-73.568646|45.49932551028458,-73.57176750898361|45.49659,-73.57851" />
Creates a static image Google Map which is themeable and can have bixi-style bike sharing stations with bike availability added as markers. 
At this time only bixi sharing services are supported, at this time General Bikeshare Feed Specification (GBFS) is not supported.

The motivation to use a static map is that the ChromeCast is slow to render JavaScript maps (and add a webanimation showing a glowing point around your origin and watch it crash!)

The `jobs` code has the bike sharing-parsing portion and theming portion separable.  (My node/atlasboard knowledge doesn't know how to break this out, PRs welcome).

### Configuration:
```javascript
  "mystaticmap": {
     "lat": 40.76727,
     "lon":-73.99392888,
     "city": "nyc"
  }
```
 
  Supported city bike sharing service values:
   montreal, ottawa, boston, chicago, nyc, toronto, columbus, chattanooga, sf
 
  OPTIONAL
```javascript
     "key" : "YourGoogleAPIKey",
     "limit": 600,
     "count": 20,
     "size": "640x640",
     "zoom": 16,
     "theme": "midnightcommander"
```
`key` see Googles Static Maps [Usage Limits](https://developers.google.com/maps/documentation/static-maps/usage-limits)

`limit` is the distance in meters from the `lat` and `lon` position.

`count` is the max number of stations to gather independent of distance.

`size` is limited to 640x640 without a premium account

`zoom` is optional, but I find the default guess is pretty wide angle.

`theme` is detailed below.

#### Theming

Full credit goes to:
 *  http://stackoverflow.com/a/23154011/128165
 *  http://jsfiddle.net/s6Dyp/18/

Themes are files in the `jobs/themes/` directories and are JSON files as in the [Snazzymaps](https://snazzymaps.com) JSON format.  (Unfortunately at this time I don't have an easier way than cut and paste to get these files.  I've looked at their dev API and it doesn't immediately do what I want.)
