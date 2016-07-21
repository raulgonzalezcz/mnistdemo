(function() {

  var THICKNESS = 0.07;

  function Drawing() {
    this.onChange = null;
    this._canvas = document.getElementById('draw-cell');

    var scale = 1;
    if ('undefined' !== typeof window.devicePixelRatio) {
      scale = Math.ceil(window.devicePixelRatio);
    }

    var s = this._canvas.offsetWidth * scale;
    this._canvas.width = s;
    this._canvas.height = s;

    this._drawnPaths = [];
    this._currentPath = [];

    this._registerMouseEvents();

    // TODO: support touchscreens here.
  }

  Drawing.prototype.reset = function() {
    this._drawnPaths = [];
    this._draw();
  };

  Drawing.prototype._touchStart = function(pos) {
    this._currentPath = [pos];
    this._drawnPaths.push(this._currentPath);
    this._draw();
  };

  Drawing.prototype._touchMove = function(pos) {
    this._currentPath.push(pos);
    this._draw();
  };

  Drawing.prototype._touchEnd = function() {
    if (this.onChange) {
      this.onChange();
    }
  };

  Drawing.prototype._draw = function() {
    for (var i = 0, len = this._drawnPaths.length; i < len; ++i) {
      this._drawPath(this._drawnPaths[i]);
    }
  };

  Drawing.prototype._drawPath = function(p) {
    var ctx = this._canvas.getContext('2d');
    ctx.save();
    ctx.scale(this._canvas.width/this._canvas.offsetWidth,
      this._canvas.height/this._canvas.offsetHeight);

    ctx.fillStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = THICKNESS * this._canvas.offsetWidth;

    if (p.length === 1) {
      ctx.beginPath();
      ctx.arc(p[0].x, p[0].y, ctx.lineWidth/2, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      for (var i = 1, len = p.length; i < len; ++i) {
        ctx.lineTo(p[i].x, p[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  Drawing.prototype._registerMouseEvents = function() {
    this._canvas.addEventListener('mousedown', function(e) {
      var upListener, moveListener;
      upListener = function() {
        window.removeEventListener('mouseup', upListener);
        window.removeEventListener('mouseleave', upListener);
        window.removeEventListener('mousemove', moveListener);
        this._touchEnd();
      }.bind(this);
      moveListener = function(e) {
        this._touchMove(this._mousePosition(e));
      }.bind(this);
      this._touchStart(this._mousePosition(e));
      window.addEventListener('mouseup', upListener);
      window.addEventListener('mouseleave', upListener);
      window.addEventListener('mousemove', moveListener);
    }.bind(this));
  };

  Drawing.prototype._mousePosition = function(e) {
    var x = e.pageX - this._canvas.offsetLeft;
    var y = e.pageY - this._canvas.offsetTop;
    return {x: x, y: y};
  };

  window.app.Drawing = Drawing;

})();
