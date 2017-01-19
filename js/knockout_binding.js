function venue(data, search_text) {
    var self = this;
    self.name = ko.observable(data.name);
    self.location = ko.observable(data.location);
    self.lat = ko.observable(data.location.lat);
    self.lng = ko.observable(data.location.lng);
    self.vid = ko.observable(data.vid);
    self.search_text = search_text;
    self.gotNewsAready = false;
    self.gotPhotosAlready = false;
    self.news = ko.observableArray([]);
    self.photos = ko.observableArray([]);
    self.getNews = function() {
        if (self.gotNewsAlready) {
            console.log("NY Times News feeds for this venue is got already, won't request again");
            return;
        } else {
            self.gotNewsAlready = true;
        }
        console.log("Now starting to get NY time news feeds");
        $.ajax({
            dataType: "json",
            url: formNYTimesUrl(self.name()),
            success: function(res) {
                console.log("Successful in getting NY Times News feeds!");
                res.response.docs.forEach(function(feed) {
                    self.news.push({
                        url: feed.web_url,
                        headline: feed.headline.main
                    });
                });
            }
        });
    }
    self.getPhoto = function() {
        if (self.gotPhotosAlready) {
            console.log("Photo for this venue is got already, won't request again");
            return;
        } else {
            self.gotPhotosAlready = true;
        }
        console.log("Now starting to get photos via foursquare's api!!!");
        var limit = 5;
        $.ajax({
            dataType: "json",    
            url: formPhotoUrl(self.vid(), limit),
            success: function(res) {
                console.log("Success!!! We got photos from foursquare.");
                res.response.photos.items.forEach(function(photo) {
                    var purl = photo.prefix + "cap300" + photo.suffix;
                    self.photos.push({
                        url: purl
                    });
                });
            }
        });
    }
    self.hasPic = function() {
        self.getPhoto();
        return self.photos().length > 0;
    }
    
    self.hasNews = function() {
        self.getNews();
        return self.news().length > 0;
    }
    
    self.showOnMap = function() {
        console.log(self.search_text());
        return true;
    }
    self.marker = ko.observable(new google.maps.Marker({
        position: new google.maps.LatLng(self.lat(), self.lng()),
        title: self.name(),
        map: map,
    }));
}


var mapoptions = {
    zoom: 16,
    center: new google.maps.LatLng(40.727009448706866, -74.07961136564653),
}

ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var venues = valueAccessor().venues(),
        map = new google.maps.Map(element, mapoptions);
        venues.forEach(function(e) {
            latLng = new google.maps.LatLng(e.lat(), e.lng()),
            marker = new google.maps.Marker({
                position: latLng,
                map: map
            });    
        });
    },
    update: function (element, valueAccessor) {
        var venues = valueAccessor().venues(),
        map = new google.maps.Map(element, mapoptions);
        venues.forEach(function(e) {
            latLng = new google.maps.LatLng(e.lat(), e.lng()),
            marker = new google.maps.Marker({
                position: latLng,
                map: map
            });    
        });
    }
};


var VenuesViewModel = function() {
	var self = this;
    self.venues = ko.observableArray([]);
    self.currentVenue = ko.observable();
    self.searchText = ko.observable("");
    self.searchText.extend({
      rateLimit: {
        timeout: 400,
        method: "notifyWhenChangesStop"
      }
    });
    data.forEach(function(e) {
        self.venues.push(new venue(e, self.searchText));
    });
    this.setVenue = function(clickedVenue) {
        self.currentVenue(clickedVenue);
    }
    
    //filter the items using the filter text
    self.filteredVenues = ko.computed(function() {
        var filter = self.searchText().toLowerCase().trim();
        if (!filter) {
            return self.venues();
        } else {
            return ko.utils.arrayFilter(self.venues(), function(item) {
                // filtering for string name contain the search text
                return item.name().toLowerCase().indexOf(filter) !== -1;
            });
        }
    }, self);
}

ko.applyBindings(new VenuesViewModel());
