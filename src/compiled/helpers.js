var ResultOfGrid, ResultOfMultiple, ResultOfPrevious, ResultOfQuestion, Robbert, TangerineTree, Utils,
  slice = [].slice;

ResultOfQuestion = function(name) {
  var returnView;
  returnView = null;
  Tangerine.progress.currentSubview.questionViews.forEach(function(candidateView) {
    if (candidateView.model.get("name") === name) {
      return returnView = candidateView;
    }
  });
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  if (returnView.answer) {
    return returnView.answer;
  }
  return null;
};

ResultOfMultiple = function(name) {
  var key, ref, result, returnView, value;
  returnView = null;
  Tangerine.progress.currentSubview.questionViews.forEach(function(candidateView) {
    if (candidateView.model.get("name") === name) {
      return returnView = candidateView;
    }
  });
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  result = [];
  ref = returnView.answer;
  for (key in ref) {
    value = ref[key];
    if (value === "checked") {
      result.push(key);
    }
  }
  return result;
};

ResultOfPrevious = function(name) {
  if (typeof vm.currentView.result === 'undefined') {
    console.log("Using Tangerine.progress.currentSubview");
    return Tangerine.progress.currentSubview.model.parent.result.getVariable(name);
  } else {
    return vm.currentView.result.getVariable(name);
  }
};

ResultOfGrid = function(name) {
  if (typeof vm.currentView.result === 'undefined') {
    console.log("Using Tangerine.progress.currentSubview");
    return Tangerine.progress.currentSubview.model.parent.result.getItemResultCountByVariableName(name, "correct");
  } else {
    return vm.currentView.result.getVariable(name);
  }
};

$.extend(Tangerine, TangerineVersion);

Tangerine.onBackButton = function(event) {
  if (Tangerine.activity === "assessment run") {
    if (confirm(t("NavigationView.message.incomplete_main_screen"))) {
      Tangerine.activity = "";
      return window.history.back();
    } else {
      return false;
    }
  } else {
    return window.history.back();
  }
};

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
};

Backbone.Collection.prototype.indexBy = function(attr) {
  var result;
  result = {};
  this.models.forEach(function(oneModel) {
    var key;
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      return result[key].push(oneModel);
    }
  });
  return result;
};

Backbone.Collection.prototype.indexArrayBy = function(attr) {
  var result;
  result = [];
  this.models.forEach(function(oneModel) {
    var key;
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      return result[key].push(oneModel);
    }
  });
  return result;
};

Backbone.Collection.prototype.parse = function(result) {
  return _.pluck(result.rows, 'doc');
};

Backbone.Model.prototype._save = Backbone.Model.prototype.save;

Backbone.Model.prototype.save = function() {
  if (typeof this.beforeSave === "function") {
    this.beforeSave();
  }
  this.stamp();
  return this._save.apply(this, arguments);
};

Backbone.Model.prototype.stamp = function() {
  var ref;
  return this.set({
    editedBy: (typeof Tangerine !== "undefined" && Tangerine !== null ? (ref = Tangerine.user) != null ? ref.name() : void 0 : void 0) || "unknown",
    updated: (new Date()).toString(),
    fromInstanceId: Tangerine.settings.getString("instanceId"),
    collection: this.url
  }, {
    silent: true
  });
};

Backbone.Model.prototype.getNumber = function(key, fallback) {
  if (fallback == null) {
    fallback = 0;
  }
  if (this.has(key)) {
    return parseInt(this.get(key));
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getArray = function(key, fallback) {
  if (fallback == null) {
    fallback = [];
  }
  if (this.has(key)) {
    return this.get(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getString = function(key, fallback) {
  if (fallback == null) {
    fallback = '';
  }
  if (this.has(key)) {
    return this.get(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getEscapedString = function(key, fallback) {
  if (fallback == null) {
    fallback = '';
  }
  if (this.has(key)) {
    return this.escape(key);
  } else {
    return fallback;
  }
};

Backbone.Model.prototype.getBoolean = function(key) {
  if (this.has(key)) {
    return this.get(key) === true || this.get(key) === 'true';
  }
};

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    var e, error1;
    if (speed == null) {
      speed = 250;
    }
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (error1) {
      e = error1;
      console.log("error", e);
      console.log("Scroll error with 'this'", this);
    }
    return this;
  };
  $.fn.topCenter = function() {
    this.css("position", "absolute");
    this.css("top", $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  return $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
})(jQuery);

String.prototype.safetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
};

String.prototype.databaseSafetyDance = function() {
  return this.replace(/\s/g, "_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
};

String.prototype.count = function(substring) {
  var ref;
  return ((ref = this.match(new RegExp(substring, "g"))) != null ? ref.length : void 0) || 0;
};

Math.ave = function() {
  var i, len, result, x;
  result = 0;
  for (i = 0, len = arguments.length; i < len; i++) {
    x = arguments[i];
    result += x;
  }
  result /= arguments.length;
  return result;
};

Math.isInt = function() {
  return typeof n === 'number' && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
};

Math.decimals = function(num, decimals) {
  var m;
  m = Math.pow(10, decimals);
  num *= m;
  num = num + num<0?-0.5:+0.5 >> 0;
  return num /= m;
};

Math.commas = function(num) {
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Math.limit = function(min, num, max) {
  return Math.max(min, Math.min(num, max));
};

_.isEmptyString = function(aString) {
  if (aString === null) {
    return true;
  }
  if (!(_.isString(aString) || _.isNumber(aString))) {
    return false;
  }
  if (_.isNumber(aString)) {
    aString = String(aString);
  }
  if (aString.replace(/\s*/, '') === '') {
    return true;
  }
  return false;
};

_.indexBy = function(propertyName, objectArray) {
  var i, key, len, oneObject, result;
  result = {};
  for (i = 0, len = objectArray.length; i < len; i++) {
    oneObject = objectArray[i];
    if (oneObject[propertyName] != null) {
      key = oneObject[propertyName];
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneObject);
    }
  }
  return result;
};

Utils = (function() {
  function Utils() {}

  Utils.execute = function(functions) {
    var step;
    step = function() {
      var nextFunction;
      nextFunction = functions.shift();
      return typeof nextFunction === "function" ? nextFunction(step) : void 0;
    };
    return step();
  };

  Utils.changeLanguage = function(code, callback) {
    return i18n.setLng(code, callback);
  };

  Utils.uploadCompressed = function(docList) {
    var a, allDocsUrl;
    a = document.createElement("a");
    a.href = Tangerine.settings.get("groupHost");
    allDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/check/" + Tangerine.settings.groupDB;
    return $.ajax({
      url: allDocsUrl,
      type: "POST",
      dataType: "json",
      data: {
        keys: JSON.stringify(docList),
        user: Tangerine.settings.upUser,
        pass: Tangerine.settings.upPass
      },
      error: function(a) {
        return alert("Error connecting");
      },
      success: (function(_this) {
        return function(response) {
          var i, leftToUpload, len, row, rows;
          rows = response.rows;
          leftToUpload = [];
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            if (row.error != null) {
              leftToUpload.push(row.key);
            }
          }
          return Tangerine.db.allDocs({
            include_docs: true,
            keys: leftToUpload
          }).then(function(response) {
            var bulkDocsUrl, compressedData, docs;
            docs = {
              "docs": response.rows.map(function(el) {
                return el.doc;
              })
            };
            compressedData = LZString.compressToBase64(JSON.stringify(docs));
            a = document.createElement("a");
            a.href = Tangerine.settings.get("groupHost");
            bulkDocsUrl = a.protocol + "//" + a.host + "/_cors_bulk_docs/upload/" + Tangerine.settings.groupDB;
            return $.ajax({
              type: "POST",
              url: bulkDocsUrl,
              data: compressedData,
              error: (function(_this) {
                return function() {
                  return alert("Server bulk docs error");
                };
              })(this),
              success: (function(_this) {
                return function() {
                  Utils.sticky("Results uploaded");
                };
              })(this)
            });
          });
        };
      })(this)
    });
  };

  Utils.universalUpload = function() {
    var results;
    results = new Results;
    return results.fetch({
      success: function() {
        var docList;
        docList = results.pluck("_id");
        return Utils.uploadCompressed(docList);
      }
    });
  };

  Utils.saveDocListToFile = function() {
    return Tangerine.db.allDocs({
      include_docs: true
    }).then(function(response) {
      return Utils.saveRecordsToFile(JSON.stringify(response));
    });
  };

  Utils.checkSession = function(url, options) {
    options = options || {};
    return $.ajax({
      type: "GET",
      url: url,
      async: true,
      data: "",
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('Accept', 'application/json');
      },
      complete: function(req) {
        var resp;
        resp = $.parseJSON(req.responseText);
        if (req.status === 200) {
          console.log("Logged in.");
          if (options.success) {
            return options.success(resp);
          }
        } else if (options.error) {
          console.log("Error:" + req.status + " resp.error: " + resp.error);
          return options.error(req.status, resp.error, resp.reason);
        } else {
          return alert("An error occurred getting session info: " + resp.reason);
        }
      }
    });
  };

  Utils.restartTangerine = function(message, callback) {
    Utils.midAlert("" + (message || 'Restarting Tangerine'));
    return _.delay(function() {
      document.location.reload();
      return typeof callback === "function" ? callback() : void 0;
    }, 2000);
  };

  Utils.onUpdateSuccess = function(totalDocs) {
    Utils.documentCounter++;
    if (Utils.documentCounter === totalDocs) {
      Utils.restartTangerine("Update successful", function() {
        Tangerine.router.navigate("", false);
        if (Tangerine.settings.get("context") !== "server") {
          return Utils.askToLogout();
        }
      });
      return Utils.documentCounter = null;
    }
  };

  Utils.log = function(self, error) {
    var className;
    className = self.constructor.toString().match(/function\s*(\w+)/)[1];
    return console.log(className + ": " + error);
  };

  Utils.data = function() {
    var arg, args, key, value;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length === 1) {
      arg = args[0];
      if (_.isString(arg)) {
        return Tangerine.tempData[arg];
      } else if (_.isObject(arg)) {
        return Tangerine.tempData = $.extend(Tangerine.tempData, arg);
      } else if (arg === null) {
        return Tangerine.tempData = {};
      }
    } else if (args.length === 2) {
      key = args[0];
      value = args[1];
      Tangerine.tempData[key] = value;
      return Tangerine.tempData;
    } else if (args.length === 0) {
      return Tangerine.tempData;
    }
  };

  Utils.working = function(isWorking) {
    if (isWorking) {
      if (Tangerine.loadingTimer == null) {
        return Tangerine.loadingTimer = setTimeout(Utils.showLoadingIndicator, 3000);
      }
    } else {
      if (Tangerine.loadingTimer != null) {
        clearTimeout(Tangerine.loadingTimer);
        Tangerine.loadingTimer = null;
      }
      return $(".loading_bar").remove();
    }
  };

  Utils.showLoadingIndicator = function() {
    return $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter();
  };

  Utils.confirm = function(message, options) {
    var ref;
    if (((ref = navigator.notification) != null ? ref.confirm : void 0) != null) {
      navigator.notification.confirm(message, function(input) {
        if (input === 1) {
          return options.callback(true);
        } else if (input === 2) {
          return options.callback(false);
        } else {
          return options.callback(input);
        }
      }, options.title, options.action + ",Cancel");
    } else {
      if (window.confirm(message)) {
        options.callback(true);
        return true;
      } else {
        options.callback(false);
        return false;
      }
    }
    return 0;
  };

  Utils.getValues = function(selector) {
    var values;
    values = {};
    $(selector).find("input[type=text], input[type=password], textarea").each(function(index, element) {
      return values[element.id] = element.value;
    });
    return values;
  };

  Utils.cleanURL = function(url) {
    if ((typeof url.indexOf === "function" ? url.indexOf("%") : void 0) !== -1) {
      return url = decodeURIComponent(url);
    } else {
      return url;
    }
  };

  Utils.topAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("top", alertText, delay);
  };

  Utils.midAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("middle", alertText, delay);
  };

  Utils.alert = function(where, alertText, delay) {
    var $alert, aligner, selector;
    if (delay == null) {
      delay = 2000;
    }
    switch (where) {
      case "top":
        selector = ".top_alert";
        aligner = function($el) {
          return $el.topCenter();
        };
        break;
      case "middle":
        selector = ".mid_alert";
        aligner = function($el) {
          return $el.middleCenter();
        };
    }
    if (Utils[where + "AlertTimer"] != null) {
      clearTimeout(Utils[where + "AlertTimer"]);
      $alert = $(selector);
      $alert.html($alert.html() + "<br>" + alertText);
    } else {
      $alert = $("<div class='" + (selector.substring(1)) + " disposable_alert'>" + alertText + "</div>").appendTo("#content");
    }
    aligner($alert);
    return (function($alert, selector, delay) {
      var computedDelay;
      computedDelay = (("" + $alert.html()).match(/<br>/g) || []).length * 1500;
      return Utils[where + "AlertTimer"] = setTimeout(function() {
        Utils[where + "AlertTimer"] = null;
        return $alert.fadeOut(250, function() {
          return $(this).remove();
        });
      }, Math.max(computedDelay, delay));
    })($alert, selector, delay);
  };

  Utils.sticky = function(html, buttonText, callback, position) {
    var div;
    if (buttonText == null) {
      buttonText = "Close";
    }
    if (position == null) {
      position = "middle";
    }
    div = $("<div class='sticky_alert'>" + html + "<br><button class='command parent_remove'>" + buttonText + "</button></div>").appendTo("#content");
    if (position === "middle") {
      div.middleCenter();
    } else if (position === "top") {
      div.topCenter();
    }
    return div.on("keyup", function(event) {
      if (event.which === 27) {
        return $(this).remove();
      }
    }).find("button").click(callback);
  };

  Utils.topSticky = function(html, buttonText, callback) {
    if (buttonText == null) {
      buttonText = "Close";
    }
    return Utils.sticky(html, buttonText, callback, "top");
  };

  Utils.modal = function(html) {
    if (html === false) {
      $("#modal_back, #modal").remove();
      return;
    }
    $("body").prepend("<div id='modal_back'></div>");
    return $("<div id='modal'>" + html + "</div>").appendTo("#content").middleCenter().on("keyup", function(event) {
      if (event.which === 27) {
        return $("#modal_back, #modal").remove();
      }
    });
  };

  Utils.passwordPrompt = function(callback) {
    var $button, $pass, html;
    html = "<div id='pass_form' title='User verification'> <label for='password'>Please re-enter your password</label> <input id='pass_val' type='password' name='password' id='password' value=''> <button class='command' data-verify='true'>Verify</button> <button class='command'>Cancel</button> </div>";
    Utils.modal(html);
    $pass = $("#pass_val");
    $button = $("#pass_valform button");
    $pass.on("keyup", function(event) {
      if (event.which !== 13) {
        return true;
      }
      $button.off("click");
      $pass.off("change");
      callback($pass.val());
      return Utils.modal(false);
    });
    return $button.on("click", function(event) {
      $button.off("click");
      $pass.off("change");
      if ($(event.target).attr("data-verify") === "true") {
        callback($pass.val());
      }
      return Utils.modal(false);
    });
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.humanGUID = function() {
    return this.randomLetters(4) + "-" + this.randomLetters(4) + "-" + this.randomLetters(4);
  };

  Utils.safeLetters = "abcdefghijlmnopqrstuvwxyz".split("");

  Utils.randomLetters = function(length) {
    var result;
    result = "";
    while (length--) {
      result += Utils.safeLetters[Math.floor(Math.random() * Utils.safeLetters.length)];
    }
    return result;
  };

  Utils.flash = function(color, shouldTurnItOn) {
    if (color == null) {
      color = "red";
    }
    if (shouldTurnItOn == null) {
      shouldTurnItOn = null;
    }
    if (shouldTurnItOn == null) {
      Utils.background(color);
      return setTimeout(function() {
        return Utils.background("");
      }, 1000);
    }
  };

  Utils.background = function(color) {
    if (color != null) {
      return $("#content_wrapper").css({
        "backgroundColor": color
      });
    } else {
      return $("#content_wrapper").css("backgroundColor");
    }
  };

  Utils.$_GET = function(q, s) {
    var parts, vars;
    vars = {};
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      value = ~value.indexOf("#") ? value.split("#")[0] : value;
      return vars[key] = value.split("#")[0];
    });
    return vars;
  };

  Utils.resizeScrollPane = function() {
    return $(".scroll_pane").height($(window).height() - ($("#navigation").height() + $("#footer").height() + 100));
  };

  Utils.askToLogout = function() {
    if (confirm("Would you like to logout now?")) {
      return Tangerine.user.logout();
    }
  };

  Utils.updateFromServer = function(model) {
    var dKey, sourceDB, sourceDKey, targetDB;
    dKey = model.id.substr(-5, 5);
    this.trigger("status", "import lookup");
    sourceDB = Tangerine.settings.urlDB("group");
    targetDB = Tangerine.conf.db_name;
    sourceDKey = Tangerine.settings.urlView("group", "byDKey");

    /*
    Gets a list of documents on both the server and locally. Then replicates all by id.
     */
    return $.ajax({
      url: sourceDKey,
      type: "POST",
      dataType: "json",
      data: JSON.stringify({
        keys: dKey
      }),
      error: function(a, b) {
        return model.trigger("status", "import error", a + " " + b);
      },
      success: function(data) {
        var docList;
        docList = data.rows.reduce((function(obj, cur) {
          return obj[cur.id] = true;
        }), {});
        return Tangerine.db.query(Tangerine.conf.design_doc + "/byDKey", {
          key: dKey
        }).then(function(response) {
          if (response.rows == null) {
            console.warn(response);
          }
          docList = data.rows.reduce((function(obj, cur) {
            return obj[cur.id] = true;
          }), docList);
          docList = Object.keys(docList);
          return $.couch.replicate(sourceDB, targetDB, {
            success: function(response) {
              return model.trigger("status", "import success", response);
            },
            error: function(a, b) {
              return model.trigger("status", "import error", a + " " + b);
            }
          }, {
            doc_ids: docList
          });
        });
      }
    });
  };

  Utils.loadDevelopmentPacks = function(callback) {
    return $.ajax({
      dataType: "json",
      url: "packs.json",
      error: function(res) {
        return callback(res);
      },
      success: function(res) {
        return Tangerine.db.bulkDocs(res, function(error, doc) {
          if (error) {
            return callback(error);
          } else {
            return callback();
          }
        });
      }
    });
  };

  return Utils;

})();

Robbert = (function() {
  function Robbert() {}

  Robbert.request = function(options) {
    var error, success;
    success = options.success;
    error = options.error;
    delete options.success;
    delete options.error;
    return $.ajax({
      type: "POST",
      crossDomain: true,
      url: Tangerine.config.get("robbert"),
      dataType: "json",
      data: options,
      success: (function(_this) {
        return function(data) {
          return success(data);
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return error(data);
        };
      })(this)
    });
  };

  return Robbert;

})();

TangerineTree = (function() {
  function TangerineTree() {}

  TangerineTree.make = function(options) {
    var error, success;
    Utils.working(true);
    success = options.success;
    error = options.error;
    delete options.success;
    delete options.error;
    options.user = Tangerine.user.name();
    return $.ajax({
      type: "POST",
      crossDomain: true,
      url: Tangerine.config.get("tree") + ("make/" + (Tangerine.settings.get('groupName'))),
      dataType: "json",
      data: options,
      success: (function(_this) {
        return function(data) {
          return success(data);
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return error(data, JSON.parse(data.responseText));
        };
      })(this),
      complete: function() {
        return Utils.working(false);
      }
    });
  };

  return TangerineTree;

})();

$(function() {
  $("#content").on("click", ".clear_message", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).empty().show();
    });
  });
  $("#content").on("click", ".parent_remove", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).remove();
    });
  });
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  return $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(100, function() {
      return $(this).remove();
    });
  });
});

Handlebars.registerHelper('gridLabel', function(items, itemMap, index) {
  return _.escape(items[itemMap[index]]);
});

Handlebars.registerHelper('startRow', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "<tr>";
  }
});

Handlebars.registerHelper('endRow', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "</tr>";
  }
});

Handlebars.registerHelper('startCell', function(index) {
  console.log("index: " + index);
  if (index === 0) {
    return "<td></td>";
  }
});

Handlebars.logger.log = function(level) {
  if (level >= Handlebars.logger.level) {
    return console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)));
  }
};

Handlebars.registerHelper('log', Handlebars.logger.log);

Handlebars.logger.level = 3;

Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    return console.log(optionalValue);
  }
});

Handlebars.registerHelper('monthDropdown', function(months, currentMonth) {
  var i, len, month, renderOption, results1;
  renderOption = function(month, currentMonth) {
    var out;
    out = "<option value='" + month + "'";
    if (month === currentMonth) {
      out = out + "selected='selected'";
    }
    out = out + ">" + month.titleize() + "</option>";
    return out;
  };
  results1 = [];
  for (i = 0, len = months.length; i < len; i++) {
    month = months[i];
    results1.push(renderOption(month, currentMonth));
  }
  return results1;
});

//# sourceMappingURL=data:application/json;base64,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QyxhQUFEO0VBQ2pDLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVo7RUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLHNCQUFaO0VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO0VBRUEsSUFBRyxhQUFIO0lBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaO0lBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWjtXQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixFQUhGOztBQUxpQyxDQUFuQzs7QUFXQSxVQUFVLENBQUMsY0FBWCxDQUEwQixlQUExQixFQUEyQyxTQUFDLE1BQUQsRUFBUyxZQUFUO0FBQ3pDLE1BQUE7RUFBQSxZQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsWUFBUjtBQUNiLFFBQUE7SUFBQSxHQUFBLEdBQU0saUJBQUEsR0FBb0IsS0FBcEIsR0FBNEI7SUFDbEMsSUFBRyxLQUFBLEtBQVMsWUFBWjtNQUNFLEdBQUEsR0FBTSxHQUFBLEdBQU0sc0JBRGQ7O0lBRUEsR0FBQSxHQUFNLEdBQUEsR0FBTyxHQUFQLEdBQWEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFiLEdBQWdDO0FBQ3RDLFdBQU87RUFMTTtBQU1mO09BQUEsd0NBQUE7O2tCQUFBLFlBQUEsQ0FBYSxLQUFiLEVBQW9CLFlBQXBCO0FBQUE7O0FBUHlDLENBQTNDIiwiZmlsZSI6ImhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjXG4jIFNraXAgbG9naWNcbiNcblxuIyB0aGVzZSBjb3VsZCBlYXNpbHkgYmUgcmVmYWN0b3JlZCBpbnRvIG9uZS5cblxuUmVzdWx0T2ZRdWVzdGlvbiA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuIyAgdmlld01hc3Rlci5zdWJ0ZXN0Vmlld3NbaW5kZXhdLnByb3RvdHlwZVZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXcucXVlc3Rpb25WaWV3cy5mb3JFYWNoIChjYW5kaWRhdGVWaWV3KSAtPlxuICAgIGlmIGNhbmRpZGF0ZVZpZXcubW9kZWwuZ2V0KFwibmFtZVwiKSA9PSBuYW1lXG4gICAgICByZXR1cm5WaWV3ID0gY2FuZGlkYXRlVmlld1xuICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJSZXN1bHRPZlF1ZXN0aW9uIGNvdWxkIG5vdCBmaW5kIHZhcmlhYmxlICN7bmFtZX1cIikgaWYgcmV0dXJuVmlldyA9PSBudWxsXG4gIHJldHVybiByZXR1cm5WaWV3LmFuc3dlciBpZiByZXR1cm5WaWV3LmFuc3dlclxuICByZXR1cm4gbnVsbFxuXG5SZXN1bHRPZk11bHRpcGxlID0gKG5hbWUpIC0+XG4gIHJldHVyblZpZXcgPSBudWxsXG4jICB2aWV3TWFzdGVyLnN1YnRlc3RWaWV3c1tpbmRleF0ucHJvdG90eXBlVmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5xdWVzdGlvblZpZXdzLmZvckVhY2ggKGNhbmRpZGF0ZVZpZXcpIC0+XG4gICAgaWYgY2FuZGlkYXRlVmlldy5tb2RlbC5nZXQoXCJuYW1lXCIpID09IG5hbWVcbiAgICAgIHJldHVyblZpZXcgPSBjYW5kaWRhdGVWaWV3XG4gIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlJlc3VsdE9mUXVlc3Rpb24gY291bGQgbm90IGZpbmQgdmFyaWFibGUgI3tuYW1lfVwiKSBpZiByZXR1cm5WaWV3ID09IG51bGxcblxuICByZXN1bHQgPSBbXVxuICBmb3Iga2V5LCB2YWx1ZSBvZiByZXR1cm5WaWV3LmFuc3dlclxuICAgIHJlc3VsdC5wdXNoIGtleSBpZiB2YWx1ZSA9PSBcImNoZWNrZWRcIlxuICByZXR1cm4gcmVzdWx0XG5cblJlc3VsdE9mUHJldmlvdXMgPSAobmFtZSkgLT5cbiAgaWYgdHlwZW9mIHZtLmN1cnJlbnRWaWV3LnJlc3VsdCA9PSAndW5kZWZpbmVkJ1xuICAgIGNvbnNvbGUubG9nKFwiVXNpbmcgVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3XCIpXG4gICAgcmV0dXJuIFRhbmdlcmluZS5wcm9ncmVzcy5jdXJyZW50U3Vidmlldy5tb2RlbC5wYXJlbnQucmVzdWx0LmdldFZhcmlhYmxlKG5hbWUpXG4gIGVsc2VcbiAgICByZXR1cm4gdm0uY3VycmVudFZpZXcucmVzdWx0LmdldFZhcmlhYmxlKG5hbWUpXG5cblJlc3VsdE9mR3JpZCA9IChuYW1lKSAtPlxuICBpZiB0eXBlb2Ygdm0uY3VycmVudFZpZXcucmVzdWx0ID09ICd1bmRlZmluZWQnXG4gICAgY29uc29sZS5sb2coXCJVc2luZyBUYW5nZXJpbmUucHJvZ3Jlc3MuY3VycmVudFN1YnZpZXdcIilcbiAgICByZXR1cm4gVGFuZ2VyaW5lLnByb2dyZXNzLmN1cnJlbnRTdWJ2aWV3Lm1vZGVsLnBhcmVudC5yZXN1bHQuZ2V0SXRlbVJlc3VsdENvdW50QnlWYXJpYWJsZU5hbWUobmFtZSwgXCJjb3JyZWN0XCIpXG4gIGVsc2VcbiAgICByZXR1cm4gdm0uY3VycmVudFZpZXcucmVzdWx0LmdldFZhcmlhYmxlKG5hbWUpXG4jXG4jIFRhbmdlcmluZSBiYWNrYnV0dG9uIGhhbmRsZXJcbiNcbiQuZXh0ZW5kKFRhbmdlcmluZSxUYW5nZXJpbmVWZXJzaW9uKVxuVGFuZ2VyaW5lLm9uQmFja0J1dHRvbiA9IChldmVudCkgLT5cbiAgaWYgVGFuZ2VyaW5lLmFjdGl2aXR5ID09IFwiYXNzZXNzbWVudCBydW5cIlxuICAgIGlmIGNvbmZpcm0gdChcIk5hdmlnYXRpb25WaWV3Lm1lc3NhZ2UuaW5jb21wbGV0ZV9tYWluX3NjcmVlblwiKVxuICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gIGVsc2VcbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcblxuXG5cbiMgRXh0ZW5kIGV2ZXJ5IHZpZXcgd2l0aCBhIGNsb3NlIG1ldGhvZCwgdXNlZCBieSBWaWV3TWFuYWdlclxuQmFja2JvbmUuVmlldy5wcm90b3R5cGUuY2xvc2UgPSAtPlxuICBAcmVtb3ZlKClcbiAgQHVuYmluZCgpXG4gIEBvbkNsb3NlPygpXG5cblxuXG4jIFJldHVybnMgYW4gb2JqZWN0IGhhc2hlZCBieSBhIGdpdmVuIGF0dHJpYnV0ZS5cbkJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmluZGV4QnkgPSAoIGF0dHIgKSAtPlxuICByZXN1bHQgPSB7fVxuICBAbW9kZWxzLmZvckVhY2ggKG9uZU1vZGVsKSAtPlxuICAgIGlmIG9uZU1vZGVsLmhhcyhhdHRyKVxuICAgICAga2V5ID0gb25lTW9kZWwuZ2V0KGF0dHIpXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lTW9kZWwpXG4gIHJldHVybiByZXN1bHRcblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEFycmF5QnkgPSAoIGF0dHIgKSAtPlxuICByZXN1bHQgPSBbXVxuICBAbW9kZWxzLmZvckVhY2ggKG9uZU1vZGVsKSAtPlxuICAgIGlmIG9uZU1vZGVsLmhhcyhhdHRyKVxuICAgICAga2V5ID0gb25lTW9kZWwuZ2V0KGF0dHIpXG4gICAgICByZXN1bHRba2V5XSA9IFtdIGlmIG5vdCByZXN1bHRba2V5XT9cbiAgICAgIHJlc3VsdFtrZXldLnB1c2gob25lTW9kZWwpXG4gIHJldHVybiByZXN1bHRcblxuXG4jIFRoaXMgaXMgZm9yIFBvdWNoREIncyBzdHlsZSBvZiByZXR1cm5pbmcgZG9jdW1lbnRzXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5wYXJzZSA9IChyZXN1bHQpIC0+XG4gIHJldHVybiBfLnBsdWNrIHJlc3VsdC5yb3dzLCAnZG9jJ1xuXG5cbiMgYnkgZGVmYXVsdCBhbGwgbW9kZWxzIHdpbGwgc2F2ZSBhIHRpbWVzdGFtcCBhbmQgaGFzaCBvZiBzaWduaWZpY2FudCBhdHRyaWJ1dGVzXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuX3NhdmUgPSBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc2F2ZVxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNhdmUgPSAtPlxuICBAYmVmb3JlU2F2ZT8oKVxuICBAc3RhbXAoKVxuICBAX3NhdmUuYXBwbHkoQCwgYXJndW1lbnRzKVxuXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc3RhbXAgPSAtPlxuICBAc2V0XG4gICAgZWRpdGVkQnkgOiBUYW5nZXJpbmU/LnVzZXI/Lm5hbWUoKSB8fCBcInVua25vd25cIlxuICAgIHVwZGF0ZWQgOiAobmV3IERhdGUoKSkudG9TdHJpbmcoKVxuICAgIGZyb21JbnN0YW5jZUlkIDogVGFuZ2VyaW5lLnNldHRpbmdzLmdldFN0cmluZyhcImluc3RhbmNlSWRcIilcbiAgICBjb2xsZWN0aW9uIDogQHVybFxuICAsIHNpbGVudDogdHJ1ZVxuXG5cbiNcbiMgVGhpcyBzZXJpZXMgb2YgZnVuY3Rpb25zIHJldHVybnMgcHJvcGVydGllcyB3aXRoIGRlZmF1bHQgdmFsdWVzIGlmIG5vIHByb3BlcnR5IGlzIGZvdW5kXG4jIEBnb3RjaGEgYmUgbWluZGZ1bCBvZiB0aGUgZGVmYXVsdCBcImJsYW5rXCIgdmFsdWVzIHNldCBoZXJlXG4jXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0TnVtYmVyID0gICAgICAgIChrZXksIGZhbGxiYWNrID0gMCkgIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBwYXJzZUludChAZ2V0KGtleSkpIGVsc2UgZmFsbGJhY2tcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRBcnJheSA9ICAgICAgICAgKGtleSwgZmFsbGJhY2sgPSBbXSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBmYWxsYmFja1xuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldFN0cmluZyA9ICAgICAgICAoa2V5LCBmYWxsYmFjayA9ICcnKSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gQGdldChrZXkpICAgICAgICAgICBlbHNlIGZhbGxiYWNrXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0RXNjYXBlZFN0cmluZyA9IChrZXksIGZhbGxiYWNrID0gJycpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZXNjYXBlKGtleSkgICAgICAgIGVsc2UgZmFsbGJhY2tcbiMgdGhpcyBzZWVtcyB0b28gaW1wb3J0YW50IHRvIHVzZSBhIGRlZmF1bHRcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRCb29sZWFuID0gICAgICAgKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIChAZ2V0KGtleSkgPT0gdHJ1ZSBvciBAZ2V0KGtleSkgPT0gJ3RydWUnKVxuXG5cbiNcbiMgaGFuZHkganF1ZXJ5IGZ1bmN0aW9uc1xuI1xuKCAoJCkgLT5cblxuICAkLmZuLnNjcm9sbFRvID0gKHNwZWVkID0gMjUwLCBjYWxsYmFjaykgLT5cbiAgICB0cnlcbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlIHtcbiAgICAgICAgc2Nyb2xsVG9wOiAkKEApLm9mZnNldCgpLnRvcCArICdweCdcbiAgICAgICAgfSwgc3BlZWQsIG51bGwsIGNhbGxiYWNrXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5sb2cgXCJlcnJvclwiLCBlXG4gICAgICBjb25zb2xlLmxvZyBcIlNjcm9sbCBlcnJvciB3aXRoICd0aGlzJ1wiLCBAXG5cbiAgICByZXR1cm4gQFxuXG4gICMgcGxhY2Ugc29tZXRoaW5nIHRvcCBhbmQgY2VudGVyXG4gICQuZm4udG9wQ2VudGVyID0gLT5cbiAgICBAY3NzIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiXG4gICAgQGNzcyBcInRvcFwiLCAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyBcInB4XCJcbiAgICBAY3NzIFwibGVmdFwiLCAoKCQod2luZG93KS53aWR0aCgpIC0gQG91dGVyV2lkdGgoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxMZWZ0KCkgKyBcInB4XCJcblxuICAjIHBsYWNlIHNvbWV0aGluZyBtaWRkbGUgY2VudGVyXG4gICQuZm4ubWlkZGxlQ2VudGVyID0gLT5cbiAgICBAY3NzIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiXG4gICAgQGNzcyBcInRvcFwiLCAoKCQod2luZG93KS5oZWlnaHQoKSAtIHRoaXMub3V0ZXJIZWlnaHQoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxUb3AoKSArIFwicHhcIlxuICAgIEBjc3MgXCJsZWZ0XCIsICgoJCh3aW5kb3cpLndpZHRoKCkgLSB0aGlzLm91dGVyV2lkdGgoKSkgLyAyKSArICQod2luZG93KS5zY3JvbGxMZWZ0KCkgKyBcInB4XCJcblxuXG4pKGpRdWVyeSlcblxuXG5TdHJpbmcucHJvdG90eXBlLnNhZmV0eURhbmNlID0gLT4gdGhpcy5yZXBsYWNlKC9cXHMvZywgXCJfXCIpLnJlcGxhY2UoL1teYS16QS1aMC05X10vZyxcIlwiKVxuU3RyaW5nLnByb3RvdHlwZS5kYXRhYmFzZVNhZmV0eURhbmNlID0gLT4gdGhpcy5yZXBsYWNlKC9cXHMvZywgXCJfXCIpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTlfLV0vZyxcIlwiKVxuU3RyaW5nLnByb3RvdHlwZS5jb3VudCA9IChzdWJzdHJpbmcpIC0+IHRoaXMubWF0Y2gobmV3IFJlZ0V4cCBzdWJzdHJpbmcsIFwiZ1wiKT8ubGVuZ3RoIHx8IDBcblxuXG5NYXRoLmF2ZSA9IC0+XG4gIHJlc3VsdCA9IDBcbiAgcmVzdWx0ICs9IHggZm9yIHggaW4gYXJndW1lbnRzXG4gIHJlc3VsdCAvPSBhcmd1bWVudHMubGVuZ3RoXG4gIHJldHVybiByZXN1bHRcblxuTWF0aC5pc0ludCAgICA9IC0+IHJldHVybiB0eXBlb2YgbiA9PSAnbnVtYmVyJyAmJiBwYXJzZUZsb2F0KG4pID09IHBhcnNlSW50KG4sIDEwKSAmJiAhaXNOYU4obilcbk1hdGguZGVjaW1hbHMgPSAobnVtLCBkZWNpbWFscykgLT4gbSA9IE1hdGgucG93KCAxMCwgZGVjaW1hbHMgKTsgbnVtICo9IG07IG51bSA9ICBudW0rKGBudW08MD8tMC41OiswLjVgKT4+MDsgbnVtIC89IG1cbk1hdGguY29tbWFzICAgPSAobnVtKSAtPiBwYXJzZUludChudW0pLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5NYXRoLmxpbWl0ICAgID0gKG1pbiwgbnVtLCBtYXgpIC0+IE1hdGgubWF4KG1pbiwgTWF0aC5taW4obnVtLCBtYXgpKVxuXG4jIG1ldGhvZCBuYW1lIHNsaWdodGx5IG1pc2xlYWRpbmdcbiMgcmV0dXJucyB0cnVlIGZvciBmYWxzeSB2YWx1ZXNcbiMgICBudWxsLCB1bmRlZmluZWQsIGFuZCAnXFxzKidcbiMgb3RoZXIgZmFsc2UgdmFsdWVzIGxpa2VcbiMgICBmYWxzZSwgMFxuIyByZXR1cm4gZmFsc2Vcbl8uaXNFbXB0eVN0cmluZyA9ICggYVN0cmluZyApIC0+XG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcgaXMgbnVsbFxuICByZXR1cm4gZmFsc2UgdW5sZXNzIF8uaXNTdHJpbmcoYVN0cmluZykgb3IgXy5pc051bWJlcihhU3RyaW5nKVxuICBhU3RyaW5nID0gU3RyaW5nKGFTdHJpbmcpIGlmIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgcmV0dXJuIHRydWUgaWYgYVN0cmluZy5yZXBsYWNlKC9cXHMqLywgJycpID09ICcnXG4gIHJldHVybiBmYWxzZVxuXG5fLmluZGV4QnkgPSAoIHByb3BlcnR5TmFtZSwgb2JqZWN0QXJyYXkgKSAtPlxuICByZXN1bHQgPSB7fVxuICBmb3Igb25lT2JqZWN0IGluIG9iamVjdEFycmF5XG4gICAgaWYgb25lT2JqZWN0W3Byb3BlcnR5TmFtZV0/XG4gICAgICBrZXkgPSBvbmVPYmplY3RbcHJvcGVydHlOYW1lXVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU9iamVjdClcbiAgcmV0dXJuIHJlc3VsdFxuXG5cbmNsYXNzIFV0aWxzXG5cbiAgQGV4ZWN1dGU6ICggZnVuY3Rpb25zICkgLT5cblxuICAgIHN0ZXAgPSAtPlxuICAgICAgbmV4dEZ1bmN0aW9uID0gZnVuY3Rpb25zLnNoaWZ0KClcbiAgICAgIG5leHRGdW5jdGlvbj8oc3RlcClcbiAgICBzdGVwKClcblxuICBAY2hhbmdlTGFuZ3VhZ2UgOiAoY29kZSwgY2FsbGJhY2spIC0+XG4gICAgaTE4bi5zZXRMbmcgY29kZSwgY2FsbGJhY2tcblxuXG4gIEB1cGxvYWRDb21wcmVzc2VkOiAoZG9jTGlzdCkgLT5cblxuICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgIGEuaHJlZiA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cEhvc3RcIilcbiAgICBhbGxEb2NzVXJsID0gXCIje2EucHJvdG9jb2x9Ly8je2EuaG9zdH0vX2NvcnNfYnVsa19kb2NzL2NoZWNrLyN7VGFuZ2VyaW5lLnNldHRpbmdzLmdyb3VwREJ9XCJcblxuICAgIHJldHVybiAkLmFqYXhcbiAgICAgIHVybDogYWxsRG9jc1VybFxuICAgICAgdHlwZTogXCJQT1NUXCJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgZGF0YTpcbiAgICAgICAga2V5czogSlNPTi5zdHJpbmdpZnkoZG9jTGlzdClcbiAgICAgICAgdXNlcjogVGFuZ2VyaW5lLnNldHRpbmdzLnVwVXNlclxuICAgICAgICBwYXNzOiBUYW5nZXJpbmUuc2V0dGluZ3MudXBQYXNzXG4gICAgICBlcnJvcjogKGEpIC0+XG4gICAgICAgIGFsZXJ0IFwiRXJyb3IgY29ubmVjdGluZ1wiXG4gICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG5cbiAgICAgICAgcm93cyA9IHJlc3BvbnNlLnJvd3NcbiAgICAgICAgbGVmdFRvVXBsb2FkID0gW11cbiAgICAgICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICAgICAgbGVmdFRvVXBsb2FkLnB1c2gocm93LmtleSkgaWYgcm93LmVycm9yP1xuXG4gICAgICAgICMgaWYgaXQncyBhbHJlYWR5IGZ1bGx5IHVwbG9hZGVkXG4gICAgICAgICMgbWFrZSBzdXJlIGl0J3MgaW4gdGhlIGxvZ1xuXG4gICAgICAgIFRhbmdlcmluZS5kYi5hbGxEb2NzKGluY2x1ZGVfZG9jczp0cnVlLGtleXM6bGVmdFRvVXBsb2FkXG4gICAgICAgICkudGhlbiggKHJlc3BvbnNlKSAtPlxuICAgICAgICAgIGRvY3MgPSB7XCJkb2NzXCI6cmVzcG9uc2Uucm93cy5tYXAoKGVsKS0+ZWwuZG9jKX1cbiAgICAgICAgICBjb21wcmVzc2VkRGF0YSA9IExaU3RyaW5nLmNvbXByZXNzVG9CYXNlNjQoSlNPTi5zdHJpbmdpZnkoZG9jcykpXG4gICAgICAgICAgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgICAgYS5ocmVmID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwSG9zdFwiKVxuICAgICAgICAgIGJ1bGtEb2NzVXJsID0gXCIje2EucHJvdG9jb2x9Ly8je2EuaG9zdH0vX2NvcnNfYnVsa19kb2NzL3VwbG9hZC8je1RhbmdlcmluZS5zZXR0aW5ncy5ncm91cERCfVwiXG5cbiAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHR5cGUgOiBcIlBPU1RcIlxuICAgICAgICAgICAgdXJsIDogYnVsa0RvY3NVcmxcbiAgICAgICAgICAgIGRhdGEgOiBjb21wcmVzc2VkRGF0YVxuICAgICAgICAgICAgZXJyb3I6ID0+XG4gICAgICAgICAgICAgIGFsZXJ0IFwiU2VydmVyIGJ1bGsgZG9jcyBlcnJvclwiXG4gICAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgICBVdGlscy5zdGlja3kgXCJSZXN1bHRzIHVwbG9hZGVkXCJcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIClcblxuXG4gIEB1bml2ZXJzYWxVcGxvYWQ6IC0+XG4gICAgcmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgcmVzdWx0cy5mZXRjaFxuICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgZG9jTGlzdCA9IHJlc3VsdHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgVXRpbHMudXBsb2FkQ29tcHJlc3NlZChkb2NMaXN0KVxuXG4gIEBzYXZlRG9jTGlzdFRvRmlsZTogLT5cbiAgICBUYW5nZXJpbmUuZGIuYWxsRG9jcyhpbmNsdWRlX2RvY3M6dHJ1ZSkudGhlbiggKHJlc3BvbnNlKSAtPlxuICAgICAgVXRpbHMuc2F2ZVJlY29yZHNUb0ZpbGUoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKVxuICAgIClcblxuICBAY2hlY2tTZXNzaW9uOiAodXJsLCBvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICQuYWpheFxuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogIHVybCxcbiAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgZGF0YTogXCJcIixcbiAgICAgIGJlZm9yZVNlbmQ6ICh4aHIpLT5cbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICxcbiAgICAgIGNvbXBsZXRlOiAocmVxKSAtPlxuICAgICAgICByZXNwID0gJC5wYXJzZUpTT04ocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIGlmIChyZXEuc3RhdHVzID09IDIwMClcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbi5cIilcbiAgICAgICAgICBpZiBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcyhyZXNwKVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmVycm9yKVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6XCIgKyByZXEuc3RhdHVzICsgXCIgcmVzcC5lcnJvcjogXCIgKyByZXNwLmVycm9yKVxuICAgICAgICAgIG9wdGlvbnMuZXJyb3IocmVxLnN0YXR1cywgcmVzcC5lcnJvciwgcmVzcC5yZWFzb24pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgYWxlcnQoXCJBbiBlcnJvciBvY2N1cnJlZCBnZXR0aW5nIHNlc3Npb24gaW5mbzogXCIgKyByZXNwLnJlYXNvbilcblxuICBAcmVzdGFydFRhbmdlcmluZTogKG1lc3NhZ2UsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiI3ttZXNzYWdlIHx8ICdSZXN0YXJ0aW5nIFRhbmdlcmluZSd9XCJcbiAgICBfLmRlbGF5KCAtPlxuICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcbiAgICAgIGNhbGxiYWNrPygpXG4gICAgLCAyMDAwIClcblxuICBAb25VcGRhdGVTdWNjZXNzOiAodG90YWxEb2NzKSAtPlxuICAgIFV0aWxzLmRvY3VtZW50Q291bnRlcisrXG4gICAgaWYgVXRpbHMuZG9jdW1lbnRDb3VudGVyID09IHRvdGFsRG9jc1xuICAgICAgVXRpbHMucmVzdGFydFRhbmdlcmluZSBcIlVwZGF0ZSBzdWNjZXNzZnVsXCIsIC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJcIiwgZmFsc2VcbiAgICAgICAgVXRpbHMuYXNrVG9Mb2dvdXQoKSB1bmxlc3MgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgPT0gXCJzZXJ2ZXJcIlxuICAgICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gbnVsbFxuXG5cbiAgQGxvZzogKHNlbGYsIGVycm9yKSAtPlxuICAgIGNsYXNzTmFtZSA9IHNlbGYuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMqKFxcdyspLylbMV1cbiAgICBjb25zb2xlLmxvZyBcIiN7Y2xhc3NOYW1lfTogI3tlcnJvcn1cIlxuXG4gICMgaWYgYXJncyBpcyBvbmUgb2JqZWN0IHNhdmUgaXQgdG8gdGVtcG9yYXJ5IGhhc2hcbiAgIyBpZiB0d28gc3RyaW5ncywgc2F2ZSBrZXkgdmFsdWUgcGFpclxuICAjIGlmIG9uZSBzdHJpbmcsIHVzZSBhcyBrZXksIHJldHVybiB2YWx1ZVxuICBAZGF0YTogKGFyZ3MuLi4pIC0+XG4gICAgaWYgYXJncy5sZW5ndGggPT0gMVxuICAgICAgYXJnID0gYXJnc1swXVxuICAgICAgaWYgXy5pc1N0cmluZyhhcmcpXG4gICAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFbYXJnXVxuICAgICAgZWxzZSBpZiBfLmlzT2JqZWN0KGFyZylcbiAgICAgICAgVGFuZ2VyaW5lLnRlbXBEYXRhID0gJC5leHRlbmQoVGFuZ2VyaW5lLnRlbXBEYXRhLCBhcmcpXG4gICAgICBlbHNlIGlmIGFyZyA9PSBudWxsXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9IHt9XG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAyXG4gICAgICBrZXkgPSBhcmdzWzBdXG4gICAgICB2YWx1ZSA9IGFyZ3NbMV1cbiAgICAgIFRhbmdlcmluZS50ZW1wRGF0YVtrZXldID0gdmFsdWVcbiAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFcbiAgICBlbHNlIGlmIGFyZ3MubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiBUYW5nZXJpbmUudGVtcERhdGFcblxuXG4gIEB3b3JraW5nOiAoaXNXb3JraW5nKSAtPlxuICAgIGlmIGlzV29ya2luZ1xuICAgICAgaWYgbm90IFRhbmdlcmluZS5sb2FkaW5nVGltZXI/XG4gICAgICAgIFRhbmdlcmluZS5sb2FkaW5nVGltZXIgPSBzZXRUaW1lb3V0KFV0aWxzLnNob3dMb2FkaW5nSW5kaWNhdG9yLCAzMDAwKVxuICAgIGVsc2VcbiAgICAgIGlmIFRhbmdlcmluZS5sb2FkaW5nVGltZXI/XG4gICAgICAgIGNsZWFyVGltZW91dCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyXG4gICAgICAgIFRhbmdlcmluZS5sb2FkaW5nVGltZXIgPSBudWxsXG5cbiAgICAgICQoXCIubG9hZGluZ19iYXJcIikucmVtb3ZlKClcblxuICBAc2hvd0xvYWRpbmdJbmRpY2F0b3I6IC0+XG4gICAgJChcIjxkaXYgY2xhc3M9J2xvYWRpbmdfYmFyJz48aW1nIGNsYXNzPSdsb2FkaW5nJyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZic+PC9kaXY+XCIpLmFwcGVuZFRvKFwiYm9keVwiKS5taWRkbGVDZW50ZXIoKVxuXG4gICMgYXNrcyBmb3IgY29uZmlybWF0aW9uIGluIHRoZSBicm93c2VyLCBhbmQgdXNlcyBwaG9uZWdhcCBmb3IgY29vbCBjb25maXJtYXRpb25cbiAgQGNvbmZpcm06IChtZXNzYWdlLCBvcHRpb25zKSAtPlxuICAgIGlmIG5hdmlnYXRvci5ub3RpZmljYXRpb24/LmNvbmZpcm0/XG4gICAgICBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uLmNvbmZpcm0gbWVzc2FnZSxcbiAgICAgICAgKGlucHV0KSAtPlxuICAgICAgICAgIGlmIGlucHV0ID09IDFcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgdHJ1ZVxuICAgICAgICAgIGVsc2UgaWYgaW5wdXQgPT0gMlxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgaW5wdXRcbiAgICAgICwgb3B0aW9ucy50aXRsZSwgb3B0aW9ucy5hY3Rpb24rXCIsQ2FuY2VsXCJcbiAgICBlbHNlXG4gICAgICBpZiB3aW5kb3cuY29uZmlybSBtZXNzYWdlXG4gICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgdHJ1ZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGZhbHNlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiAwXG5cbiAgIyB0aGlzIGZ1bmN0aW9uIGlzIGEgbG90IGxpa2UgalF1ZXJ5LnNlcmlhbGl6ZUFycmF5LCBleGNlcHQgdGhhdCBpdCByZXR1cm5zIHVzZWZ1bCBvdXRwdXRcbiAgIyB3b3JrcyBvbiB0ZXh0YXJlYXMsIGlucHV0IHR5cGUgdGV4dCBhbmQgcGFzc3dvcmRcbiAgQGdldFZhbHVlczogKCBzZWxlY3RvciApIC0+XG4gICAgdmFsdWVzID0ge31cbiAgICAkKHNlbGVjdG9yKS5maW5kKFwiaW5wdXRbdHlwZT10ZXh0XSwgaW5wdXRbdHlwZT1wYXNzd29yZF0sIHRleHRhcmVhXCIpLmVhY2ggKCBpbmRleCwgZWxlbWVudCApIC0+XG4gICAgICB2YWx1ZXNbZWxlbWVudC5pZF0gPSBlbGVtZW50LnZhbHVlXG4gICAgcmV0dXJuIHZhbHVlc1xuXG4gICMgY29udmVydHMgdXJsIGVzY2FwZWQgY2hhcmFjdGVyc1xuICBAY2xlYW5VUkw6ICh1cmwpIC0+XG4gICAgaWYgdXJsLmluZGV4T2Y/KFwiJVwiKSAhPSAtMVxuICAgICAgdXJsID0gZGVjb2RlVVJJQ29tcG9uZW50IHVybFxuICAgIGVsc2VcbiAgICAgIHVybFxuXG4gICMgRGlzcG9zYWJsZSBhbGVydHNcbiAgQHRvcEFsZXJ0OiAoYWxlcnRUZXh0LCBkZWxheSA9IDIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJ0b3BcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBtaWRBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXk9MjAwMCkgLT5cbiAgICBVdGlscy5hbGVydCBcIm1pZGRsZVwiLCBhbGVydFRleHQsIGRlbGF5XG5cbiAgQGFsZXJ0OiAoIHdoZXJlLCBhbGVydFRleHQsIGRlbGF5ID0gMjAwMCApIC0+XG5cbiAgICBzd2l0Y2ggd2hlcmVcbiAgICAgIHdoZW4gXCJ0b3BcIlxuICAgICAgICBzZWxlY3RvciA9IFwiLnRvcF9hbGVydFwiXG4gICAgICAgIGFsaWduZXIgPSAoICRlbCApIC0+IHJldHVybiAkZWwudG9wQ2VudGVyKClcbiAgICAgIHdoZW4gXCJtaWRkbGVcIlxuICAgICAgICBzZWxlY3RvciA9IFwiLm1pZF9hbGVydFwiXG4gICAgICAgIGFsaWduZXIgPSAoICRlbCApIC0+IHJldHVybiAkZWwubWlkZGxlQ2VudGVyKClcblxuXG4gICAgaWYgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0/XG4gICAgICBjbGVhclRpbWVvdXQgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl1cbiAgICAgICRhbGVydCA9ICQoc2VsZWN0b3IpXG4gICAgICAkYWxlcnQuaHRtbCggJGFsZXJ0Lmh0bWwoKSArIFwiPGJyPlwiICsgYWxlcnRUZXh0IClcbiAgICBlbHNlXG4gICAgICAkYWxlcnQgPSAkKFwiPGRpdiBjbGFzcz0nI3tzZWxlY3Rvci5zdWJzdHJpbmcoMSl9IGRpc3Bvc2FibGVfYWxlcnQnPiN7YWxlcnRUZXh0fTwvZGl2PlwiKS5hcHBlbmRUbyhcIiNjb250ZW50XCIpXG5cbiAgICBhbGlnbmVyKCRhbGVydClcblxuICAgIGRvICgkYWxlcnQsIHNlbGVjdG9yLCBkZWxheSkgLT5cbiAgICAgIGNvbXB1dGVkRGVsYXkgPSAoKFwiXCIrJGFsZXJ0Lmh0bWwoKSkubWF0Y2goLzxicj4vZyl8fFtdKS5sZW5ndGggKiAxNTAwXG4gICAgICBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXSA9IHNldFRpbWVvdXQgLT5cbiAgICAgICAgICBVdGlsc1tcIiN7d2hlcmV9QWxlcnRUaW1lclwiXSA9IG51bGxcbiAgICAgICAgICAkYWxlcnQuZmFkZU91dCgyNTAsIC0+ICQodGhpcykucmVtb3ZlKCkgKVxuICAgICAgLCBNYXRoLm1heChjb21wdXRlZERlbGF5LCBkZWxheSlcblxuXG5cbiAgQHN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrLCBwb3NpdGlvbiA9IFwibWlkZGxlXCIpIC0+XG4gICAgZGl2ID0gJChcIjxkaXYgY2xhc3M9J3N0aWNreV9hbGVydCc+I3todG1sfTxicj48YnV0dG9uIGNsYXNzPSdjb21tYW5kIHBhcmVudF9yZW1vdmUnPiN7YnV0dG9uVGV4dH08L2J1dHRvbj48L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuICAgIGlmIHBvc2l0aW9uID09IFwibWlkZGxlXCJcbiAgICAgIGRpdi5taWRkbGVDZW50ZXIoKVxuICAgIGVsc2UgaWYgcG9zaXRpb24gPT0gXCJ0b3BcIlxuICAgICAgZGl2LnRvcENlbnRlcigpXG4gICAgZGl2Lm9uKFwia2V5dXBcIiwgKGV2ZW50KSAtPiBpZiBldmVudC53aGljaCA9PSAyNyB0aGVuICQodGhpcykucmVtb3ZlKCkpLmZpbmQoXCJidXR0b25cIikuY2xpY2sgY2FsbGJhY2tcblxuICBAdG9wU3RpY2t5OiAoaHRtbCwgYnV0dG9uVGV4dCA9IFwiQ2xvc2VcIiwgY2FsbGJhY2spIC0+XG4gICAgVXRpbHMuc3RpY2t5KGh0bWwsIGJ1dHRvblRleHQsIGNhbGxiYWNrLCBcInRvcFwiKVxuXG5cblxuICBAbW9kYWw6IChodG1sKSAtPlxuICAgIGlmIGh0bWwgPT0gZmFsc2VcbiAgICAgICQoXCIjbW9kYWxfYmFjaywgI21vZGFsXCIpLnJlbW92ZSgpXG4gICAgICByZXR1cm5cblxuICAgICQoXCJib2R5XCIpLnByZXBlbmQoXCI8ZGl2IGlkPSdtb2RhbF9iYWNrJz48L2Rpdj5cIilcbiAgICAkKFwiPGRpdiBpZD0nbW9kYWwnPiN7aHRtbH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKS5taWRkbGVDZW50ZXIoKS5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKSlcblxuICBAcGFzc3dvcmRQcm9tcHQ6IChjYWxsYmFjaykgLT5cbiAgICBodG1sID0gXCJcbiAgICAgIDxkaXYgaWQ9J3Bhc3NfZm9ybScgdGl0bGU9J1VzZXIgdmVyaWZpY2F0aW9uJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncGFzc3dvcmQnPlBsZWFzZSByZS1lbnRlciB5b3VyIHBhc3N3b3JkPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdwYXNzX3ZhbCcgdHlwZT0ncGFzc3dvcmQnIG5hbWU9J3Bhc3N3b3JkJyBpZD0ncGFzc3dvcmQnIHZhbHVlPScnPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJyBkYXRhLXZlcmlmeT0ndHJ1ZSc+VmVyaWZ5PC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9J2NvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIFV0aWxzLm1vZGFsIGh0bWxcblxuICAgICRwYXNzID0gJChcIiNwYXNzX3ZhbFwiKVxuICAgICRidXR0b24gPSAkKFwiI3Bhc3NfdmFsZm9ybSBidXR0b25cIilcblxuICAgICRwYXNzLm9uIFwia2V5dXBcIiwgKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2ZW50LndoaWNoID09IDEzXG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpXG4gICAgICBVdGlscy5tb2RhbCBmYWxzZVxuXG4gICAgJGJ1dHRvbi5vbiBcImNsaWNrXCIsIChldmVudCkgLT5cbiAgICAgICRidXR0b24ub2ZmIFwiY2xpY2tcIlxuICAgICAgJHBhc3Mub2ZmIFwiY2hhbmdlXCJcblxuICAgICAgY2FsbGJhY2sgJHBhc3MudmFsKCkgaWYgJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLXZlcmlmeVwiKSA9PSBcInRydWVcIlxuXG4gICAgICBVdGlscy5tb2RhbCBmYWxzZVxuXG5cblxuICAjIHJldHVybnMgYSBHVUlEXG4gIEBndWlkOiAtPlxuICAgcmV0dXJuIEBTNCgpK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK1wiLVwiK0BTNCgpK0BTNCgpK0BTNCgpXG4gIEBTNDogLT5cbiAgIHJldHVybiAoICggKCAxICsgTWF0aC5yYW5kb20oKSApICogMHgxMDAwMCApIHwgMCApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSlcblxuICBAaHVtYW5HVUlEOiAtPiByZXR1cm4gQHJhbmRvbUxldHRlcnMoNCkrXCItXCIrQHJhbmRvbUxldHRlcnMoNCkrXCItXCIrQHJhbmRvbUxldHRlcnMoNClcbiAgQHNhZmVMZXR0ZXJzID0gXCJhYmNkZWZnaGlqbG1ub3BxcnN0dXZ3eHl6XCIuc3BsaXQoXCJcIilcbiAgQHJhbmRvbUxldHRlcnM6IChsZW5ndGgpIC0+XG4gICAgcmVzdWx0ID0gXCJcIlxuICAgIHdoaWxlIGxlbmd0aC0tXG4gICAgICByZXN1bHQgKz0gVXRpbHMuc2FmZUxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKlV0aWxzLnNhZmVMZXR0ZXJzLmxlbmd0aCldXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gICMgdHVybnMgdGhlIGJvZHkgYmFja2dyb3VuZCBhIGNvbG9yIGFuZCB0aGVuIHJldHVybnMgdG8gd2hpdGVcbiAgQGZsYXNoOiAoY29sb3I9XCJyZWRcIiwgc2hvdWxkVHVybkl0T24gPSBudWxsKSAtPlxuXG4gICAgaWYgbm90IHNob3VsZFR1cm5JdE9uP1xuICAgICAgVXRpbHMuYmFja2dyb3VuZCBjb2xvclxuICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICBVdGlscy5iYWNrZ3JvdW5kIFwiXCJcbiAgICAgICwgMTAwMFxuXG4gIEBiYWNrZ3JvdW5kOiAoY29sb3IpIC0+XG4gICAgaWYgY29sb3I/XG4gICAgICAkKFwiI2NvbnRlbnRfd3JhcHBlclwiKS5jc3MgXCJiYWNrZ3JvdW5kQ29sb3JcIiA6IGNvbG9yXG4gICAgZWxzZVxuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCJcblxuICAjIFJldHJpZXZlcyBHRVQgdmFyaWFibGVzXG4gICMgaHR0cDovL2Vqb2huLm9yZy9ibG9nL3NlYXJjaC1hbmQtZG9udC1yZXBsYWNlL1xuICBAJF9HRVQ6IChxLCBzKSAtPlxuICAgIHZhcnMgPSB7fVxuICAgIHBhcnRzID0gd2luZG93LmxvY2F0aW9uLmhyZWYucmVwbGFjZSgvWz8mXSsoW149Jl0rKT0oW14mXSopL2dpLCAobSxrZXksdmFsdWUpIC0+XG4gICAgICAgIHZhbHVlID0gaWYgfnZhbHVlLmluZGV4T2YoXCIjXCIpIHRoZW4gdmFsdWUuc3BsaXQoXCIjXCIpWzBdIGVsc2UgdmFsdWVcbiAgICAgICAgdmFyc1trZXldID0gdmFsdWUuc3BsaXQoXCIjXCIpWzBdO1xuICAgIClcbiAgICB2YXJzXG5cblxuICAjIG5vdCBjdXJyZW50bHkgaW1wbGVtZW50ZWQgYnV0IHdvcmtpbmdcbiAgQHJlc2l6ZVNjcm9sbFBhbmU6IC0+XG4gICAgJChcIi5zY3JvbGxfcGFuZVwiKS5oZWlnaHQoICQod2luZG93KS5oZWlnaHQoKSAtICggJChcIiNuYXZpZ2F0aW9uXCIpLmhlaWdodCgpICsgJChcIiNmb290ZXJcIikuaGVpZ2h0KCkgKyAxMDApIClcblxuICAjIGFza3MgdXNlciBpZiB0aGV5IHdhbnQgdG8gbG9nb3V0XG4gIEBhc2tUb0xvZ291dDogLT4gVGFuZ2VyaW5lLnVzZXIubG9nb3V0KCkgaWYgY29uZmlybShcIldvdWxkIHlvdSBsaWtlIHRvIGxvZ291dCBub3c/XCIpXG5cbiAgQHVwZGF0ZUZyb21TZXJ2ZXI6IChtb2RlbCkgLT5cblxuICAgIGRLZXkgPSBtb2RlbC5pZC5zdWJzdHIoLTUsIDUpXG5cbiAgICBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBsb29rdXBcIlxuXG4gICAgc291cmNlREIgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsREIoXCJncm91cFwiKVxuICAgIHRhcmdldERCID0gVGFuZ2VyaW5lLmNvbmYuZGJfbmFtZVxuXG4gICAgc291cmNlREtleSA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcblxuICAgICMjI1xuICAgIEdldHMgYSBsaXN0IG9mIGRvY3VtZW50cyBvbiBib3RoIHRoZSBzZXJ2ZXIgYW5kIGxvY2FsbHkuIFRoZW4gcmVwbGljYXRlcyBhbGwgYnkgaWQuXG4gICAgIyMjXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogc291cmNlREtleSxcbiAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGtleXM6ZEtleSlcbiAgICAgIGVycm9yOiAoYSwgYikgLT4gbW9kZWwudHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgZG9jTGlzdCA9IGRhdGEucm93cy5yZWR1Y2UgKChvYmosIGN1cikgLT4gb2JqW2N1ci5pZF0gPSB0cnVlKSwge31cblxuICAgICAgICBUYW5nZXJpbmUuZGIucXVlcnkoXCIje1RhbmdlcmluZS5jb25mLmRlc2lnbl9kb2N9L2J5REtleVwiLFxuICAgICAgICAgIGtleTogZEtleVxuICAgICAgICApLnRoZW4gKHJlc3BvbnNlKSAtPlxuICAgICAgICAgIGNvbnNvbGUud2FybiByZXNwb25zZSB1bmxlc3MgcmVzcG9uc2Uucm93cz9cbiAgICAgICAgICBkb2NMaXN0ID0gZGF0YS5yb3dzLnJlZHVjZSAoKG9iaiwgY3VyKSAtPiBvYmpbY3VyLmlkXSA9IHRydWUpLCBkb2NMaXN0XG4gICAgICAgICAgZG9jTGlzdCA9IE9iamVjdC5rZXlzKGRvY0xpc3QpXG4gICAgICAgICAgJC5jb3VjaC5yZXBsaWNhdGUoXG4gICAgICAgICAgICBzb3VyY2VEQixcbiAgICAgICAgICAgIHRhcmdldERCLCB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICBtb2RlbC50cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IHN1Y2Nlc3NcIiwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgZXJyb3I6IChhLCBiKSAgICAgIC0+IG1vZGVsLnRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZG9jX2lkczogZG9jTGlzdFxuICAgICAgICAgIClcblxuICBAbG9hZERldmVsb3BtZW50UGFja3M6IChjYWxsYmFjaykgLT5cbiAgICAkLmFqYXhcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgdXJsOiBcInBhY2tzLmpzb25cIlxuICAgICAgZXJyb3I6IChyZXMpIC0+XG4gICAgICAgIGNhbGxiYWNrKHJlcylcbiAgICAgIHN1Y2Nlc3M6IChyZXMpIC0+XG4gICAgICAgIFRhbmdlcmluZS5kYi5idWxrRG9jcyByZXMsIChlcnJvciwgZG9jKSAtPlxuICAgICAgICAgIGlmIGVycm9yIHRoZW4gY2FsbGJhY2soZXJyb3IpIGVsc2UgY2FsbGJhY2soKVxuXG5cblxuXG4jIFJvYmJlcnQgaW50ZXJmYWNlXG5jbGFzcyBSb2JiZXJ0XG5cbiAgQHJlcXVlc3Q6IChvcHRpb25zKSAtPlxuXG4gICAgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2Vzc1xuICAgIGVycm9yICAgPSBvcHRpb25zLmVycm9yXG5cbiAgICBkZWxldGUgb3B0aW9ucy5zdWNjZXNzXG4gICAgZGVsZXRlIG9wdGlvbnMuZXJyb3JcblxuICAgICQuYWpheFxuICAgICAgdHlwZSAgICAgICAgOiBcIlBPU1RcIlxuICAgICAgY3Jvc3NEb21haW4gOiB0cnVlXG4gICAgICB1cmwgICAgICAgICA6IFRhbmdlcmluZS5jb25maWcuZ2V0KFwicm9iYmVydFwiKVxuICAgICAgZGF0YVR5cGUgICAgOiBcImpzb25cIlxuICAgICAgZGF0YSAgICAgICAgOiBvcHRpb25zXG4gICAgICBzdWNjZXNzOiAoIGRhdGEgKSA9PlxuICAgICAgICBzdWNjZXNzIGRhdGFcbiAgICAgIGVycm9yOiAoIGRhdGEgKSA9PlxuICAgICAgICBlcnJvciBkYXRhXG5cbiMgVHJlZSBpbnRlcmZhY2VcbmNsYXNzIFRhbmdlcmluZVRyZWVcblxuICBAbWFrZTogKG9wdGlvbnMpIC0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgZXJyb3IgICA9IG9wdGlvbnMuZXJyb3JcblxuICAgIGRlbGV0ZSBvcHRpb25zLnN1Y2Nlc3NcbiAgICBkZWxldGUgb3B0aW9ucy5lcnJvclxuXG4gICAgb3B0aW9ucy51c2VyID0gVGFuZ2VyaW5lLnVzZXIubmFtZSgpXG5cbiAgICAkLmFqYXhcbiAgICAgIHR5cGUgICAgIDogXCJQT1NUXCJcbiAgICAgIGNyb3NzRG9tYWluIDogdHJ1ZVxuICAgICAgdXJsICAgICAgOiBUYW5nZXJpbmUuY29uZmlnLmdldChcInRyZWVcIikgKyBcIm1ha2UvI3tUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KCdncm91cE5hbWUnKX1cIlxuICAgICAgZGF0YVR5cGUgOiBcImpzb25cIlxuICAgICAgZGF0YSAgICAgOiBvcHRpb25zXG4gICAgICBzdWNjZXNzOiAoIGRhdGEgKSA9PlxuICAgICAgICBzdWNjZXNzIGRhdGFcbiAgICAgIGVycm9yOiAoIGRhdGEgKSA9PlxuICAgICAgICBlcnJvciBkYXRhLCBKU09OLnBhcnNlKGRhdGEucmVzcG9uc2VUZXh0KVxuICAgICAgY29tcGxldGU6IC0+XG4gICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcblxuXG5cbiMjVUkgaGVscGVyc1xuJCAtPlxuICAjICMjIy5jbGVhcl9tZXNzYWdlXG4gICMgVGhpcyBsaXR0bGUgZ3V5IHdpbGwgZmFkZSBvdXQgYW5kIGNsZWFyIGhpbSBhbmQgaGlzIHBhcmVudHMuIFdyYXAgaGltIHdpc2VseS5cbiAgIyBgPHNwYW4+IG15IG1lc3NhZ2UgPGJ1dHRvbiBjbGFzcz1cImNsZWFyX21lc3NhZ2VcIj5YPC9idXR0b24+YFxuICAkKFwiI2NvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5jbGVhcl9tZXNzYWdlXCIsICBudWxsLCAoYSkgLT4gJChhLnRhcmdldCkucGFyZW50KCkuZmFkZU91dCgyNTAsIC0+ICQodGhpcykuZW1wdHkoKS5zaG93KCkgKSApXG4gICQoXCIjY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLnBhcmVudF9yZW1vdmVcIiwgbnVsbCwgKGEpIC0+ICQoYS50YXJnZXQpLnBhcmVudCgpLmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpICkgKVxuXG4gICMgZGlzcG9zYWJsZSBhbGVydHMgPSBhIG5vbi1mYW5jeSBib3hcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIixcIi5hbGVydF9idXR0b25cIiwgLT5cbiAgICBhbGVydF90ZXh0ID0gaWYgJCh0aGlzKS5hdHRyKFwiZGF0YS1hbGVydFwiKSB0aGVuICQodGhpcykuYXR0cihcImRhdGEtYWxlcnRcIikgZWxzZSAkKHRoaXMpLnZhbCgpXG4gICAgVXRpbHMuZGlzcG9zYWJsZUFsZXJ0IGFsZXJ0X3RleHRcbiAgJChcIiNjb250ZW50XCIpLm9uIFwiY2xpY2tcIiwgXCIuZGlzcG9zYWJsZV9hbGVydFwiLCAtPlxuICAgICQodGhpcykuc3RvcCgpLmZhZGVPdXQgMTAwLCAtPlxuICAgICAgJCh0aGlzKS5yZW1vdmUoKVxuXG4gICMgJCh3aW5kb3cpLnJlc2l6ZSBVdGlscy5yZXNpemVTY3JvbGxQYW5lXG4gICMgVXRpbHMucmVzaXplU2Nyb2xsUGFuZSgpXG5cbiMgSGFuZGxlYmFycyBwYXJ0aWFsc1xuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZ3JpZExhYmVsJywgKGl0ZW1zLGl0ZW1NYXAsaW5kZXgpIC0+XG4jICBfLmVzY2FwZShpdGVtc1tpdGVtTWFwW2RvbmVdXSlcbiAgXy5lc2NhcGUoaXRlbXNbaXRlbU1hcFtpbmRleF1dKVxuKVxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignc3RhcnRSb3cnLCAoaW5kZXgpIC0+XG4gIGNvbnNvbGUubG9nKFwiaW5kZXg6IFwiICsgaW5kZXgpXG4gIGlmIGluZGV4ID09IDBcbiAgICBcIjx0cj5cIlxuKVxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZW5kUm93JywgKGluZGV4KSAtPlxuICBjb25zb2xlLmxvZyhcImluZGV4OiBcIiArIGluZGV4KVxuICBpZiBpbmRleCA9PSAwXG4gICAgXCI8L3RyPlwiXG4pXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3N0YXJ0Q2VsbCcsIChpbmRleCkgLT5cbiAgY29uc29sZS5sb2coXCJpbmRleDogXCIgKyBpbmRleClcbiAgaWYgaW5kZXggPT0gMFxuICAgIFwiPHRkPjwvdGQ+XCJcbilcblxuIy8qXG4jICAgKiBVc2UgdGhpcyB0byB0dXJuIG9uIGxvZ2dpbmc6XG4jICAgKi9cbkhhbmRsZWJhcnMubG9nZ2VyLmxvZyA9IChsZXZlbCktPlxuICBpZiAgbGV2ZWwgPj0gSGFuZGxlYmFycy5sb2dnZXIubGV2ZWxcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBbXS5jb25jYXQoW1wiSGFuZGxlYmFyczogXCJdLCBfLnRvQXJyYXkoYXJndW1lbnRzKSkpXG5cbiMjLy8gREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLFxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgSGFuZGxlYmFycy5sb2dnZXIubG9nKTtcbiMjLy8gU3RkIGxldmVsIGlzIDMsIHdoZW4gc2V0IHRvIDAsIGhhbmRsZWJhcnMgd2lsbCBsb2cgYWxsIGNvbXBpbGF0aW9uIHJlc3VsdHNcbkhhbmRsZWJhcnMubG9nZ2VyLmxldmVsID0gMztcblxuIy8qXG4jICAgKiBMb2cgY2FuIGFsc28gYmUgdXNlZCBpbiB0ZW1wbGF0ZXM6ICd7e2xvZyAwIHRoaXMgXCJteVN0cmluZ1wiIGFjY291bnROYW1lfX0nXG4jICAgKiBMb2dzIGFsbCB0aGUgcGFzc2VkIGRhdGEgd2hlbiBsb2dnZXIubGV2ZWwgPSAwXG4jICAgKi9cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihcImRlYnVnXCIsIChvcHRpb25hbFZhbHVlKS0+XG4gIGNvbnNvbGUubG9nKFwiQ3VycmVudCBDb250ZXh0XCIpXG4gIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIilcbiAgY29uc29sZS5sb2codGhpcylcblxuICBpZiBvcHRpb25hbFZhbHVlXG4gICAgY29uc29sZS5sb2coXCJWYWx1ZVwiKVxuICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT1cIilcbiAgICBjb25zb2xlLmxvZyhvcHRpb25hbFZhbHVlKVxuKVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdtb250aERyb3Bkb3duJywgKG1vbnRocywgY3VycmVudE1vbnRoKS0+XG4gIHJlbmRlck9wdGlvbiA9IChtb250aCwgY3VycmVudE1vbnRoKS0+XG4gICAgb3V0ID0gXCI8b3B0aW9uIHZhbHVlPSdcIiArIG1vbnRoICsgXCInXCJcbiAgICBpZiBtb250aCA9PSBjdXJyZW50TW9udGhcbiAgICAgIG91dCA9IG91dCArIFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiXG4gICAgb3V0ID0gb3V0ICsgIFwiPlwiICsgbW9udGgudGl0bGVpemUoKSArIFwiPC9vcHRpb24+XCJcbiAgICByZXR1cm4gb3V0XG4gIHJlbmRlck9wdGlvbihtb250aCwgY3VycmVudE1vbnRoKSBmb3IgbW9udGggaW4gbW9udGhzXG4pXG4iXX0=
