(function(){

  var c = document.getElementById('game'),
    C = c.getContext('2d'),
    FPS = 60,
    CANVAS_WIDTH = 480,
    CANVAS_HEIGHT = 640,
    gameObjects = [],
    loaded = false,
    loadingPanel,

  Resource = Class.extend({
    ready: false, //when this changes to true our image is loaded
    
    init: function(res){
      var that = this;
      this.data = new Image();

      this.data.onload = function(){
        //when our image is loaded we change ready to true
        that.ready = true;

        //we save the width
        that.width = this.width;

        //we save the height
        that.height = this.height;

      };
      //start loading the image
      this.data.src = res;
    }
  }),

  // Here we load all images
  resources = {
    'logo' : new Resource('resources/logo.png')
  },

  loadingPercentage = function(){
    
    var num = 0,
        amountResources = Object.keys(resources).length;
    for(var name in resources)
    {
      if(resources[name].ready)
      {
        num++; //count every resource that is ready
      }
    }

    //return a percentage
    return amountResources === 0 ? 100 : num / amountResources * 100;

  },

  clamp = function(x, min, max)
  {
    if(x > max) x = max;
    if(x < min) x = min;
    return x;
  },
  
  Vector2D = Class.extend({
    init : function(x, y){
      this.x = x || 0;
      this.y = y || 0;
    },
    mulS : function(scalar){ return new Vector2D(this.x * scalar, this.y * scalar);},
    mulV : function(vector){ return new Vector2D(this.x * vector.x, this.y * vector.y);},
    divS : function(scalar){ return new Vector2D(this.x / scalar, this.y / scalar);},
    divV : function(vector){ return new Vector2D(this.x / vector.x, this.y / vector.y);},
    addS : function(scalar){ return new Vector2D(this.x + scalar, this.y + scalar);},
    addV : function(vector){ return new Vector2D(this.x + vector.x, this.y + vector.y);},
    subS : function(scalar){ return new Vector2D(this.x - scalar, this.y - scalar);},
    subV : function(vector){ return new Vector2D(this.x - vector.x, this.y - vector.y);},
    dot : function(vector){ return (this.x * vector.x + this.y * vector.y);},
    abs : function(){ return new Vector2D(Math.abs(this.x), Math.abs(this.y));},
    length : function(){ return Math.sqrt(this.dot(this));},
    lengthSqrt : function(){ return this.dot(this);},
    normalize : function(){
      var len = this.length();
      this.x /= len;
      this.y /= len;

      return this;
    }
  }),

  GameOject = Class.extend({
    init: function(x, y){
      this.pos = new Vector2D(x || 0, y || 0);
      this.velocity = new Vector2D(0,0);
    },

    update : function()
    {
      //update the position by adding an velocity vector to the position
      this.pos = this.velocity.addV(this.pos);
    },

    //we can use intersect for knowing if a is GameObjects intersects with an object
    interSect : function(obj){
      return (Math.abs(this.pos.x - obj.pos.x) * 2 < (this.width + obj.width)) && (Math.abs(this.pos.y - obj.pos.y) * 2 < (this.height + obj.height));
    },
    draw : function(resource)
    {
      //update the height of the GameObject
      this.height = resources[resource].height;
      
      //update the width of the GameObject
      this.width = resources[resource].width;

      //draw the resource to the screen on its position
      C.drawImage(resources[resource].data, this.pos.x, this.pos.y);
    },
    remove: function(){
      //remove this GameObject from the gameObjects array
      gameObjects.splice(gameObjects.indexOf(this), 1);
    }
  }),

  TextPanel = GameOject.extend({
    init: function(x, y, size, font, fillStyle, text){
      this._super(x || 0, y || 0);
      this.text = text || '';
      this.size = size || 20;
      this.font = font || 'arial';
      this.fillStyle = fillStyle || 'black';

    },
    draw: function(){
      //set fillStyle
      C.fillStyle = this.fillStyle;

      //set font size and font style
      C.font = 'bold ' + this.size + 'px ' + this.font;

      //draw the text to the canvas
      C.fillText(this.text, this.pos.x, this.pos.y + this.size/2 + 10);
      
      //save the width of the TextPanel
      this.width = C.measureText(this.text).width;
    }
  }),

  LoadingPanel = TextPanel.extend({
    init: function(){
      this._super();
    },
    update : function()
    {
      //get the loading percentage
      var percentage = loadingPercentage();

      //set the text of the loading panel
      this.text = 'Loading resources: ' + percentage + '%';
      
      //set loaded = true; when we hit 100%
      loaded = (percentage === 100);
      
    }
  }),

  GameObjectSample_logo = GameOject.extend({
    init : function(){
      this._super(0,0);

      //on init we set the direction
      this.velocity = new Vector2D(1, 0.5).mulS(4);

    },
    update:function(){
      this._super();

      //make sure this object will not fly out of the view
      this.pos.x = clamp(this.pos.x);
      this.pos.y = clamp(this.pos.y);

      // Bouncing logo
      if(this.pos.x > CANVAS_WIDTH - this.width || this.pos.x < 0)
      {
        //we flip the X axis
        this.velocity = new Vector2D(-this.velocity.x, this.velocity.y);
      }

      if(this.pos.y > CANVAS_HEIGHT - this.height || this.pos.y < 0)
      {
        //we flip the Y axis
        this.velocity = new Vector2D(this.velocity.x, -this.velocity.y);
      }

    },
    draw: function()
    {
      //draw resources.logo to the screen
      this._super("logo");
    }
  }),

  init = function(){
    
    //set the canvas element width
    c.width = CANVAS_WIDTH;

    //set the canvas element height
    c.height = CANVAS_HEIGHT;

    //make an instance of loadingPanel
    loadingPanel = new LoadingPanel();

    //add a sample GameObject
    var sample = new GameObjectSample_logo();
    gameObjects.push(sample);


    //game loop
    (function(){
      setTimeout(arguments.callee, 1000/FPS);

      //clear screen
      C.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      //when we have all resources loaded into the game we can start drawing and updating our gameobjects
      if(loaded)
      {
        for(var gameObject in gameObjects)
        {
          //update all gameObjects
          if(gameObjects[gameObject])
          {
            gameObjects[gameObject].update();
          }

          //draw all gameObjects
          if(gameObjects[gameObject])
          {
            gameObjects[gameObject].draw();
          }
        }
      }
      else
      {
        //update the loading panel
        loadingPanel.update();

        //draw the loading panel while the client is still busy with all resources
        loadingPanel.draw();
      }

    })();

  };

  //start the init
  init();


})();