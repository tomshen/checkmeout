var venmo = Venmo(1424);

function signin() {
  if (venmo.isAuthorized()) {
    $('#signin').addClass('is-hidden');
    picture();
  }

  $('.signin-button').click(function () {
    venmo.authorize();
  });
}

function picture() {
  $('#picture').removeClass('is-hidden');
  $('.picture-submit').click(function () {
    $.ajax({
      url: '/upload',
      data: new FormData($('#image-upload')[0]),
      processData: false,
      contentType: false,
      type: 'POST',
      success: function (receipt) {
        $('#picture').addClass('is-hidden');
        verify(receipt.items);
      }
    });
  });
}

function intToPrice(price) {
  var p = price.toString(10);
  if (p.length === 0)
    return '$0.00';
  if (p.length === 1)
    return '$0.0' + p;
  if (p.length === 2)
    return '$0.' + p;
  return '$' + p.slice(0, p.length - 2) + '.' + p.slice(p.length - 2);
}

function priceToInt(price) {
  return parseInt(price.replace(/\D/g,''), 10);
}

function convertItems(items) {
  return _.map(items, function (item) {
    item.price = intToPrice(item.price);
    return item;
  });
}

function verify(items) {
  $('#verify').removeClass('is-hidden');
  var total = _.reduce(items, function (memo, item) {
    return memo + item.price;
  }, 0);

  var verifyTemplate = _.template($('#template-verify').html());
  $('#verify').html(verifyTemplate({
    items: convertItems(items),
    total: intToPrice(total)
  }));

  $('.receipt-action').click(function () {
    var ri = $('.receipt-item');
    var total = 0;
    items = _.map(ri.slice(0, ri.length - 1), function (itemNode) {
      var i = {};
      i.name = itemNode.childNodes[1].innerHTML.trim();
      i.price = priceToInt(itemNode.childNodes[3].innerHTML);
      total += i.price;
      return i;
    });
    friends(items, total);
  });
}

function friends(items, total) {
  $('#verify').addClass('is-hidden');
  $('#friends').removeClass('is-hidden');

  venmo.friends(function (friends) {
    var friendsTemplate = _.template($('#template-venmo-friends').html());
    console.log(friends);
    $('#friends').html(friendsTemplate({ venmoFriends: friends }));
    $('.friend').click(function () {
      $(this).toggleClass('is-selected');
    });

    $('.receipt-action').click(function () {
      var selectedFriends = _.map($('.friend.is-selected'), function(e) {
        $(e).data();
        return $.data(e, 'userId')
      });
      claim(selectedFriends, items, total);
    });
  });
}

function claim(selectedFriends, items, total) {
  $('#friends').addClass('is-hidden');
  $('#claim').removeClass('is-hidden');
}

signin();
