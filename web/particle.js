/**************************************************/
/*             Makemake - particle.js             */
/*  Makemake is a simulation of gravity forces    */
/*  on particles, trying to reproduce the early   */
/*  stage of the Universe.                        */
/*            © HerrCrazi - Dec. 2017             */
/**************************************************/

const G = 6.67408e-11 //The Cavendish's constant [N.m²/kg²]

const particleCount = 350;

var particles = [];
var frame = iterations = 0;
var oddFrame = true, debug = false;

var moveHold = false;
var offsetX = offsetY = 0;

var scale = 1.0;
var scaleMultiplier = 0.5;

//Make sure the DOM is loaded before starting to use it
$(window).on('load', () => {

  //Init. graphical elements
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  // Set the canvas width and height to occupy full window
  var W = canvas.width = window.innerWidth,
  H = canvas.height = window.innerHeight;

  /*offsetX = W/2;
  offsetY = H/2;*/

  /*  Physics  */

  class Particle
  {
    constructor(x = Math.random() * W, y = Math.random() * H)
    {
      this.x = x;
      this.y = y;

      this.radius = 3;
      this.color = 'white';

      this.mass = 100000000; //[kg]

      this.ax = 0;  //[m/s²]
      this.ay = 0;  //[m/s²]

      this.f = 0;   //Gravity force [N]

      this.vx = 0;//0.1-(Math.random() * 0.2);  //[m/s]
      this.vy = 0;//0.1-(Math.random() * 0.2);  //[m/s]

      particles.push(this);
    }

    computeForces()
    {
      var isCollided = false;
      //console.log(this);
      for (var i in particles)
      {
        iterations++;

        if (this.x != particles[i].x && this.y != particles[i].y)
        {
          let dx = this.x - particles[i].x,
          dy = this.y - particles[i].y,
          dist = Math.sqrt(dx*dx + dy*dy);

          if ( !isCollided )
          {
            this.ax += newtonMagic(this, particles[i]) * (dx/dist);
            this.ay += newtonMagic(this, particles[i]) * (dy/dist);
          }

          //Cohesion manager
          if ( dist <= (this.radius + particles[i].radius) )
          {
            let rvx = this.vx - particles[i].vx,
            rvy = this.vy - particles[i].vy;

            this.vx -= rvx/1.5;
            this.vy -= rvy/1.5;

            particles[i].vx += rvx/1.5;
            particles[i].vy += rvy/1.5;

            //this.ax = this.ay = 0;
          }

          //Collision manager
          if ( dist <= this.radius )
          {
            isCollided = true;
            this.ax = this.ay = 0;
          }
        }
      }
    }

    draw(color)
    {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

      // Fill the color to the arc that we just created
      ctx.fill();

      if ( debug )
      {
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (this.vx*15), this.y + (this.vy*15));
        ctx.stroke();

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (this.ax*15), this.y + (this.ay*15));
        ctx.stroke();
      }
    }
  }//End class Particle

  function newtonMagic(p1, p2)//p1 = this, p2 = other particle
  {
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return -G * (p2.mass / (dx*dx + dy*dy)); //[N]
  }


  /*  Game  */

  function update()
  {
    if ( debug ) console.log("Computing forces... (part 1/2)");

    for (var i in particles)
    {
      let thisParticle = particles[i];

      thisParticle.computeForces();

      thisParticle.vx += thisParticle.ax;
      thisParticle.vy += thisParticle.ay;
    }

    if ( debug ) console.log("Computing forces... (part 2/2)");

    for (var i in particles)
    {
      particles[i].x = (particles[i].x + particles[i].vx);
      particles[i].y = (particles[i].y + particles[i].vy);
    }

    if ( debug ) console.log("End computing forces. Iterated "+iterations+"× over "+particles.length+" objects.");
    iterations = 0;

  }

  function render()
  {
    frame++;

    //Automatically resize the canvas to the inner window size
    ctx.canvas.width = W = window.innerWidth;
    ctx.canvas.height = H = window.innerHeight;

    //Reset scale and translation, then clear the screen
    ctx.translate(0, 0);
    ctx.scale(1, 1);

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0,0,W,H);

    //Draw the frame indicator
    if ( debug )
    {
      console.log("---render frame "+frame+'----');

      ctx.fillStyle = (oddFrame) ? "white" : "black";
      ctx.fillRect(2,2,10,10);
      oddFrame = !oddFrame;
    }

    //Scale the screen and translate it
    ctx.translate(offsetX, offsetY);

    //Draw the axes
    if ( debug )
    {
      //Vertical axe
      ctx.strokeStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(0, -1000000);
      ctx.lineTo(0, 1000000);
      ctx.stroke();
      //Horizontal axe
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(-1000000, 0);
      ctx.lineTo(1000000, 0);
      ctx.stroke();
    }

    ctx.scale(scale, scale);

    //Now draw all the particles
    for (var i = 0; i < particles.length; i++) {
      p = particles[i];
      p.draw(p.color);
    }

    //Do the physics (the longest part)
    update();

    if ( debug ) console.log("--------------end--------------");
  }



  //Bind the click event to add a particle
  $('#canvas').on('click', (e) => {
    var posX = (e.pageX / scale) - (offsetX / scale),
        posY = (e.pageY / scale) - (offsetY / scale);

    console.log("Click : "+posX+","+posY);
    let newParticle = new Particle(posX, posY);
    //particles.push(newParticle);
    //render();
  });

  $(window).keydown( (e) => {
    if ( e.keyCode == 112 ) //F1
    {
      debug = !debug;
      console.log('####### DEBUG MODE #######');
    }

    if ( e.keyCode == 113 ) //F2
    {
      particles = [];
      console.log('Universe resetted. Void is void.');
    }
  });

  $('#canvas').contextmenu( () => {
    return false;
  });

  $(window).mousedown( (e) => {
    let oldOffsetX = offsetX;
    let oldOffsetY = offsetY;

    if ( e.which == 3 )  //Right mouse button
    {
      $(window).mousemove( (moveEvent) => {
        offsetX = moveEvent.pageX - e.pageX + oldOffsetX;
        offsetY = moveEvent.pageY - e.pageY + oldOffsetY;
      });
    }
  });

  $(window).mouseup( (e) => {
    if ( e.which == 3 ) $(window).off('mousemove');  //Right mouse button
  });

  canvas.onwheel = (we) => {
    if ( we.deltaY < 0 )
    {
      scale /= scaleMultiplier;

      offsetX -= we.pageX - offsetX;
      offsetY -= we.pageY - offsetY;
    }
    else if ( we.deltaY > 0 )
    {
      scale *= scaleMultiplier;

      offsetX += (we.pageX - offsetX) * (0.5);
      offsetY += (we.pageY - offsetY) * (0.5);
    }

    console.log('offsetX : '+offsetX+'\noffsetY : '+offsetY+'\nscale : '+scale);

    return false;
  }

  //Add some particles
  for(var i = 0; i < particleCount; i++)
  {
    new Particle();
  }

setInterval(render, 17);

});
