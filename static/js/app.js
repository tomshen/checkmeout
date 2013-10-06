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

  $('#verify .receipt-action').click(function () {
    var ri = $('#verify .receipt-item');
    var total = 0;
    items = _.map(ri.slice(0, ri.length - 1), function (itemNode) {
      var i = {};
      i.name = itemNode.childNodes[1].innerHTML.trim();
      i.price = priceToInt(itemNode.childNodes[3].innerHTML);
      total += i.price;
      return i;
    });
    $('#verify').addClass('is-hidden');
    friends(items, total);
  });
}

function friends(items, total) {
  $('#friends').removeClass('is-hidden');

  venmo.friends(function (friends) {
    var friendsTemplate = _.template($('#template-venmo-friends').html());
    $('#friends').html(friendsTemplate({ venmoFriends: friends }));
    $('.friend').click(function () {
      $(this).toggleClass('is-selected');
    });

    $('#friends .receipt-action').click(function () {
      var selectedFriends = _.map($('.friend.is-selected'), function(e) {
        $(e).data();
        return $.data(e, 'userId');
      });
      $('#friends').addClass('is-hidden');
      claim(friends, selectedFriends, items, total);
    });
  });
}

function claim(friends, selectedFriends, items, fullTotal) {
  $('#claim').removeClass('is-hidden');

  var claimTotals = [];
  var itemFriends = {};

  var claimTemplate = _.template($('#template-claim').html());

  function chooseClaims(i) {
    var friend = _.filter(friends, function (f) {
      return f.id === selectedFriends[i];
    })[0];

    var currentUser = friend.display_name;

    $('#claim').html(claimTemplate({
      currentUser: currentUser,
      items: convertItems(JSON.parse(JSON.stringify(items))),
      total: '$0.00'
    }));

    $('#claim .receipt-item').click(function () {
      $(this).toggleClass('claimed');
      var totalPriceNode = $('#claim .receipt-item.total .item-cost');
      if($(this).hasClass('claimed'))
        totalPriceNode.html(intToPrice(priceToInt(totalPriceNode.html())
                                     + priceToInt($(this).children('.item-cost')[0].innerHTML)));
      else
        totalPriceNode.html(intToPrice(priceToInt(totalPriceNode.html())
                                     - priceToInt($(this).children('.item-cost')[0].innerHTML)));
    });

    $('#claim .receipt-action').click(function () {
      var total = 0;
      var claimedItems = _.map($('.receipt-item.claimed'), function (itemNode, i) {
        var i = {};
        i.name = itemNode.childNodes[1].innerHTML.trim();
        i.price = priceToInt(itemNode.childNodes[3].innerHTML);

        total += i.price;

        if (itemFriends.hasOwnProperty(i))
          itemFriends[i].push(currentUser);
        else itemFriends[i] = [ currentUser ];

        return i;
      });
      claimTotals.push({
        name: currentUser,
        price: total,
        userId: selectedFriends[i],
        items: claimedItems
      });
      if (i === selectedFriends.length - 1) {
        $('#claim').addClass('is-hidden');
        checkTotal(fullTotal, claimTotals, itemFriends);
      } else chooseClaims(i + 1);
    });
  }
  chooseClaims(0);
}

function checkTotal(total, claimTotals, itemFriends) {
  $('#total').removeClass('is-hidden');
  var totalTemplate = _.template($('#template-total').html());

  var remainingTotal = total;

  _.each(claimTotals, function (claim) {
    remainingTotal -= claim.price;
  });

  $('#total').html(totalTemplate({
    total: intToPrice(total),
    claimTotals: convertItems(claimTotals),
    remainingTotal: intToPrice(remainingTotal)
  }));

  $('#total .receipt-action').click(function () {
    $('#total').addClass('is-hidden');
    confirm(claimTotals);
  });
}

function confirm(claimTotals) {
  $('#confirm').removeClass('is-hidden');
  _.each(claimTotals, function (claim) {
    var note = JSON.stringify(_.pluck(claim.items, 'name'));
    venmo.pay(function (res) {
      console.log(res);
    }, claim.userId, note.slice(1, note.length - 1), '-' + claim.price.slice(1));
  });
}

signin();
