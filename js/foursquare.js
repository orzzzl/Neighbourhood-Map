var formUrl = function(url) {
	return url + "&client_id=VQARG3HAL4WR31UZ02COVUZCJL004NH3H1LNSIOATK0JCNHT&client_secret=3ZTQLCNC1UIKFVAXNHFXY4GTHD4Q3S3LSIJR5JQU30Q2RJBM&&v=20161227%20&m=foursquare&near=Jersey%20;City&";
};


var formPhotoUrl = function(id, limit) {
    var url = "https://api.foursquare.com/v2/venues/";
    url += id;
    url += "/photos?limit=" + limit;
    return formUrl(url);
}