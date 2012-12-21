var ViewManager,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ViewManager = (function(_super) {

  __extends(ViewManager, _super);

  function ViewManager() {
    this.show = __bind(this.show, this);
    ViewManager.__super__.constructor.apply(this, arguments);
  }

  ViewManager.prototype.show = function(view) {
    var _ref,
      _this = this;
    window.scrollTo(0, 0);
    if ((_ref = this.currentView) != null) _ref.close();
    this.currentView = view;
    this.currentView.on("rendered", function() {
      var _base;
      Utils.working(false);
      $("#content").append(_this.currentView.el);
      _this.currentView.$el.find(".buttonset").buttonset();
      return typeof (_base = _this.currentView).afterRender === "function" ? _base.afterRender() : void 0;
    });
    this.currentView.on("subRendered", function() {
      return _this.currentView.$el.find(".buttonset").buttonset();
    });
    this.currentView.on("start_work", function() {
      return Utils.working(true);
    });
    this.currentView.on("end_work", function() {
      return Utils.working(false);
    });
    return this.currentView.render();
  };

  return ViewManager;

})(Backbone.View);
