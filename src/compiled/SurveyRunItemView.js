var SurveyRunItemView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SurveyRunItemView = (function(superClass) {
  extend(SurveyRunItemView, superClass);

  function SurveyRunItemView() {
    this.skip = bind(this.skip, this);
    return SurveyRunItemView.__super__.constructor.apply(this, arguments);
  }

  SurveyRunItemView.prototype.template = JST["Survey"];

  SurveyRunItemView.prototype.childView = QuestionRunItemView;

  SurveyRunItemView.prototype.tagName = "p";

  SurveyRunItemView.prototype.className = "SurveyRunItemView";

  SurveyRunItemView.prototype.events = {
    'click .next_question': 'nextQuestion',
    'click .prev_question': 'prevQuestion',
    'collectionPopulated': 'collectionPopulated'
  };

  SurveyRunItemView.prototype.collectionPopulated = function() {
    return console.log("collectionPopulated.");
  };

  SurveyRunItemView.prototype.initialize = function(options) {
    var labels, vm;
    this.model = options.model;
    this.parent = this.model.parent;
    this.dataEntry = options.dataEntry;
    this.isObservation = options.isObservation;
    this.focusMode = this.model.getBoolean("focusMode");
    if (this.focusMode) {
      this.questionIndex = 0;
    }
    this.questionViews = [];
    this.answered = [];
    this.renderCount = 0;
    this.notAskedCount = 0;
    vm = {
      currentView: Tangerine.progress.currentSubview
    };
    this.i18n();
    this.collection = this.model.questions;
    this.questions = this.collection;
    Tangerine.progress.currentSubview = this;
    labels = {};
    labels.text = this.text;
    this.model.set('labels', labels);
    this.skippable = this.model.get("skippable") === true || this.model.get("skippable") === "true";
    this.backable = (this.model.get("backButton") === true || this.model.get("backButton") === "true") && this.parent.index !== 0;
    this.parent.displaySkip(this.skippable);
    this.parent.displayBack(this.backable);
    return this.listenTo;
  };

  SurveyRunItemView.prototype.updateProgressButtons = function() {
    var $next, $prev, i, isAvailable, j, len, maximum, minimum, qv, ref;
    isAvailable = [];
    ref = this.questionViews;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      qv = ref[i];
      if (qv != null) {
        if (!(qv.isAutostopped || qv.isSkipped)) {
          isAvailable.push(i);
        }
      }
    }
    isAvailable.push(this.questionIndex);
    $prev = this.parent.$el.find(".prev_question");
    $next = this.parent.$el.find(".next_question");
    minimum = Math.min.apply(minimum, isAvailable);
    maximum = Math.max.apply(maximum, isAvailable);
    if (this.questionIndex === minimum) {
      $prev.hide();
    } else {
      $prev.show();
    }
    if (this.questionIndex === maximum) {
      return $next.hide();
    } else {
      return $next.show();
    }
  };

  SurveyRunItemView.prototype.updateQuestionVisibility = function() {
    var $questions;
    if (!this.model.get("focusMode")) {
      return;
    }
    if (this.questionIndex === this.questionViews.length) {
      $(".next_question").hide();
    } else {
      $("#summary_container").empty();
      $(".next_question").show();
    }
    $questions = this.$el.find(".question");
    $questions.hide();
    $questions.eq(this.questionIndex).show();
    if (this.executeReady) {
      return this.questionViews[this.questionIndex].trigger("show");
    } else {
      if (!this.triggerShowList) {
        this.triggerShowList = [];
      }
      return this.triggerShowList.push(this.questionIndex);
    }
  };

  SurveyRunItemView.prototype.showQuestion = function(index) {
    if (_.isNumber(index) && index < this.questionViews.length && index > 0) {
      this.questionIndex = index;
    }
    return this.updateQuestionVisibility();
  };

  SurveyRunItemView.prototype.updateExecuteReady = function(ready) {
    var index, j, len, ref, ref1;
    this.executeReady = ready;
    if (this.triggerShowList == null) {
      return;
    }
    if (this.triggerShowList.length > 0) {
      ref = this.triggerShowList;
      for (j = 0, len = ref.length; j < len; j++) {
        index = ref[j];
        if ((ref1 = this.questionViews[index]) != null) {
          ref1.trigger("show");
        }
      }
      this.triggerShowList = [];
    }
    if (this.executeReady) {
      return this.updateSkipLogic();
    }
  };

  SurveyRunItemView.prototype.i18n = function() {
    return this.text = {
      pleaseAnswer: t("SurveyRunView.message.please_answer"),
      correctErrors: t("SurveyRunView.message.correct_errors"),
      notEnough: _(t("SurveyRunView.message.not_enough")).escape(),
      previousQuestion: t("SurveyRunView.button.previous_question"),
      nextQuestion: t("SurveyRunView.button.next_question"),
      "next": t("SubtestRunView.button.next"),
      "back": t("SubtestRunView.button.back"),
      "skip": t("SubtestRunView.button.skip"),
      "help": t("SubtestRunView.button.help")
    };
  };

  SurveyRunItemView.prototype.onQuestionAnswer = function(element) {
    var autostopCount, autostopLimit, currentAnswer, i, j, longestSequence, ref;
    if (!(this.renderCount >= this.questions.length)) {
      return;
    }
    this.autostopped = false;
    autostopLimit = this.model.getNumber("autostopLimit");
    longestSequence = 0;
    autostopCount = 0;
    if (autostopLimit > 0) {
      for (i = j = 1, ref = this.questionViews.length; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        currentAnswer = this.questionViews[i - 1].answer;
        if (currentAnswer === "0" || currentAnswer === "9") {
          autostopCount++;
        } else {
          autostopCount = 0;
        }
        longestSequence = Math.max(longestSequence, autostopCount);
        if (autostopLimit !== 0 && longestSequence >= autostopLimit && !this.autostopped) {
          this.autostopped = true;
          this.autostopIndex = i;
        }
      }
    }
    this.updateAutostop();
    return this.updateSkipLogic();
  };

  SurveyRunItemView.prototype.updateAutostop = function() {
    var autostopLimit;
    autostopLimit = this.model.getNumber("autostopLimit");
    return this.questionViews.forEach(function(view, i) {
      if (i > (this.autostopIndex - 1)) {
        if (this.autostopped) {
          view.isAutostopped = true;
          return view.$el.addClass("disabled_autostop");
        } else {
          view.isAutostopped = false;
          return view.$el.removeClass("disabled_autostop");
        }
      }
    }, this);
  };

  SurveyRunItemView.prototype.updateSkipLogic = function() {
    return this.questionViews.forEach(function(qv) {
      var error, error1, message, name, question, result, skipLogicCode;
      question = qv.model;
      skipLogicCode = question.getString("skipLogic");
      if (skipLogicCode !== "") {
        try {
          result = CoffeeScript["eval"].apply(this, [skipLogicCode]);
        } catch (error1) {
          error = error1;
          name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
          message = error.message;
          alert("Skip logic error in question " + (question.get('name')) + "\n\n" + name + "\n\n" + message);
        }
        if (result) {
          qv.$el.addClass("disabled_skipped");
          qv.isSkipped = true;
        } else {
          qv.$el.removeClass("disabled_skipped");
          qv.isSkipped = false;
        }
      }
      return qv.updateValidity();
    }, this);
  };

  SurveyRunItemView.prototype.isValid = function(views) {
    var i, j, len, qv;
    if (views == null) {
      views = this.questionViews;
    }
    if (views == null) {
      return true;
    }
    if (!_.isArray(views)) {
      views = [views];
    }
    for (i = j = 0, len = views.length; j < len; i = ++j) {
      qv = views[i];
      qv.updateValidity();
      if (!qv.model.getBoolean("skippable")) {
        if (!qv.isValid) {
          return false;
        }
      }
    }
    return true;
  };

  SurveyRunItemView.prototype.testValid = function() {
    return this.isValid();
  };

  SurveyRunItemView.prototype.getSkipped = function() {
    var result;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[this.questions.models[i].get("name")] = "skipped";
    }, this);
    return result;
  };

  SurveyRunItemView.prototype.getResult = function() {
    var hash, result, subtestResult;
    result = {};
    this.questionViews.forEach(function(qv, i) {
      return result[qv.name] = qv.notAsked ? qv.notAskedResult : !_.isEmpty(qv.answer) ? qv.answer : qv.skipped ? qv.skippedResult : qv.isSkipped ? qv.logicSkippedResult : qv.isAutostopped ? qv.notAskedAutostopResult : qv.answer;
    }, this);
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    return subtestResult = {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
  };

  SurveyRunItemView.prototype.showErrors = function(views) {
    var first;
    if (views == null) {
      views = this.questionViews;
    }
    this.$el.find('.message').remove();
    first = true;
    if (!_.isArray(views)) {
      views = [views];
    }
    return views.forEach(function(qv, i) {
      var customMessage, message;
      if (!_.isString(qv)) {
        message = "";
        if (!qv.isValid) {
          customMessage = qv.model.get("customValidationMessage");
          if (!_.isEmpty(customMessage)) {
            message = customMessage;
          } else {
            message = this.text.pleaseAnswer;
          }
          if (first === true) {
            if (views === this.questionViews) {
              this.showQuestion(i);
            }
            qv.$el.scrollTo();
            Utils.midAlert(this.text.correctErrors);
            first = false;
          }
        }
        return qv.setMessage(message);
      }
    }, this);
  };

  SurveyRunItemView.prototype.getSum = function() {
    return {
      correct: 0,
      incorrect: 0,
      missing: 0,
      total: 0
    };
  };

  SurveyRunItemView.prototype.childEvents = {
    'answer scroll': 'onQuestionAnswer',
    'answer': 'onQuestionAnswer',
    'rendered': 'onQuestionRendered',
    'render:collection': 'renderCol',
    'attach': 'attachChild'
  };

  SurveyRunItemView.prototype.foo = function() {
    return console.log("test 123 SV child foo");
  };

  SurveyRunItemView.prototype.renderCol = function() {
    return console.log("onRenderCol");
  };

  SurveyRunItemView.prototype.attachChild = function() {
    console.log("attachChild");
    return this.trigger("childAttached");
  };

  SurveyRunItemView.prototype.buildChildView = function(child, ChildViewClass, childViewOptions) {
    var childView, isNotAsked, options, required;
    options = _.extend({
      model: child
    }, childViewOptions);
    childView = new ChildViewClass(options);
    required = child.getNumber("linkedGridScore");
    isNotAsked = ((required !== 0 && this.parent.getGridScore() < required) || this.parent.gridWasAutostopped()) && this.parent.getGridScore() !== false;
    child.set("notAsked", isNotAsked);
    if (isNotAsked) {
      this.notAskedCount++;
    }
    Marionette.MonitorDOMRefresh(childView);
    this.questionViews[childViewOptions.index] = childView;
    return childView;
  };

  SurveyRunItemView.prototype.childViewOptions = function(model, index) {
    var answer, labels, name, options, previous;
    if (!this.dataEntry) {
      previous = this.model.parent.result.getByHash(this.model.get('hash'));
    }
    name = model.escape("name").replace(/[^A-Za-z0-9_]/g, "-");
    if (previous) {
      answer = previous[name];
    }
    labels = {};
    labels.text = this.text;
    model.set('labels', labels);
    options = {
      model: model,
      parent: this,
      dataEntry: this.dataEntry,
      notAsked: model.get("notAsked"),
      isObservation: this.isObservation,
      answer: answer,
      index: index
    };
    return options;
  };

  SurveyRunItemView.prototype.onChildviewRender = function() {
    return this.trigger("childViewRendered");
  };

  SurveyRunItemView.prototype.onBeforeRender = function() {};

  SurveyRunItemView.prototype.onRender = function() {
    var notAskedCount;
    notAskedCount = 0;
    if (this.model.questions != null) {
      this.model.questions.models.forEach((function(_this) {
        return function(question, i) {
          var isNotAsked, required;
          required = question.getNumber("linkedGridScore");
          isNotAsked = ((required !== 0 && _this.parent.getGridScore() < required) || _this.parent.gridWasAutostopped()) && _this.parent.getGridScore() !== false;
          question.set("notAsked", isNotAsked);
          if (isNotAsked) {
            return _this.notAskedCount++;
          }
        };
      })(this));
    }
    return this.trigger("ready");
  };

  SurveyRunItemView.prototype.onRenderCollection = function() {
    var base;
    this.updateExecuteReady(true);
    this.updateQuestionVisibility();
    this.updateProgressButtons();
    if (this.questions.length === this.notAskedCount) {
      if (Tangerine.settings.get("context") !== "class") {
        if (typeof (base = this.parent).next === "function") {
          base.next();
        }
      } else {
        alert(this.text.notEnough);
      }
    }
    return this.trigger("subRendered");
  };

  SurveyRunItemView.prototype.onShow = function() {
    var displayCode, displaycodeFixed, error, error1, k, message, name, ref, ref1, v;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      displaycodeFixed = displayCode;
      if (_.size(Tangerine.displayCode_migrations) > 0) {
        ref = Tangerine.displayCode_migrations;
        for (k in ref) {
          v = ref[k];
          displaycodeFixed = displaycodeFixed.replace(k, v);
        }
      }
      try {
        CoffeeScript["eval"].apply(this, [displaycodeFixed]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displaycodeFixed Error: " + JSON.stringify(error));
      }
    }
    return (ref1 = this.prototypeView) != null ? typeof ref1.updateExecuteReady === "function" ? ref1.updateExecuteReady(true) : void 0 : void 0;
  };

  SurveyRunItemView.prototype.onDomRefresh = function() {
    return console.log("I get too attached to people.");
  };

  SurveyRunItemView.prototype.skip = function() {
    var currentView;
    currentView = Tangerine.progress.currentSubview;
    return this.parent.result.add({
      name: currentView.model.get("name"),
      data: currentView.getSkipped(),
      subtestId: currentView.model.id,
      skipped: true,
      prototype: currentView.model.get("prototype")
    }, {
      success: (function(_this) {
        return function() {
          return _this.parent.reset(1);
        };
      })(this)
    });
  };

  SurveyRunItemView.prototype.onQuestionRendered = function() {
    this.renderCount++;
    if (this.renderCount === this.questions.length) {
      this.trigger("ready");
      return this.updateSkipLogic();
    }
  };

  SurveyRunItemView.prototype.onClose = function() {
    var j, len, qv, ref;
    ref = this.questionViews;
    for (j = 0, len = ref.length; j < len; j++) {
      qv = ref[j];
      if (typeof qv.close === "function") {
        qv.close();
      }
    }
    return this.questionViews = [];
  };

  SurveyRunItemView.prototype.reset = function(increment) {
    console.log("reset");
    this.rendered.subtest = false;
    this.rendered.assessment = false;
    Tangerine.progress.currentSubview.close();
    this.index = this.abortAssessment === true ? this.subtestViews.length - 1 : this.index + increment;
    this.render();
    return window.scrollTo(0, 0);
  };

  SurveyRunItemView.prototype.next = function() {
    var base;
    console.log("next");
    return typeof (base = this.model.parent).next === "function" ? base.next() : void 0;
  };

  return SurveyRunItemView;

})(Backbone.Marionette.CompositeView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZXMvc3VidGVzdC9wcm90b3R5cGVzL1N1cnZleVJ1bkl0ZW1WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGlCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7OEJBRUosUUFBQSxHQUFVLEdBQUksQ0FBQSxRQUFBOzs4QkFDZCxTQUFBLEdBQVc7OzhCQUNYLE9BQUEsR0FBUzs7OEJBQ1QsU0FBQSxHQUFXOzs4QkFFWCxNQUFBLEdBQ0U7SUFBQSxzQkFBQSxFQUF5QixjQUF6QjtJQUNBLHNCQUFBLEVBQXlCLGNBRHpCO0lBRUEscUJBQUEsRUFBdUIscUJBRnZCOzs7OEJBSUYsbUJBQUEsR0FBcUIsU0FBQTtXQUNuQixPQUFPLENBQUMsR0FBUixDQUFZLHNCQUFaO0VBRG1COzs4QkFHckIsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLE1BQUQsR0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQztJQUN4QixJQUFDLENBQUEsU0FBRCxHQUFpQixPQUFPLENBQUM7SUFDekIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBTyxDQUFDO0lBQ3pCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFrQixXQUFsQjtJQUNqQixJQUFzQixJQUFDLENBQUEsU0FBdkI7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUFqQjs7SUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsUUFBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsV0FBRCxHQUFpQjtJQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixFQUFBLEdBQ0U7TUFBQSxXQUFBLEVBQWEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFoQzs7SUFJRixJQUFDLENBQUEsSUFBRCxDQUFBO0lBS0EsSUFBQyxDQUFBLFVBQUQs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VDtLQVBGO0VBRkk7OzhCQWFOLGtCQUFBLEdBQW1CLFNBQUE7SUFFakIsSUFBQyxDQUFBLFdBQUQ7SUFFQSxJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBOUI7TUFDRSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7YUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRkY7O0VBSmlCOzs4QkFlbkIsT0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0FBQUE7QUFBQSxTQUFBLHFDQUFBOzs7UUFDRSxFQUFFLENBQUM7O0FBREw7V0FFQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtFQUhYOzs4QkFLUixLQUFBLEdBQU8sU0FBQyxTQUFEO0lBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0lBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLEdBQW9CO0lBQ3BCLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixHQUF1QjtJQUd2QixTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFsQyxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FDSyxJQUFDLENBQUEsZUFBRCxLQUFvQixJQUF2QixHQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUFxQixDQUR2QixHQUdFLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDYixJQUFDLENBQUEsTUFBRCxDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7RUFiSzs7OEJBZVAsSUFBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaO3VFQUNhLENBQUM7RUFGVjs7OztHQXJld0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyIsImZpbGUiOiJtb2R1bGVzL3N1YnRlc3QvcHJvdG90eXBlcy9TdXJ2ZXlSdW5JdGVtVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1cnZleVJ1bkl0ZW1WaWV3IGV4dGVuZHMgQmFja2JvbmUuTWFyaW9uZXR0ZS5Db21wb3NpdGVWaWV3XG5cbiAgdGVtcGxhdGU6IEpTVFtcIlN1cnZleVwiXSxcbiAgY2hpbGRWaWV3OiBRdWVzdGlvblJ1bkl0ZW1WaWV3LFxuICB0YWdOYW1lOiBcInBcIixcbiAgY2xhc3NOYW1lOiBcIlN1cnZleVJ1bkl0ZW1WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5uZXh0X3F1ZXN0aW9uJyA6ICduZXh0UXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5wcmV2X3F1ZXN0aW9uJyA6ICdwcmV2UXVlc3Rpb24nXG4gICAgJ2NvbGxlY3Rpb25Qb3B1bGF0ZWQnOiAnY29sbGVjdGlvblBvcHVsYXRlZCdcblxuICBjb2xsZWN0aW9uUG9wdWxhdGVkOiAtPlxuICAgIGNvbnNvbGUubG9nKFwiY29sbGVjdGlvblBvcHVsYXRlZC5cIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBtb2RlbCAgICAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICAgICAgID0gQG1vZGVsLnBhcmVudFxuICAgIEBkYXRhRW50cnkgICAgID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgICBAaXNPYnNlcnZhdGlvbiA9IG9wdGlvbnMuaXNPYnNlcnZhdGlvblxuICAgIEBmb2N1c01vZGUgICAgID0gQG1vZGVsLmdldEJvb2xlYW4oXCJmb2N1c01vZGVcIilcbiAgICBAcXVlc3Rpb25JbmRleCA9IDAgaWYgQGZvY3VzTW9kZVxuICAgIEBxdWVzdGlvblZpZXdzID0gW11cbiAgICBAYW5zd2VyZWQgICAgICA9IFtdXG4gICAgQHJlbmRlckNvdW50ICAgPSAwXG4gICAgQG5vdEFza2VkQ291bnQgPSAwXG4gICAgdm0gPVxuICAgICAgY3VycmVudFZpZXc6IFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1xuIyAgICBAY2hpbGRWaWV3T3B0aW9ucyA9XG4jICAgICAgICBwYXJlbnQ6IHRoaXNcblxuICAgIEBpMThuKClcbiMgICAgdGhpcy5saXN0ZW5UbyhAbW9kZWwuY29sbGVjdGlvbiwnY2hhbmdlJywgdGhpcy52aWV3UmVuZGVyKVxuIyAgICAgIHRoaXMubGlzdGVuVG8obW9kZWwuY29sbGVjdGlvbiwgJ3Jlc2V0JywgdGhpcy5yZW5kZXIpO1xuIyAgICBpZiBAbW9kZWwucXVlc3Rpb25zLmxlbmd0aCA9PSAwXG4jICAgICAgY29uc29sZS5sb2coXCJObyBxdWVzdGlvbnMuXCIpXG4gICAgQGNvbGxlY3Rpb24gPSBAbW9kZWwucXVlc3Rpb25zXG4gICAgQHF1ZXN0aW9ucyA9IEBjb2xsZWN0aW9uXG5cbiMgICAgQG1vZGVsLnF1ZXN0aW9ucy5mZXRjaFxuIyAgICAgIHZpZXdPcHRpb25zOlxuIyAgICAgICAga2V5OiBcInF1ZXN0aW9uLSN7QG1vZGVsLmlkfVwiXG4jICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pID0+XG4jIyAgICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5zb3J0KClcbiMgICAgICAgIGNvbGxlY3Rpb24uc29ydCgpXG4jICAgICAgICBAbW9kZWwuY29sbGVjdGlvbi5tb2RlbHMgPSBjb2xsZWN0aW9uLm1vZGVsc1xuIyAgICAgICAgQHJlbmRlcigpXG5cbiAgICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcgPSBAXG4gICAgbGFiZWxzID0ge31cbiAgICBsYWJlbHMudGV4dCA9IEB0ZXh0XG4gICAgQG1vZGVsLnNldCgnbGFiZWxzJywgbGFiZWxzKVxuXG4gICAgQHNraXBwYWJsZSA9IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gdHJ1ZSB8fCBAbW9kZWwuZ2V0KFwic2tpcHBhYmxlXCIpID09IFwidHJ1ZVwiXG4gICAgQGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG4gICAgQHBhcmVudC5kaXNwbGF5U2tpcChAc2tpcHBhYmxlKVxuICAgIEBwYXJlbnQuZGlzcGxheUJhY2soQGJhY2thYmxlKVxuXG4gICAgQGxpc3RlblRvXG5cbiAgdXBkYXRlUHJvZ3Jlc3NCdXR0b25zOiAtPlxuXG4gICAgaXNBdmFpbGFibGUgPSBbXVxuICAgIGZvciBxdiwgaSBpbiBAcXVlc3Rpb25WaWV3c1xuICAgICAgaWYgcXY/XG4gICAgICAgIGlzQXZhaWxhYmxlLnB1c2ggaSBpZiBub3QgKHF2LmlzQXV0b3N0b3BwZWQgb3IgcXYuaXNTa2lwcGVkKVxuICAgIGlzQXZhaWxhYmxlLnB1c2ggQHF1ZXN0aW9uSW5kZXhcblxuICAgICRwcmV2ID0gQHBhcmVudC4kZWwuZmluZChcIi5wcmV2X3F1ZXN0aW9uXCIpXG4gICAgJG5leHQgPSBAcGFyZW50LiRlbC5maW5kKFwiLm5leHRfcXVlc3Rpb25cIilcblxuICAgIG1pbmltdW0gPSBNYXRoLm1pbi5hcHBseSggbWluaW11bSwgaXNBdmFpbGFibGUgKVxuICAgIG1heGltdW0gPSBNYXRoLm1heC5hcHBseSggbWF4aW11bSwgaXNBdmFpbGFibGUgKVxuXG4gICAgaWYgQHF1ZXN0aW9uSW5kZXggPT0gbWluaW11bVxuICAgICAgJHByZXYuaGlkZSgpXG4gICAgZWxzZVxuICAgICAgJHByZXYuc2hvdygpXG5cbiAgICBpZiBAcXVlc3Rpb25JbmRleCA9PSBtYXhpbXVtXG4gICAgICAkbmV4dC5oaWRlKClcbiAgICBlbHNlXG4gICAgICAkbmV4dC5zaG93KClcblxuICB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHk6IC0+XG5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlbC5nZXQoXCJmb2N1c01vZGVcIilcblxuICAgIGlmIEBxdWVzdGlvbkluZGV4ID09IEBxdWVzdGlvblZpZXdzLmxlbmd0aFxuIyAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuaHRtbCBcIlxuIyAgICAgICAgbGFzdCBwYWdlIGhlcmVcbiMgICAgICBcIlxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgICQoXCIjc3VtbWFyeV9jb250YWluZXJcIikuZW1wdHkoKVxuICAgICAgJChcIi5uZXh0X3F1ZXN0aW9uXCIpLnNob3coKVxuXG4gICAgJHF1ZXN0aW9ucyA9IEAkZWwuZmluZChcIi5xdWVzdGlvblwiKVxuICAgICRxdWVzdGlvbnMuaGlkZSgpXG4gICAgJHF1ZXN0aW9ucy5lcShAcXVlc3Rpb25JbmRleCkuc2hvdygpXG5cbiAgICAjIHRyaWdnZXIgdGhlIHF1ZXN0aW9uIHRvIHJ1biBpdCdzIGRpc3BsYXkgY29kZSBpZiB0aGUgc3VidGVzdCdzIGRpc3BsYXljb2RlIGhhcyBhbHJlYWR5IHJhblxuICAgICMgaWYgbm90LCBhZGQgaXQgdG8gYSBsaXN0IHRvIHJ1biBsYXRlci5cbiAgICBpZiBAZXhlY3V0ZVJlYWR5XG4gICAgICBAcXVlc3Rpb25WaWV3c1tAcXVlc3Rpb25JbmRleF0udHJpZ2dlciBcInNob3dcIlxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyU2hvd0xpc3QgPSBbXSBpZiBub3QgQHRyaWdnZXJTaG93TGlzdFxuICAgICAgQHRyaWdnZXJTaG93TGlzdC5wdXNoIEBxdWVzdGlvbkluZGV4XG5cbiAgc2hvd1F1ZXN0aW9uOiAoaW5kZXgpIC0+XG4gICAgQHF1ZXN0aW9uSW5kZXggPSBpbmRleCBpZiBfLmlzTnVtYmVyKGluZGV4KSAmJiBpbmRleCA8IEBxdWVzdGlvblZpZXdzLmxlbmd0aCAmJiBpbmRleCA+IDBcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiMgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG5cbiAgdXBkYXRlRXhlY3V0ZVJlYWR5OiAocmVhZHkpIC0+XG4gICAgQGV4ZWN1dGVSZWFkeSA9IHJlYWR5XG5cbiAgICByZXR1cm4gaWYgbm90IEB0cmlnZ2VyU2hvd0xpc3Q/XG5cbiAgICBpZiBAdHJpZ2dlclNob3dMaXN0Lmxlbmd0aCA+IDBcbiAgICAgIGZvciBpbmRleCBpbiBAdHJpZ2dlclNob3dMaXN0XG4gICAgICAgIEBxdWVzdGlvblZpZXdzW2luZGV4XT8udHJpZ2dlciBcInNob3dcIlxuICAgICAgQHRyaWdnZXJTaG93TGlzdCA9IFtdXG5cbiAgICBAdXBkYXRlU2tpcExvZ2ljKCkgaWYgQGV4ZWN1dGVSZWFkeVxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgcGxlYXNlQW5zd2VyIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5wbGVhc2VfYW5zd2VyXCIpXG4gICAgICBjb3JyZWN0RXJyb3JzIDogdChcIlN1cnZleVJ1blZpZXcubWVzc2FnZS5jb3JyZWN0X2Vycm9yc1wiKVxuICAgICAgbm90RW5vdWdoIDogXyh0KFwiU3VydmV5UnVuVmlldy5tZXNzYWdlLm5vdF9lbm91Z2hcIikpLmVzY2FwZSgpXG5cbiAgICAgIHByZXZpb3VzUXVlc3Rpb24gOiB0KFwiU3VydmV5UnVuVmlldy5idXR0b24ucHJldmlvdXNfcXVlc3Rpb25cIilcbiAgICAgIG5leHRRdWVzdGlvbiA6IHQoXCJTdXJ2ZXlSdW5WaWV3LmJ1dHRvbi5uZXh0X3F1ZXN0aW9uXCIpXG4gICAgICBcIm5leHRcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24ubmV4dFwiKVxuICAgICAgXCJiYWNrXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLmJhY2tcIilcbiAgICAgIFwic2tpcFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5za2lwXCIpXG4gICAgICBcImhlbHBcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uaGVscFwiKVxuXG4gICMgd2hlbiBhIHF1ZXN0aW9uIGlzIGFuc3dlcmVkXG4gIG9uUXVlc3Rpb25BbnN3ZXI6IChlbGVtZW50KSAtPlxuIyAgICBjb25zb2xlLmxvZyhcIm9uUXVlc3Rpb25BbnN3ZXIgQHJlbmRlckNvdW50OlwiICsgQHJlbmRlckNvdW50ICsgXCIgIEBxdWVzdGlvbnMubGVuZ3RoOiBcIiArICBAcXVlc3Rpb25zLmxlbmd0aClcbiMgICAgdGhpcyBpcyBub3QgZ29vZC4gU2hvdWxkIHRlc3QgZm9yID09XG4gICAgcmV0dXJuIHVubGVzcyBAcmVuZGVyQ291bnQgPj0gQHF1ZXN0aW9ucy5sZW5ndGhcblxuICAgICMgYXV0byBzdG9wIGFmdGVyIGxpbWl0XG4gICAgQGF1dG9zdG9wcGVkICAgID0gZmFsc2VcbiAgICBhdXRvc3RvcExpbWl0ICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwiYXV0b3N0b3BMaW1pdFwiXG4gICAgbG9uZ2VzdFNlcXVlbmNlID0gMFxuICAgIGF1dG9zdG9wQ291bnQgICA9IDBcblxuICAgIGlmIGF1dG9zdG9wTGltaXQgPiAwXG4gICAgICBmb3IgaSBpbiBbMS4uQHF1ZXN0aW9uVmlld3MubGVuZ3RoXSAjIGp1c3QgaW4gY2FzZSB0aGV5IGNhbid0IGNvdW50XG4gICAgICAgIGN1cnJlbnRBbnN3ZXIgPSBAcXVlc3Rpb25WaWV3c1tpLTFdLmFuc3dlclxuICAgICAgICBpZiBjdXJyZW50QW5zd2VyID09IFwiMFwiIG9yIGN1cnJlbnRBbnN3ZXIgPT0gXCI5XCJcbiAgICAgICAgICBhdXRvc3RvcENvdW50KytcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF1dG9zdG9wQ291bnQgPSAwXG4gICAgICAgIGxvbmdlc3RTZXF1ZW5jZSA9IE1hdGgubWF4KGxvbmdlc3RTZXF1ZW5jZSwgYXV0b3N0b3BDb3VudClcbiAgICAgICAgIyBpZiB0aGUgdmFsdWUgaXMgc2V0LCB3ZSd2ZSBnb3QgYSB0aHJlc2hvbGQgZXhjZWVkaW5nIHJ1biwgYW5kIGl0J3Mgbm90IGFscmVhZHkgYXV0b3N0b3BwZWRcbiAgICAgICAgaWYgYXV0b3N0b3BMaW1pdCAhPSAwICYmIGxvbmdlc3RTZXF1ZW5jZSA+PSBhdXRvc3RvcExpbWl0ICYmIG5vdCBAYXV0b3N0b3BwZWRcbiAgICAgICAgICBAYXV0b3N0b3BwZWQgPSB0cnVlXG4gICAgICAgICAgQGF1dG9zdG9wSW5kZXggPSBpXG4gICAgQHVwZGF0ZUF1dG9zdG9wKClcbiAgICBAdXBkYXRlU2tpcExvZ2ljKClcblxuICB1cGRhdGVBdXRvc3RvcDogLT5cbiAgICBhdXRvc3RvcExpbWl0ID0gQG1vZGVsLmdldE51bWJlciBcImF1dG9zdG9wTGltaXRcIlxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHZpZXcsIGkpIC0+XG4gICAgICBpZiBpID4gKEBhdXRvc3RvcEluZGV4IC0gMSlcbiAgICAgICAgaWYgQGF1dG9zdG9wcGVkXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gdHJ1ZVxuICAgICAgICAgIHZpZXcuJGVsLmFkZENsYXNzICAgIFwiZGlzYWJsZWRfYXV0b3N0b3BcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmlldy5pc0F1dG9zdG9wcGVkID0gZmFsc2VcbiAgICAgICAgICB2aWV3LiRlbC5yZW1vdmVDbGFzcyBcImRpc2FibGVkX2F1dG9zdG9wXCJcbiAgICAsIEBcblxuICB1cGRhdGVTa2lwTG9naWM6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwidXBkYXRlU2tpcExvZ2ljXCIpXG4jICAgIGNvbnNvbGUubG9nKFwiQHF1ZXN0aW9uVmlld3NcIiArIEBxdWVzdGlvblZpZXdzLmxlbmd0aClcbiAgICBAcXVlc3Rpb25WaWV3cy5mb3JFYWNoIChxdikgLT5cbiAgICAgIHF1ZXN0aW9uID0gcXYubW9kZWxcbiAgICAgIHNraXBMb2dpY0NvZGUgPSBxdWVzdGlvbi5nZXRTdHJpbmcgXCJza2lwTG9naWNcIlxuICAgICAgdW5sZXNzIHNraXBMb2dpY0NvZGUgaXMgXCJcIlxuICAgICAgICB0cnlcbiAgICAgICAgICByZXN1bHQgPSBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbc2tpcExvZ2ljQ29kZV0pXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwic2tpcExvZ2ljQ29kZTogXCIgKyBza2lwTG9naWNDb2RlKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5hbWUgPSAoKC9mdW5jdGlvbiAoLnsxLH0pXFwoLykuZXhlYyhlcnJvci5jb25zdHJ1Y3Rvci50b1N0cmluZygpKVsxXSlcbiAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICAgIGFsZXJ0IFwiU2tpcCBsb2dpYyBlcnJvciBpbiBxdWVzdGlvbiAje3F1ZXN0aW9uLmdldCgnbmFtZScpfVxcblxcbiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcblxuICAgICAgICBpZiByZXN1bHRcbiAgICAgICAgICBxdi4kZWwuYWRkQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBxdi4kZWwucmVtb3ZlQ2xhc3MgXCJkaXNhYmxlZF9za2lwcGVkXCJcbiAgICAgICAgICBxdi5pc1NraXBwZWQgPSBmYWxzZVxuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICwgQFxuXG4gIGlzVmFsaWQ6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIHJldHVybiB0cnVlIGlmIG5vdCB2aWV3cz8gIyBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gY2hlY2ssIGl0IG11c3QgYmUgZ29vZFxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIGZvciBxdiwgaSBpbiB2aWV3c1xuICAgICAgcXYudXBkYXRlVmFsaWRpdHkoKVxuICAgICAgIyBjYW4gd2Ugc2tpcCBpdD9cbiAgICAgIGlmIG5vdCBxdi5tb2RlbC5nZXRCb29sZWFuKFwic2tpcHBhYmxlXCIpXG4gICAgICAgICMgaXMgaXQgdmFsaWRcbiAgICAgICAgaWYgbm90IHF2LmlzVmFsaWRcbiAgICAgICAgICAjIHJlZCBhbGVydCEhXG4jICAgICAgICAgIGNvbnNvbGUubG9nKFwicG9wIHVwIGFuIGVycm9yXCIpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4jICAgICwgQFxuICAgIHJldHVybiB0cnVlXG5cbiAgdGVzdFZhbGlkOiAtPlxuIyAgICBjb25zb2xlLmxvZyhcIlN1cnZleVJpbkl0ZW0gdGVzdFZhbGlkLlwiKVxuIyAgICBpZiBub3QgQHByb3RvdHlwZVJlbmRlcmVkIHRoZW4gcmV0dXJuIGZhbHNlXG4jICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4jICAgIGlmIEBpc1ZhbGlkP1xuIyAgICBjb25zb2xlLmxvZyhcInRlc3R2YWxpZDogXCIgKyBAaXNWYWxpZD8pXG4gICAgcmV0dXJuIEBpc1ZhbGlkKClcbiMgICAgZWxzZVxuIyAgICAgIHJldHVybiBmYWxzZVxuIyAgICB0cnVlXG5cblxuICAjIEBUT0RPIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJldHVybmluZyBtdWx0aXBsZSwgc2luZ2xlIHR5cGUgaGFzaCB2YWx1ZXNcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXN1bHQgPSB7fVxuICAgIEBxdWVzdGlvblZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID0gXCJza2lwcGVkXCJcbiAgICAsIEBcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgZ2V0UmVzdWx0OiAtPlxuICAgIHJlc3VsdCA9IHt9XG4gICAgQHF1ZXN0aW9uVmlld3MuZm9yRWFjaCAocXYsIGkpIC0+XG4jICAgICAgcmVzdWx0W0BxdWVzdGlvbnMubW9kZWxzW2ldLmdldChcIm5hbWVcIildID1cbiAgICAgIHJlc3VsdFtxdi5uYW1lXSA9XG4gICAgICAgIGlmIHF2Lm5vdEFza2VkICMgYmVjYXVzZSBvZiBncmlkIHNjb3JlXG4gICAgICAgICAgcXYubm90QXNrZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBub3QgXy5pc0VtcHR5KHF2LmFuc3dlcikgIyB1c2UgYW5zd2VyXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgICAgIGVsc2UgaWYgcXYuc2tpcHBlZFxuICAgICAgICAgIHF2LnNraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc1NraXBwZWRcbiAgICAgICAgICBxdi5sb2dpY1NraXBwZWRSZXN1bHRcbiAgICAgICAgZWxzZSBpZiBxdi5pc0F1dG9zdG9wcGVkXG4gICAgICAgICAgcXYubm90QXNrZWRBdXRvc3RvcFJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcXYuYW5zd2VyXG4gICAgLCBAXG4gICAgaGFzaCA9IEBtb2RlbC5nZXQoXCJoYXNoXCIpIGlmIEBtb2RlbC5oYXMoXCJoYXNoXCIpXG4gICAgc3VidGVzdFJlc3VsdCA9XG4gICAgICAnYm9keScgOiByZXN1bHRcbiAgICAgICdtZXRhJyA6XG4gICAgICAgICdoYXNoJyA6IGhhc2hcbiMgICAgcmV0dXJuIHJlc3VsdFxuXG4gIHNob3dFcnJvcnM6ICh2aWV3cyA9IEBxdWVzdGlvblZpZXdzKSAtPlxuICAgIEAkZWwuZmluZCgnLm1lc3NhZ2UnKS5yZW1vdmUoKVxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIHZpZXdzID0gW3ZpZXdzXSBpZiBub3QgXy5pc0FycmF5KHZpZXdzKVxuICAgIHZpZXdzLmZvckVhY2ggKHF2LCBpKSAtPlxuICAgICAgaWYgbm90IF8uaXNTdHJpbmcocXYpXG4gICAgICAgIG1lc3NhZ2UgPSBcIlwiXG4gICAgICAgIGlmIG5vdCBxdi5pc1ZhbGlkXG4gICAgICAgICAgIyBoYW5kbGUgY3VzdG9tIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgICBjdXN0b21NZXNzYWdlID0gcXYubW9kZWwuZ2V0KFwiY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VcIilcbiAgICAgICAgICBpZiBub3QgXy5pc0VtcHR5KGN1c3RvbU1lc3NhZ2UpXG4gICAgICAgICAgICBtZXNzYWdlID0gY3VzdG9tTWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBAdGV4dC5wbGVhc2VBbnN3ZXJcblxuICAgICAgICAgIGlmIGZpcnN0ID09IHRydWVcbiAgICAgICAgICAgIEBzaG93UXVlc3Rpb24oaSkgaWYgdmlld3MgPT0gQHF1ZXN0aW9uVmlld3NcbiAgICAgICAgICAgIHF2LiRlbC5zY3JvbGxUbygpXG4gICAgICAgICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5jb3JyZWN0RXJyb3JzXG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgIHF2LnNldE1lc3NhZ2UgbWVzc2FnZVxuICAgICwgQFxuXG5cbiAgZ2V0U3VtOiAtPlxuICAgIHJldHVybiB7Y29ycmVjdDowLGluY29ycmVjdDowLG1pc3Npbmc6MCx0b3RhbDowfVxuXG4gIGNoaWxkRXZlbnRzOlxuICAgICdhbnN3ZXIgc2Nyb2xsJzogJ29uUXVlc3Rpb25BbnN3ZXInXG4gICAgJ2Fuc3dlcic6ICdvblF1ZXN0aW9uQW5zd2VyJ1xuICAgICdyZW5kZXJlZCc6ICdvblF1ZXN0aW9uUmVuZGVyZWQnXG4gICAgJ3JlbmRlcjpjb2xsZWN0aW9uJzogJ3JlbmRlckNvbCdcbiAgICAnYXR0YWNoJzogJ2F0dGFjaENoaWxkJ1xuXG4gICMgVGhpcyB0ZXN0cyBpZiBhZGQ6Y2hpbGQgaXMgdHJpZ2dlcmVkIG9uIHRoZSBzdWJ0ZXN0IGluc3RlYWQgb2Ygb24gQXNzZXNzbWVudENvbXBvc2l0ZVZpZXcuXG4gIGZvbzogLT5cbiAgICBjb25zb2xlLmxvZyhcInRlc3QgMTIzIFNWIGNoaWxkIGZvb1wiKVxuXG4gIHJlbmRlckNvbDogLT5cbiAgICBjb25zb2xlLmxvZyhcIm9uUmVuZGVyQ29sXCIpXG5cbiAgYXR0YWNoQ2hpbGQ6IC0+XG4gICAgY29uc29sZS5sb2coXCJhdHRhY2hDaGlsZFwiKVxuICAgIEB0cmlnZ2VyIFwiY2hpbGRBdHRhY2hlZFwiXG5cbiAgIyBwb3B1bGF0ZXMgQHF1ZXN0aW9uVmlld3MgZm9yIHRoaXMgdmlldy5cbiAgYnVpbGRDaGlsZFZpZXc6IChjaGlsZCwgQ2hpbGRWaWV3Q2xhc3MsIGNoaWxkVmlld09wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHttb2RlbDogY2hpbGR9LCBjaGlsZFZpZXdPcHRpb25zKTtcbiAgICBjaGlsZFZpZXcgPSBuZXcgQ2hpbGRWaWV3Q2xhc3Mob3B0aW9ucylcbiAgICByZXF1aXJlZCA9IGNoaWxkLmdldE51bWJlciBcImxpbmtlZEdyaWRTY29yZVwiXG4gICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgY2hpbGQuc2V0ICBcIm5vdEFza2VkXCIsIGlzTm90QXNrZWRcbiAgICBpZiBpc05vdEFza2VkIHRoZW4gQG5vdEFza2VkQ291bnQrK1xuICAgIE1hcmlvbmV0dGUuTW9uaXRvckRPTVJlZnJlc2goY2hpbGRWaWV3KTtcbiAgICBAcXVlc3Rpb25WaWV3c1tjaGlsZFZpZXdPcHRpb25zLmluZGV4XSA9IGNoaWxkVmlld1xuXG4gICAgcmV0dXJuIGNoaWxkVmlld1xuICAsXG5cbiMgIFBhc3NlcyBvcHRpb25zIHRvIGVhY2ggY2hpbGRWaWV3IGluc3RhbmNlXG4gIGNoaWxkVmlld09wdGlvbnM6IChtb2RlbCwgaW5kZXgpLT5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAbW9kZWwucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgbmFtZSAgID0gbW9kZWwuZXNjYXBlKFwibmFtZVwiKS5yZXBsYWNlIC9bXkEtWmEtejAtOV9dL2csIFwiLVwiXG4gICAgYW5zd2VyID0gcHJldmlvdXNbbmFtZV0gaWYgcHJldmlvdXNcbiAgICBsYWJlbHMgPSB7fVxuICAgIGxhYmVscy50ZXh0ID0gQHRleHRcbiAgICBtb2RlbC5zZXQoJ2xhYmVscycsIGxhYmVscylcbiAgICBvcHRpb25zID1cbiAgICAgIG1vZGVsICAgICAgICAgOiBtb2RlbFxuICAgICAgcGFyZW50ICAgICAgICA6IEBcbiAgICAgIGRhdGFFbnRyeSAgICAgOiBAZGF0YUVudHJ5XG4gICAgICBub3RBc2tlZCAgICAgIDogbW9kZWwuZ2V0IFwibm90QXNrZWRcIlxuICAgICAgaXNPYnNlcnZhdGlvbiA6IEBpc09ic2VydmF0aW9uXG4gICAgICBhbnN3ZXIgICAgICAgIDogYW5zd2VyXG4gICAgICBpbmRleCAgOiBpbmRleFxuICAgIHJldHVybiBvcHRpb25zXG5cbiAgb25DaGlsZHZpZXdSZW5kZXI6ICgpIC0+XG4jICAgIGNvbnNvbGUubG9nKFwiY2hpbGRWaWV3UmVuZGVyZWQuXCIpO1xuICAgIEB0cmlnZ2VyIFwiY2hpbGRWaWV3UmVuZGVyZWRcIlxuXG4gIG9uQmVmb3JlUmVuZGVyOiAtPlxuIyAgICBAcXVlc3Rpb25zLnNvcnQoKVxuXG4gIG9uUmVuZGVyOiAtPlxuXG4gICAgbm90QXNrZWRDb3VudCA9IDBcbiAgICBpZiBAbW9kZWwucXVlc3Rpb25zP1xuICAgICAgQG1vZGVsLnF1ZXN0aW9ucy5tb2RlbHMuZm9yRWFjaCAocXVlc3Rpb24sIGkpID0+XG4jIHNraXAgdGhlIHJlc3QgaWYgc2NvcmUgbm90IGhpZ2ggZW5vdWdoXG4gICAgICAgIHJlcXVpcmVkID0gcXVlc3Rpb24uZ2V0TnVtYmVyIFwibGlua2VkR3JpZFNjb3JlXCJcbiAgICAgICAgaXNOb3RBc2tlZCA9ICggKCByZXF1aXJlZCAhPSAwICYmIEBwYXJlbnQuZ2V0R3JpZFNjb3JlKCkgPCByZXF1aXJlZCApIHx8IEBwYXJlbnQuZ3JpZFdhc0F1dG9zdG9wcGVkKCkgKSAmJiBAcGFyZW50LmdldEdyaWRTY29yZSgpICE9IGZhbHNlXG4gICAgICAgIHF1ZXN0aW9uLnNldCAgXCJub3RBc2tlZFwiLCBpc05vdEFza2VkXG4gICAgICAgIGlmIGlzTm90QXNrZWQgdGhlbiBAbm90QXNrZWRDb3VudCsrXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiMgICAgaWYgQGZvY3VzTW9kZVxuIyAgICAgICQoJyNzdWJ0ZXN0X3dyYXBwZXInKS5hZnRlciAkIFwiXG4jICAgICAgICAgICAgPGRpdiBpZD0nc3VtbWFyeV9jb250YWluZXInPjwvZGl2PlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gcHJldl9xdWVzdGlvbic+I3tAdGV4dC5wcmV2aW91c1F1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gbmV4dF9xdWVzdGlvbic+I3tAdGV4dC5uZXh0UXVlc3Rpb259PC9idXR0b24+XG4jICAgICAgICAgIFwiXG5cbiAgb25SZW5kZXJDb2xsZWN0aW9uOi0+XG4jICAgIGlmIEBmb2N1c01vZGVcbiMgICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuIyAgICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICBcIlxuICAgIEB1cGRhdGVFeGVjdXRlUmVhZHkodHJ1ZSlcbiAgICBAdXBkYXRlUXVlc3Rpb25WaXNpYmlsaXR5KClcbiAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcblxuICAgIGlmIEBxdWVzdGlvbnMubGVuZ3RoID09IEBub3RBc2tlZENvdW50XG4gICAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSAhPSBcImNsYXNzXCJcbiAgICAgICAgQHBhcmVudC5uZXh0PygpXG4gICAgICBlbHNlXG4jICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgJCBcIjxwIGNsYXNzPSdncmV5Jz4je0B0ZXh0Lm5vdEVub3VnaH08L3A+XCJcbiAgICAgICAgYWxlcnQgQHRleHQubm90RW5vdWdoXG5cbiMgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG5cblxuXG4jICBvblNob3c6IC0+XG4jICAgIGNvbnNvbGUubG9nKFwib25TaG93XCIpXG4jICAgIGlmIEBmb2N1c01vZGVcbiMgICAgICAkKCcjc3VidGVzdF93cmFwcGVyJykuYWZ0ZXIgJCBcIlxuIyAgICAgICAgICAgIDxkaXYgaWQ9J3N1bW1hcnlfY29udGFpbmVyJz48L2Rpdj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIHByZXZfcXVlc3Rpb24nPiN7QHRleHQucHJldmlvdXNRdWVzdGlvbn08L2J1dHRvbj5cbiMgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSduYXZpZ2F0aW9uIG5leHRfcXVlc3Rpb24nPiN7QHRleHQubmV4dFF1ZXN0aW9ufTwvYnV0dG9uPlxuIyAgICAgICAgICBcIlxuIyAgICBAdXBkYXRlRXhlY3V0ZVJlYWR5KHRydWUpXG4jICAgIEB1cGRhdGVRdWVzdGlvblZpc2liaWxpdHkoKVxuIyAgICBAdXBkYXRlUHJvZ3Jlc3NCdXR0b25zKClcbiNcbiMgICAgaWYgQHF1ZXN0aW9ucy5sZW5ndGggPT0gQG5vdEFza2VkQ291bnRcbiMgICAgICBpZiBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSAhPSBcImNsYXNzXCJcbiMgICAgICAgIEBwYXJlbnQubmV4dD8oKVxuIyAgICAgIGVsc2VcbiMjICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQgJCBcIjxwIGNsYXNzPSdncmV5Jz4je0B0ZXh0Lm5vdEVub3VnaH08L3A+XCJcbiMgICAgICAgIGFsZXJ0IEB0ZXh0Lm5vdEVub3VnaFxuI1xuIyAgICAjICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuIyAgICBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcblxuICBvblNob3c6IC0+XG4gICAgZGlzcGxheUNvZGUgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZGlzcGxheUNvZGVcIilcblxuICAgIGlmIG5vdCBfLmlzRW1wdHlTdHJpbmcoZGlzcGxheUNvZGUpXG4jICAgICAgZGlzcGxheWNvZGVGaXhlZCA9IGRpc3BsYXlDb2RlLnJlcGxhY2UoXCJ2bS5jdXJyZW50Vmlldy5zdWJ0ZXN0Vmlld3Nbdm0uY3VycmVudFZpZXcuaW5kZXhdLnByb3RvdHlwZVZpZXdcIixcIlRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlld1wiKVxuIyAgICAgIGRpc3BsYXljb2RlRml4ZWQgPSBkaXNwbGF5Y29kZUZpeGVkLnJlcGxhY2UoXCJAcHJvdG90eXBlVmlld1wiLFwiVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgICBkaXNwbGF5Y29kZUZpeGVkID0gZGlzcGxheUNvZGVcbiAgICAgIGlmIF8uc2l6ZShUYW5nZXJpbmUuZGlzcGxheUNvZGVfbWlncmF0aW9ucykgPiAwXG4gICAgICAgIGZvciBrLHYgb2YgVGFuZ2VyaW5lLmRpc3BsYXlDb2RlX21pZ3JhdGlvbnNcbiAgICAgICAgICBkaXNwbGF5Y29kZUZpeGVkID0gZGlzcGxheWNvZGVGaXhlZC5yZXBsYWNlKGssdilcbiAgICAgIHRyeVxuICAgICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbZGlzcGxheWNvZGVGaXhlZF0pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBuYW1lID0gKCgvZnVuY3Rpb24gKC57MSx9KVxcKC8pLmV4ZWMoZXJyb3IuY29uc3RydWN0b3IudG9TdHJpbmcoKSlbMV0pXG4gICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGFsZXJ0IFwiI3tuYW1lfVxcblxcbiN7bWVzc2FnZX1cIlxuICAgICAgICBjb25zb2xlLmxvZyBcImRpc3BsYXljb2RlRml4ZWQgRXJyb3I6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpXG5cbiAgICBAcHJvdG90eXBlVmlldz8udXBkYXRlRXhlY3V0ZVJlYWR5Pyh0cnVlKVxuXG4gIG9uRG9tUmVmcmVzaDogLT5cbiAgICBjb25zb2xlLmxvZyhcIkkgZ2V0IHRvbyBhdHRhY2hlZCB0byBwZW9wbGUuXCIpXG5cbiMgQHRvZG8gRG9jdW1lbnRhdGlvblxuICBza2lwOiA9PlxuICAgIGN1cnJlbnRWaWV3ID0gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XG4gICAgQHBhcmVudC5yZXN1bHQuYWRkXG4gICAgICBuYW1lICAgICAgOiBjdXJyZW50Vmlldy5tb2RlbC5nZXQgXCJuYW1lXCJcbiAgICAgIGRhdGEgICAgICA6IGN1cnJlbnRWaWV3LmdldFNraXBwZWQoKVxuICAgICAgc3VidGVzdElkIDogY3VycmVudFZpZXcubW9kZWwuaWRcbiAgICAgIHNraXBwZWQgICA6IHRydWVcbiAgICAgIHByb3RvdHlwZSA6IGN1cnJlbnRWaWV3Lm1vZGVsLmdldCBcInByb3RvdHlwZVwiXG4gICAgLFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgQHBhcmVudC5yZXNldCAxXG5cbiAgIyBEb3VidCB0aGlzIGlzIGhhcHBlbmluZyBhZnRlciB0aGUgcXVlc3Rpb24gd2FzIHJlbmRlcmVkLiBUT0RPOiBmaW5kIHRoZSByaWdodCBwbGFjZS5cbiAgb25RdWVzdGlvblJlbmRlcmVkOi0+XG4jICAgIGNvbnNvbGUubG9nKFwib25RdWVzdGlvblJlbmRlcmVkIEByZW5kZXJDb3VudDogXCIgKyBAcmVuZGVyQ291bnQpXG4gICAgQHJlbmRlckNvdW50KytcbiMgICAgY29uc29sZS5sb2coXCJvblF1ZXN0aW9uUmVuZGVyZWQgQHJlbmRlckNvdW50IGluY3JlbWVudGVkOiBcIiArIEByZW5kZXJDb3VudClcbiAgICBpZiBAcmVuZGVyQ291bnQgPT0gQHF1ZXN0aW9ucy5sZW5ndGhcbiAgICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICAgICAgQHVwZGF0ZVNraXBMb2dpYygpXG4jICAgICAgQHVwZGF0ZVF1ZXN0aW9uVmlzaWJpbGl0eSgpXG4jICAgICAgQHVwZGF0ZVByb2dyZXNzQnV0dG9ucygpXG4jICAgIEB0cmlnZ2VyIFwic3ViUmVuZGVyZWRcIlxuXG4jICBvblNob3c6LT5cbiMgICAgY29uc29sZS5sb2coXCJpU2hvd24hXCIpXG4jICAgIEBvblJlbmRlckNvbGxlY3Rpb24oKVxuXG4gIG9uQ2xvc2U6LT5cbiAgICBmb3IgcXYgaW4gQHF1ZXN0aW9uVmlld3NcbiAgICAgIHF2LmNsb3NlPygpXG4gICAgQHF1ZXN0aW9uVmlld3MgPSBbXVxuXG4gIHJlc2V0OiAoaW5jcmVtZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKFwicmVzZXRcIilcbiAgICBAcmVuZGVyZWQuc3VidGVzdCA9IGZhbHNlXG4gICAgQHJlbmRlcmVkLmFzc2Vzc21lbnQgPSBmYWxzZVxuICAgICMgICAgY3VycmVudFZpZXcgPSBAc3VidGVzdFZpZXdzW0BvcmRlck1hcFtAaW5kZXhdXVxuICAgICMgICAgY3VycmVudFZpZXcuY2xvc2UoKVxuICAgIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5jbG9zZSgpO1xuICAgIEBpbmRleCA9XG4gICAgICBpZiBAYWJvcnRBc3Nlc3NtZW50ID09IHRydWVcbiAgICAgICAgQHN1YnRlc3RWaWV3cy5sZW5ndGgtMVxuICAgICAgZWxzZVxuICAgICAgICBAaW5kZXggKyBpbmNyZW1lbnRcbiAgICBAcmVuZGVyKClcbiAgICB3aW5kb3cuc2Nyb2xsVG8gMCwgMFxuXG4gIG5leHQ6ICgpIC0+XG4gICAgY29uc29sZS5sb2coXCJuZXh0XCIpXG4gICAgQG1vZGVsLnBhcmVudC5uZXh0PygpXG4iXX0=
