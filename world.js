function AgarWorld(url) {
  this.url = url;
  this.width = 1;
  this.height = 1;
  this.objects = {};
  this.sorted = [];
  this.leaders = [];

  this.mapScaleX = 1;
  this.mapScaleY = 1;
};

AgarWorld.prototype.insertObject = function (obj) {
  if (id in this.objects) {
    this.objects[id]++;
  }
};

AgarWorld.prototype.removeId = function (id) {
  if (id in objects) {
    delete objects[id];
  }
};

AgarWorld.prototype.releaseId = function (id) {
  if (id in objects) {
    objects[id].viewers--;
  }
};

AgarWorld.prototype.removeId = function (id) {

};

AgarWorld.prototype.setLeaders = function (new_leaders) {
  this.leaders = new_leaders;

  if (this.onleaderschange) {
    this.onleaderschange(this.leaders);
  }
};

AgarWorld.prototype.reset = function () {
  // Clear objects
  this.objects = {};
  this.sorted = [];

  // Clear leaderboard
  this.setLeaders([]);
};
