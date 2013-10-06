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
  $('.signin-submit').click(function () {
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

function convertPrice(price) {
  var p = price.toString(10);
  if (p.length === 0)
    return '$0.00';
  if (p.length === 1)
    return '$0.0' + p;
  if (p.length === 2)
    return '$0.' + p;
  return '$' + p.slice(0, p.length - 2) + '.' + p.slice(p.length - 2);
}

function convertItems(items) {
  return _.map(items, function (item) {
    item.price = convertPrice(item.price);
    return item;
  })
}

function verify(items) {
  $('#verify').removeClass('is-hidden');
  var total = _.reduce(items, function (memo, item) {
    return memo + item.price;
  }, 0);

  var verifyTemplate = _.template($('#template-verify').html());
  $('#verify').html(verifyTemplate({
    items: convertItems(items),
    total: convertPrice(total)
  }));

  friends(items, total);
}

function friends(items, total) {
  $('#verify').addClass('is-hidden');
  $('#friends').addClass('is-hidden');
}

signin();