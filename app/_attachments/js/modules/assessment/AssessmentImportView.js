var AssessmentImportView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

AssessmentImportView = (function(_super) {

  __extends(AssessmentImportView, _super);

  function AssessmentImportView() {
    AssessmentImportView.__super__.constructor.apply(this, arguments);
  }

  AssessmentImportView.prototype.events = {
    'click .import': 'import',
    'click .back': 'back'
  };

  AssessmentImportView.prototype.back = function() {
    Tangerine.router.navigate("", true);
    return false;
  };

  AssessmentImportView.prototype["import"] = function() {
    var dKey, opts, repOps,
      _this = this;
    dKey = this.$el.find("#d_key").val();
    this.$el.find(".status").fadeIn(250);
    this.$el.find("#progress").html("Looking for " + dKey);
    console.log(dKey);
    repOps = {
      'filter': 'tangerine/importFilter',
      'create_target': true,
      'query_params': {
        'downloadKey': dKey
      }
    };
    opts = {
      success: function(a, b) {
        console.log(["success", a, b]);
        _this.$el.find("#progress").html("Import successful <h3>Imported</h3>");
        return $.couch.db("tangerine").view("tangerine/byDKey", {
          keys: [dKey],
          success: function(data) {
            var datum, doc, _i, _len, _ref, _results;
            console.log(data);
            _ref = data.rows;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              datum = _ref[_i];
              doc = datum.value;
              _results.push(_this.$el.find("#progress").append("<div>" + doc.collection + " - " + doc.name + "</div>"));
            }
            return _results;
          },
          error: function(a, b, c) {
            return console.log([a, b, c]);
          }
        });
      },
      error: function(a, b) {
        console.log(["error", a, b]);
        return _this.$el.find("#progress").html("<div>Import error</div><div>" + a + "</div><div>" + b);
      }
    };
    $.couch.replicate("http://tangerine.iriscouch.com:5984/tangerine", "tangerine", opts, repOps);
    return false;
  };

  AssessmentImportView.prototype.render = function() {
    this.$el.html("    <button class='back'>Back</button>    <h1>Tangerine Central Import</h1>    <div class='question'>      <label for='d_key'>Download key</label>      <input id='d_key' value=''>      <button class='import'>Import</button>    </div>    <div class='confirmation status'>      <h2>Status<h2>      <div class='info_box' id='progress'></div>    </div>    ");
    return this.trigger("rendered");
  };

  return AssessmentImportView;

})(Backbone.View);
