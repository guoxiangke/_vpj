$(function() {

var resize_image = function(elem, max_side) {
  var $this = $(elem);
  var width = elem.width;
  var height= elem.height;

  if (width > 0) {
    if (width >= height) {
      if (width > max_side)
        elem.width = max_side;
    }
    else {
      if (height > max_side)
        elem.height = max_side;
    }
  }
  else {
    $this.load(function() {
      resize_image(elem, max_side);
    });
  }
}

$('img[data-max-side]').each(function() {
  resize_image(this, $(this).data('max-side'));
});

$('img.click-to-resize').click(function() {
  $(this).closest('.image').find('img.click-to-resize').each(function() {
    $(this).toggle();
    if (!this.src)
      this.src = $(this).data('src');
  });
});

});
