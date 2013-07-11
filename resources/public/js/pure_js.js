// added : trimming of keywords
//         abort if empty keywords
//         random delay on AJAX to give greater chance of out-of-order responses
// Ignores the fast/slow switch.  Response time is random by design :)

$(function() {

  var promise_list = {};

  var flickr_query_string = [
    "http://api.flickr.com/services/rest/",
    "?method="       + "flickr.groups.search",
    "&api_key="      + "10b278da620908b32d4cb5e044366699",
    "&text="         + "{{query}}",
    "&per_page="     + 10,
    "&format="       + "json",
    "&jsoncallback=" + "?"].join('');

  var results = $('#results');

  var execute_query = function(e) {

    results.empty();

    var keywords = $(this).val().trim();
    $('#query-title').html(keywords);

    if (keywords.length < 1) {
      return;
    }

    var url = flickr_query_string.replace(/{{query}}/, keywords);

    var random_delay = Math.random() * 1000;

    var promise = $.getJSON(url).promise();

    promise.done(function(result) {

      _.delay(function() {
        render_search_results(e.timeStamp, result, results);
      }, random_delay);

    });

    promise_list[e.timeStamp] = promise;
  };

  var render_search_results = function(timestamp, result, results) {

    delete promise_list[timestamp];

    if (result && result.stat != 'ok') {
      console.log('Error occured with %o', result);
      return;
    }

    // ignore non-current responses
    if (timestamp < _.max(_.keys(promise_list))) {
      console.log('Aborting - a newer request has been made.');
      return;
    }

    result = result.groups.group;

    var titles = _.reduce(result, function(memo, result) {
      memo.push(result.name);
      return memo;
    }, []);

    _.each(titles, _.bind(render_search_result, results));
  };

  var render_search_result = function(title) {
    this.append("<li>" + title + "</li>");
  };

  $('#query').on('keyup.first_event change.second_event', _.debounce(execute_query, 400));
});