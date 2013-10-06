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

function verify(receipt) {
  $('#verify').removeClass('is-hidden');
}

signin();