(function(){

  var c = document.getElementById('game'),
    C = c.getContext('2d'),
    FPS = 60,
    CANVAS_WIDTH = 480,
    CANVAS_HEIGHT = 640,
    gameObjects = [],
    loaded = false,
    loadingPanel,
    sample,

  Resource = Class.extend({
    ready: false,
    init: function(res){
      var that = this;
      this.data = new Image();
      this.data.onload = function(){
        that.ready = true;
        that.width = this.width;
        that.height = this.height;

      };
      this.data.src = res;
    }
  }),

  // Here we load all images
  resources = {
    'logo' : new Resource('resources/logo.png')
  },

  loadingPercentage = function(){
    
    var num = 0,
        countObjects = Object.keys(resources).length;

    for(var name in resources)
    {
      if(resources[name].ready)
      {
        num++;
      }
    }

    return num / countObjects * 100;

  },

  clamp = function(x, min, max)
  {
    if(x > max) x = max;
    if(x < min) x = min;
    return x;
  },
  
  Vector2D = Class.extend({
    init : function(x, y){
      this.x = x;
      this.y = y;
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
      this.pos = this.velocity.addV(this.pos);
    },
    interSect : function(obj){
      return (Math.abs(this.pos.x - obj.pos.x) * 2 < (this.width + obj.width)) && (Math.abs(this.pos.y - obj.pos.y) * 2 < (this.height + obj.height));
    },
    draw : function(resource)
    {
      this.height = this.height || resources[resource].height;
      this.width = this.width || resources[resource].width;
      C.drawImage(resources[resource].data, this.pos.x, this.pos.y);
    },
    remove: function(){
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
    setText : function(text)
    {
      this.text = text;
    },
    draw: function(){
      C.fillStyle = this.fillStyle;
      C.font = 'bold ' + this.size + 'px ' + this.font;
      C.fillText(this.text, this.pos.x, this.pos.y + this.size/2 + 10);
      this.width = C.measureText(this.text).width;
    }
  }),

  LoadingPanel = TextPanel.extend({
    init: function(){
      this._super();
      this.text = 'Loading resources: ' + loadingPercentage() + '%';
    },
    update : function()
    {
      var percentage = loadingPercentage();
      this.text = 'Loading resources: ' + percentage + '%';
      if(percentage === 100)
      {
        loaded = true;
      }
    }
  }),

  GameObjectSample_logo = GameOject.extend({
    init : function(){
      this._super(0,0);
      this.velocity = new Vector2D(1,0);

    },
    update:function(){
      this._super();
      if(this.pos.x > CANVAS_WIDTH - this.width)
      {
        this.velocity = new Vector2D(-1,0);
      }
      if(this.pos.x < 0)
      {
        this.velocity = new Vector2D(1,0);
      }
    },
    draw: function()
    {
      this._super("logo");
    }
  }),

  init = function(){
    
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;

    // We are about to start.
    // First we must wait that all game resources have been loaded.
    loadingPanel = new LoadingPanel();
    var sample = new GameObjectSample_logo();

    gameObjects.push(sample);

    (function(){
      setTimeout(arguments.callee, 1000/FPS);

      //Clear screen
      C.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if(!loaded)
      {
        loadingPanel.update();
        loadingPanel.draw();
      }
      else
      {
        for(var gameObject in gameObjects)
        {
          if(gameObjects[gameObject])
            {
              gameObjects[gameObject].update();
            }

            if(gameObjects[gameObject])
            {
              gameObjects[gameObject].draw();
            }
        }
      }

    })();

  };

  init();


})();