var previousopen = null;
var map;

var startapp = function() {
    console.log('googlemap init called');
    var mapoptions = {
        zoom: 15,
        center: new google.maps.LatLng(40.736009448706866, -74.07961136564653),
    }
    map = new google.maps.Map($('#map')[0], mapoptions);

    var Venue = function(data) {
        var self = this;
        self.name = data.name;
        self.location = data.location;
        self.lat = data.location.lat;
        self.lng = data.location.lng;
        self.vid = data.vid;
        self.gotNewsAready = false;
        self.gotPhotosAlready = false;
        self.renderStrAlready = false;
        self.news = ko.observableArray([]);
        self.photos = ko.observableArray([]);

        //I pass the function of set the infowindow as a callback so that it will only be called after the ajax function complete.
        self.getNews = function(callback) {
            if (self.gotNewsAlready) {
                console.log("NY Times News feeds for this venue is got already, won't request again");
                callback();
                return;
            } else {
                self.gotNewsAready = true;
            }
            console.log("Now starting to get NY time news feeds");
            $.ajax({
                dataType: "json",
                url: formNYTimesUrl(self.name),
                success: function(res) {
                    console.log("Successful in getting NY Times News feeds!");
                    res.response.docs.forEach(function(feed) {
                        self.news.push({
                            url: feed.web_url,
                            headline: feed.headline.main
                        });
                    });
                    callback();
                    self.str += '</div>';
                },
                error: function(callback) {
                    alert("Failing to get NY times");
                    self.str += '</div>';
                    callback();
                }
            });
        }
        self.getPhoto = function(callback) {
            if (self.gotPhotosAlready) {
                console.log("Photo for this venue is got already, won't request again");
                self.getNews(callback);
                return;
            } else {
                self.gotPhotosAlready = true;
            }
            console.log("Now starting to get photos via foursquare's api!!!");
            var limit = 5;
            $.ajax({
                dataType: "json",    
                url: formPhotoUrl(self.vid, limit),
                success: function(res) {
                    console.log("Success!!! We got photos from foursquare.");
                    res.response.photos.items.forEach(function(photo) {
                        var purl = photo.prefix + "cap300" + photo.suffix;
                        self.photos.push({
                            url: purl
                        });
                    });
                    self.getNews(callback);
                },
                error: function() {
                    alert("Failing to get Pics from foursquare");
                    self.getNews(callback);
                }
            });
        }

        self.marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(self.lat, self.lng),
                map: map,
                icon: "imgs/icon.svg"
        });    

        self.marker.addListener('click', function(){
            vm.setVenue(self);
        });

        self.markerClickHandler = function() {
            //auto close the previously opened infowindow;
            if (previousopen != null) previousopen.close();
            previousopen = self.infowindow;
            self.infowindow.open(map, self.marker);
            if (self.marker.getAnimation() !== null) {
                self.marker.setAnimation(null);
            } else {
                self.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
            window.setTimeout(function(){
                self.marker.setAnimation(null);                  
            }, 1400);
        }

        self.infowindow = new google.maps.InfoWindow({});       

        self.render = function() {
            self.getPhoto(self.setinfowindow);
        }

        self.setinfowindow = function() {
            var str = '<div class="mosaic" id="info">';
            str += '<h3>' + self.name + '</h3>';
            str += '<p class="small">' + (self.location.address || "") +  '</p>';
            str += '<p class="small">' + (self.location.city || "") + '</p>';
            str += '<p class="small">' + (self.location.state || "") + '</p>';
            str += '<p class="small">' + (self.location.country || "") + '</p>';
            if (self.photos().length > 0) {
                str += '<h3> Pics from foursquare: </h3>';
                self.photos().forEach(function(pic){
                    str += '<img src="' + pic.url + '" alt="venue image" width="200px">';
                    str += '<br><br>';
                });
            }
            if (self.news().length > 0) {
                str += '<h3> New York Times news feed: </h3>';
                self.news().forEach(function(nynews) {
                    str += `<i class="fa fa-arrow-right" aria-hidden="true"></i><a target="_blank", href="` + nynews.url + '}">' + nynews.headline + `</a><br>`;
                });
            }
            str += '</div>';
            self.infowindow.setContent(str);
        }
    }

    var VenuesViewModel = function() {
        var self = this;
        self.searchText = ko.observable("");
        self.searchText.extend({
          rateLimit: {
            timeout: 400,
            method: "notifyWhenChangesStop"
          }
        });
        self.venues = ko.observableArray([]);
        self.currentVenue = ko.observable();
        data.forEach(function(e) {
            self.venues.push(new Venue(e));      
        });
        self.setVenue = function(clickedVenue) {
            self.currentVenue(clickedVenue);
            self.currentVenue().render();
            self.currentVenue().markerClickHandler();
        }

        //filter the items using the filter text
        self.filteredVenues = ko.computed(function() {
            var filter = self.searchText().toLowerCase().trim();
            if (!filter) {
                self.venues().forEach(function(v) {
                    v.marker.setVisible(true);    
                });
                return self.venues();
            } else {
                return ko.utils.arrayFilter(self.venues(), function(item) {
                    var match = item.name.toLowerCase().indexOf(filter) !== -1;
                    item.marker.setVisible(match)
                    return match;
                });
            }
        }, self);
    }

    var vm = new VenuesViewModel();
    ko.applyBindings(vm);

}
