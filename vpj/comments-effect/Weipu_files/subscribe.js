$(function() {

$('a.subscribe').click(function() {
  var $this = $(this);
  var uid = $this.data('userid');
  var subscribed = $this.data('subscribed');
  if (subscribed == 'yes') {
    var path = '/res/users/' + uid + '/unfollow';
    $.post(path);
    $this.text($this.data('todo'));
    $this.data('subscribed', 'no');
  }
  else {
    var path = '/res/users/' + uid + '/follow';
    $.post(path);
    $this.text($this.data('undo'));
    $this.data('subscribed', 'yes');
  }
});

$('a.subscribe-all').click(function() {
  var $this = $(this);
  $this.closest($this.data('scope')).find('a.subscribe').each(function() {
    var $this = $(this);
    if ($this.data('subscribed') == 'no') {
      var path = '/res/users/' + $this.data('userid') + '/follow';
      $.post(path);
      $this.text($this.data('undo'));
      $this.data('subscribed', 'yes');
    }
  });
});

});
