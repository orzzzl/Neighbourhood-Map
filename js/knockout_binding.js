function venue(data) {
    var self = this;
    self.name = ko.observable(data.name);
    self.location = ko.observable(data.location);
    self.vid = ko.observable(data.vid);
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
}



var VenuesViewModel = function() {
	var self = this;
    self.venues = ko.observableArray([]);
    self.currentVenue = ko.observable();
    data.forEach(function(e) {
        self.venues.push(new venue(e));
    });
    this.setVenue = function(clickedVenue) {
        self.currentVenue(clickedVenue);
    }
}

ko.applyBindings(new VenuesViewModel());
