# CMV-Widgets

[![Build Status](http://travis-ci.org/tmcgee/cmv-widgets.svg?branch=master)](http://travis-ci.org/tmcgee/cmv-widgets) [![Code Climate](https://codeclimate.com/github/tmcgee/cmv-widgets/badges/gpa.svg)](https://codeclimate.com/github/tmcgee/cmv-widgets) [![Join the chat at https://gitter.im/tmcgee/cmv-widgets](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tmcgee/cmv-widgets?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Widgets for [CMV](http://cmv.io/), the Configurable Map Viewer created by [Tim McGee](https://github.com/tmcgee) of [MoosePoint Technology](http://moosepoint.com/)

[See them live!](http://tmcgee.github.io/cmv-widgets/)

### Widgets Available in this Repo
- [Attributes Tables](https://github.com/tmcgee/cmv-widgets#attributes-tables)
- [Disclaimer](https://github.com/tmcgee/cmv-widgets#disclaimer)
- [Export](https://github.com/tmcgee/cmv-widgets#export)
- [Full Screen](https://github.com/tmcgee/cmv-widgets#fullscreen)
- [Geoprocessor](https://github.com/tmcgee/cmv-widgets#geoprocessor)
- [Layer Labels](https://github.com/tmcgee/cmv-widgets#layer-labels)
- [Layer Toggle](https://github.com/tmcgee/cmv-widgets#layer-toggle)
- [MessageBox](https://github.com/tmcgee/cmv-widgets#messagebox)
- [Open External Map](https://github.com/tmcgee/cmv-widgets#open-external-map)
- [Print Plus](https://github.com/tmcgee/cmv-widgets#print-plus)
- [Report](https://github.com/tmcgee/cmv-widgets#report)
- [Search](https://github.com/tmcgee/cmv-widgets#search)
- [Share](https://github.com/tmcgee/cmv-widgets#share)
- [Toggle StreeView Tiles](https://github.com/tmcgee/cmv-widgets#toggle-streetview-tiles)
- [What3Words](https://github.com/tmcgee/cmv-widgets#what3words)
- [Zoom to Feature](https://github.com/tmcgee/cmv-widgets#zoom-to-feature)

### Example Configurations
Each widget in this repo has at least one configuration example in the [config folder](https://github.com/tmcgee/cmv-widgets/tree/master/config). This folder also contains additional examples for including ESRI widgets, other widgets and functionality.

## Widgets
### Attributes Table(s)
A highly configurable widget to display the results of one or more Query, Find or Geoprocessor Tasks.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/AttributesTable/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=table)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/attributesTables1.jpg)

---
### Disclaimer
A simple yet configurable disclaimer widget.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/Disclaimer/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=disclaimer)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/disclaimer1.jpg)

![Screenshot](https://tmcgee.github.io/cmv-widgets/images/disclaimer2.jpg)

---
### Editor
Coming Soon

---
### Export
Export features from the [Attributes Tables](https://github.com/tmcgee/cmv-widgets#attributes-tables) widget or other widgets that have a [dgrid](http://dgrid.io).
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/Export/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=table)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/export1.jpg)

---
### FullScreen
A simple widget containing a button to toggle the CMV map to a maximized full screen view and restore it to the original dimensions.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/FullScreen/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=fullscreen)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/fullscreen1.jpg)

---
### Geoprocessor
An example widget demonstrating the display of results from a Geoprocessing Task in the [Attributes Tables](https://github.com/tmcgee/cmv-widgets#attributes-tables) widget.
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=geoprocessor)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/geoprocessor1.jpg)

---
### Layer Labels
A simple widget to add labels for one or more Feature Layers.
#####Documentation - in the works
#####[Widget](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/LayerLabels.js)

---
### Layer Toggle
A simple widget to toggle the visibility of a set of layers. Only a single layer in the set can be visible at any time. All others are turned off when the target layer's visibility is set.
#####Documentation - in the works
#####[Widget](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/LayerToggle.js)

---
### MessageBox
Show an Alert or Confirmation modal dialog box. Intended to be called from other widgets.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/MessageBox/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=messagebox)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/messagebox1.jpg)

---
### Multi-Field Geocoder
Coming Soon

---
### Open External Map
Open maps in an external window for Google Hybrid, Google StreetView, Bing Hybrid, Bing Bird's Eye, Bing Streetside, MapQuest and OpenStreetMap. The map is centered on the coordinates based on a map click or Latitude and Longitude values provided by the user. Can be combined with the [Toggle StreetView Tiles](https://github.com/tmcgee/cmv-widgets#toggle-streetview-tiles) widget to show the availability of Google StreetView while clicking on the map.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/OpenExternalMap/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=openexternalmap)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/openexternalmap1.jpg)

---
### Print Plus
An updated version of the PrintPlus widget originally created by [@LarryStout](https://github.com/LarryStout) in early 2014. Larry's original source code can be found in [here](https://github.com/tmcgee/cmv-hamilton-county) with a few of his other widgets.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/PrintPlus/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=printplus)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/printplus1.jpg)

---
### Report
Highly configurable widget used to create a mult-page PDF report from a single feature or multiple features.
#####Documentation - in the works
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=report)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/report1.jpg)

![Screenshot](https://tmcgee.github.io/cmv-widgets/images/report2.jpg)

---
###Search
Used in conjunction with the [Attributes Tables](https://github.com/tmcgee/cmv-widgets#attributes-tables) to provide a user interface for querying feature layers, dynamic layers, tables and related records using QueryTask and FindTask.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/Search/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=search)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/search1.jpg)

![Screenshot](https://tmcgee.github.io/cmv-widgets/images/search2.jpg)

---
###Share
Share your map by using Facebook, Twitter, Google+, E-Mail, Link, or embedded iFrame code.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/Share/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=share)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/share1.jpg)

---
### Toggle StreetView Tiles
Used in conjunction with the CMV StreetView widget or the [Open External Map](https://github.com/tmcgee/cmv-widgets#open-external-map). Shows a StreetView tiles layer when waiting for a map click to get coordinates for the respective widgets.
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=openexternalmap)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/openexternalmap1.jpg)

---
### What3Words
A simple widget to send a 3 word address or lat/lng to what3words and zoom the map to the resulting location. The lat/lng and 3 word address for the location are displayed from the search result.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/What3Words/README.md)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/what3words1.jpg)

---
### Zoom to Feature
A simple widget to provide a drop-down list of features to zoom to on the map. Similar to bookmarks but driven by actual data in a Map Service.
#####[Documentation](https://github.com/tmcgee/cmv-widgets/tree/master/widgets/ZoomToFeature/README.md)
#####[Demo](http://tmcgee.github.io/cmv-widgets/demo.html?config=zoomToFeature)
![Screenshot](https://tmcgee.github.io/cmv-widgets/images/zoomToFeature1.jpg)