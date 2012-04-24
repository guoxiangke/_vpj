$(function() {

$('a.favor').click(function() {
  var $this = $(this);
  var count = $this.data('count');
  var id = $this.data('postid');
  if ($this.data('favored') == 'no') {
    var path = '/res/posts/' + id + '/favor';
    $.post(path);
    $this.data('count', ++count);
    $this.find('.favor-count').text(count);
    $this.data('favored', 'yes');
  }
  else {
    var path = '/res/posts/' + id + '/unfavor';
    $.post(path);
    $this.data('count', --count);
    $this.find('.favor-count').text(count);
    $this.data('favored', 'no');
  }
});

});
