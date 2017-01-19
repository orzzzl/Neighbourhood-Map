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
            },
            error: function() {
                alert("Failing to get NY times");
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
            },
            error: function() {
                alert("Failing to get Pics from foursquare");
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
    
}


var mapoptions = {
    zoom: 16,
    center: new google.maps.LatLng(40.727009448706866, -74.07961136564653),
}



var content;
//keep track of the previously opened infowindow
var previousopen = null;


var currentVenue = ko.observable();

var VenuesViewModel = function() {
	var self = this;
    self.venues = ko.observableArray([]);
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
    self.setVenue = function(clickedVenue) {
        currentVenue(clickedVenue);
        currentVenue().markerClickHandler();
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
    
    return self;

}

ko.bindingHandlers.googlemap = {
    update: function (element, valueAccessor) {
        console.log("googlemap update called");
        var venues = valueAccessor().venues(),
        map = new google.maps.Map(element, mapoptions);
        venues.forEach(function(e) {
            e.latLng = new google.maps.LatLng(e.lat(), e.lng()),
            e.marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: e.latLng,
                map: map,
                icon: "imgs/icon.svg"
            });    
            e.marker.addListener('click', function(){
                VenuesViewModel().setVenue(e);
            });

            e.markerClickHandler = function() {
                //auto close the previously opened infowindow;
                if (previousopen != null) previousopen.close();
                previousopen = e.infowindow;
                e.infowindow.open(map, e.marker);
                if (e.marker.getAnimation() !== null) {
                    e.marker.setAnimation(null);
                } else {
                    e.marker.setAnimation(google.maps.Animation.BOUNCE);
                }
                window.setTimeout(function(){
                    e.marker.setAnimation(null);                  
                }, 1555);
            }

            e.infowindow = new google.maps.InfoWindow({
                content: $('#info')[0]
            });

        });
    }
};

ko.applyBindings(new VenuesViewModel());
