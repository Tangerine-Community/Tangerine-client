var StudentToDateView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

StudentToDateView = (function(_super) {

  __extends(StudentToDateView, _super);

  function StudentToDateView() {
    this.afterRender = __bind(this.afterRender, this);
    StudentToDateView.__super__.constructor.apply(this, arguments);
  }

  StudentToDateView.prototype.events = {
    "click .back": "goBack"
  };

  StudentToDateView.prototype.goBack = function() {
    return history.back();
  };

  StudentToDateView.prototype.initialize = function(options) {
    var bucket, bucketKey, bucketType, correctItems, element, flotArray, flotArrays, i, item, milisecondsPerPart, oneObject, part, percentCorrect, result, resultsByBucketByPart, subtest, subtestPart, subtests, subtestsByPart, subtestsByResultsBucket, totalItems, _i, _j, _k, _len, _len2, _len3, _len4, _ref, _ref2,
      _this = this;
    milisecondsPerPart = 604800000;
    this.currentPart = Math.round(((new Date()).getTime() - options.klass.get("startDate")) / milisecondsPerPart);
    this.range = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = this.currentPart; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(i);
      }
      return _results;
    }).call(this);
    subtestsByPart = [];
    _ref = options.subtests;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subtest = _ref[_i];
      subtestPart = subtest.get("part");
      if (subtestsByPart[subtestPart] != null) {
        subtestsByPart[subtestPart].push(subtest);
      } else {
        subtestsByPart[subtestPart] = [subtest];
      }
    }
    subtestsByResultsBucket = [];
    resultsByBucketByPart = {};
    for (i = 0, _len2 = subtestsByPart.length; i < _len2; i++) {
      subtests = subtestsByPart[i];
      if (subtests === void 0) continue;
      for (_j = 0, _len3 = subtests.length; _j < _len3; _j++) {
        subtest = subtests[_j];
        if (resultsByBucketByPart[subtest.get("resultBucket")] === void 0) {
          resultsByBucketByPart[subtest.get("resultBucket")] = [];
          subtestsByResultsBucket[subtest.get("resultBucket")] = [];
        }
        resultsByBucketByPart[subtest.get("resultBucket")][i] = options.results.where({
          "subtestId": subtest.id
        });
        subtestsByResultsBucket[subtest.get("resultBucket")].push(subtest.get("items"));
      }
    }
    bucketType = [];
    for (bucketKey in subtestsByResultsBucket) {
      subtests = subtestsByResultsBucket[bucketKey];
      bucketType[bucketKey] = null;
      if (_.union.apply(this, (function() {
        var _k, _len4, _results;
        _results = [];
        for (_k = 0, _len4 = subtests.length; _k < _len4; _k++) {
          element = subtests[_k];
          _results.push(element.length);
        }
        return _results;
      })()).length === 1) {
        bucketType[bucketKey] = "lines";
      } else {
        bucketType[bucketKey] = "points";
      }
    }
    flotArrays = [];
    for (bucketKey in resultsByBucketByPart) {
      bucket = resultsByBucketByPart[bucketKey];
      for (part in bucket) {
        result = bucket[part];
        if (flotArrays[bucketKey] === void 0) flotArrays[bucketKey] = [];
        if ((result != null) && (result[0] != null) && (result[0].get != null)) {
          correctItems = 0;
          totalItems = 0;
          _ref2 = result[0].get("subtestData").items;
          for (_k = 0, _len4 = _ref2.length; _k < _len4; _k++) {
            item = _ref2[_k];
            if (item.itemResult === "correct") correctItems++;
            totalItems++;
          }
          percentCorrect = (correctItems / totalItems) * 100;
          flotArrays[bucketKey].push([parseInt(part), percentCorrect]);
        } else {
          flotArrays[bucketKey].push([parseInt(part), 0]);
        }
      }
    }
    this.flotData = [];
    for (bucket in flotArrays) {
      flotArray = flotArrays[bucket];
      flotArray = _.reject(flotArray, function(arr) {
        return arr[0] > _this.currentPart;
      });
      if (bucketType[bucket] === "lines") {
        flotArray.push([this.currentPart + 1, _.last(flotArray)[1]]);
      }
      oneObject = {
        "label": bucket,
        "data": flotArray
      };
      oneObject[bucketType[bucket]] = {
        "show": true,
        "radius": 4,
        "width": 4
      };
      this.flotData.push(oneObject);
    }
    return this.flotOptions = {
      "yaxis": {
        min: 0,
        max: 100,
        ticks: 10
      },
      "xaxis": {
        min: 0.5,
        max: this.currentPart + 0.5,
        ticks: (function() {
          var _ref3, _results;
          _results = [];
          for (i = 1, _ref3 = this.currentPart; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
            _results.push(String(i));
          }
          return _results;
        }).call(this),
        tickDecimals: 0
      }
    };
  };

  StudentToDateView.prototype.render = function() {
    var lineColor;
    this.$el.html("      <button class='navigation back'>" + (t('back')) + "</button>      <h1>" + (t('student progress report')) + "</h1>      <div id='chart' style='width:450px; height:300px;'></div>    ");
    this.trigger("rendered");
    return lineColor = "#BDDC93";
  };

  StudentToDateView.prototype.afterRender = function() {
    return $.plot(this.$el.find("#chart"), this.flotData, this.flotOptions);
  };

  return StudentToDateView;

})(Backbone.View);