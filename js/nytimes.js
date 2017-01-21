var apikey = "4ac14040bca040e19edfffcbad7a7dbb";

var formNYTimesUrl = function (name) {
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json?";
    url += $.param({
        'api-key': apikey,
        'q': name
    });
    return url;
}