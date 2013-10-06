var Venmo = function (clientId, scope) {
  var endpoint = '/venmo';
  var accessToken = loadPageVar('access_token');

  // from https://developer.mozilla.org/en-US/docs/Web/API/window.location
  function loadPageVar (sVar) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  function optionalArg(argVal, defaultVal) {
    return (typeof argVal === "undefined") ? defaultVal : argVal;
  }

  // from http://stackoverflow.com/a/1714899
  var serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
    return str.join("&");
  }

  function _failure(res, status) {
    console.error(status + ': ' + res);
  }

  function post(path, params, success, failure) {
    failure = optionalArg(failure, _failure);
    params = serialize(params);

    var http = new XMLHttpRequest();
    http.open('POST', path, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200) {
        if (success) return success(http.responseText);
        else if (failure && http.status !== 200) return failure(http.responseText);
      }
    }
    http.send(params);
  }

  function get(path, params, callback) {
    var http = new XMLHttpRequest();
    http.open('GET', path + '?' + serialize(params), false);
    http.send(null);
    callback(JSON.parse(http.responseText), http.status);
  }

  function authorize() {
    if (accessToken)
      return accessToken;

    var authEndpoint = 'https://api.venmo.com/oauth/authorize';
    window.location.href = authEndpoint + '?client_id=' + clientId
                                        + '&scope=' + scope;
  }

  function isAuthorized() {
    return !!accessToken;
  }

  function user(userId) {
    var path = endpoint + '/users/' + userId;
    if (arguments.length === 0)
      path = endpoint + '/me';
    return get(path, { access_token: accessToken }, function (res) {
      return res;
    });
  }

  function friends(callback, userId) {
    var path = endpoint + '/users/' + userId + '/friends';
    if (arguments.length < 2)
      path = endpoint + '/me/friends';
    var params = { access_token: accessToken };
    get(path, params, function (res) {
      callback(res.friends); // TODO: handle pagination
    });
  }

  function pay(callback, userId, note, amount) {
    var path = endpoint + '/payments';
    var params = {
      access_token: accessToken,
      user_id: userId,
      note: note,
      amount: amount,
      audience: 'friends'
    };
    return post(path, params, function (res) { return callback(res); });
  }

  function charge(userId, note, amount, callback) {
    // charge is same as pay with negative amount
    return pay(userId, note, '-' + amount.toString(), callback);
  }

  function payments(limit, after, before) {
    var path = endpoint + '/payments';
    var params = { access_token: accessToken };
    if (arguments.length >= 1) params['limit'] = limit;
    if (arguments.length >= 2) params['after'] = after;
    if (arguments.length >= 3) params['before'] = before;
    return post(path, params, function (res) { return res; });
  }

  function payment(paymentId) {
    var path = endpoint + '/payments' + paymentId;
    return post(path, { access_token: accessToken }, function (res) {
      return res;
    });
  }

  if (arguments.length === 0)
    throw 'No client ID provided.'
  if (arguments.length === 1)
    scope = optionalArg(scope, 'access_feed,access_profile,access_friends,make_payments');

  return {
    isAuthorized: isAuthorized,
    authorize: authorize,
    user: user,
    friends: friends,
    pay: pay,
    charge: charge,
  };
};
