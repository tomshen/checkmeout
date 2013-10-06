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
    console.err(http.status + ': ' + http.responseText);
  }

  function post(path, params, success, failure) {
    failure = optionalArg(failure, _failure);

    params = serialize(params);
    http.open('POST', path, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.setRequestHeader('Content-length', params.length);
    http.setRequestHeader('Connection', 'close');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200) {
        if (success) return success(http.responseText);
        else if (failure && http.status !== 200) return failure(http.responseText);
      }
    }
    http.send(params);
  }

  function get(path, params, success, failure) {
    failure = optionalArg(failure, _failure);
    var http = new XMLHttpRequest();
    http.open('GET', path + '?' + serialize(params), false);
    http.send(null);
    if (success && http.status === 200) return success(http.responseText, http.status);
    else if (failure) return failure(http.responseText, http.status);
  }

  function authorize() {
    if (accessToken)
      return accessToken;

    var authEndpoint = endpoint + '/oauth/authorize';
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

  function friends(userId) {
    var path = endpoint + '/users/' + optionalArg(userId, user()[id])
             + '/friends';
    var params = { access_token: accessToken };
    if (limit) params['limit'] = limit;
    if (after) params['after'] = after;
    if (before) params['before'] = before;
    return get(path, params, function (res) {
      return res; // TODO: handle pagination
    });
  }

  function pay(userId, note, amount, audience) {
    audience = optionalArg(audience, 'friends');

    var path = endpoint + '/payments';
    var params = {
      access_token: accessToken,
      user_id: userId,
      note: note,
      amount: amount,
      audience: audience
    };
    return post(path, params, function (res) { return res; });
  }

  function charge(userId, note, amount, audience) {
    // charge is same as pay with negative amount
    return pay(userId, note, '-' + amount.toString(), audience);
  }

  function payments(limit, after, before) {
    var path = endpoint + '/payments';
    var params = { access_token: accessToken };
    if (limit) params['limit'] = limit;
    if (after) params['after'] = after;
    if (before) params['before'] = before;
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
