var s = function( sketch ) {

  sketch.setup = function() {
    var canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    canvas.parent('canvas-container');
    canvas.id('testing')
    sketch.background(255);
    var canvasObj = document.getElementById('testing')
    var width = ((window.innerWidth - 147) / 4 ) - 60  // minus width of the line section, quartered and then minus padding and margin of section
    var ratio = window.innerWidth / window.innerHeight;
    var height = width / ratio
    canvasObj.style.width = width + "px";
    canvasObj.style.height = height + "px";
    window.init()
  };

  sketch.draw = function() {
      위치(100, 900, 3);         
  }

  var 시작, 끝, 속도;
  var x = 시작;

  function 위치(시작, 끝, 속도) {
      sketch.background(255,20);
      sketch.stroke(100);
      sketch.strokeWeight(4);
      sketch.line(시작, 200, 끝, 200);

      sketch.strokeWeight(30);
      sketch.point(시작, 200);
      sketch.point(끝, 200);

      sketch.noStroke();
      sketch.fill(255, 0, 0);
      sketch.ellipse(x, 200, 20, 20);


      if (x < 끝) {
            x = x + 속도;
      } else {
            x = 시작;
      }

  }

}; 

var myp5 = new p5(s);
