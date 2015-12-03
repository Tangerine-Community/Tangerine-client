class SurveyRunItemView extends Backbone.Marionette.CompositeView

  template: JST["Survey"],
  childView: QuestionRunItemView,
  tagName: "p",
  className: "SurveyRunItemView"

  events:
    'click .next_question' : 'nextQuestion'
    'click .prev_question' : 'prevQuestion'

  initialize: (options) ->

    @model         = options.model
    @parent        = @model.parent
    @dataEntry     = options.dataEntry
    @isObservation = options.isObservation
    @focusMode     = @model.getBoolean("focusMode")
    @questionIndex = 0 if @focusMode
    @questionViews = []
    @answered      = []
    @renderCount   = 0
#    @childViewOptions =
#        parent: this

    @i18n()
#    this.listenTo(@model.collection,'change', this.viewRender)
#      this.listenTo(model.collection, 'reset', this.render);
#    if @model.questions.length == 0
#      console.log("No questions.")
    @collection = @model.questions
    @questions = @collection
#    @model.questions.fetch
#      viewOptions:
#        key: "question-#{@model.id}"
#      success: (collection) =>
##        @model.questions.sort()
#        collection.sort()
#        @model.collection.models = collection.models
#        @render()

    Tangerine.progress.currentSubview = @
    labels = {}
    labels.text = @text
    @model.set('labels', labels)

    @skippable = @model.get("skippable") == true || @model.get("skippable") == "true"
    @backable = ( @model.get("backButton") == true || @model.get("backButton") == "true" ) and @parent.index isnt 0
    @parent.displaySkip(@skippable)
    @parent.displayBack(@backable)

#  filter: (child, index, collection) ->
#    return child.get('value') % 2 == 0

#  modelAdded:->
#    console.log("model added")

  nextQuestion: ->
#    console.log("nextQuestion")

    currentQuestionView = @questionViews[@questionIndex]

    # show errors before doing anything if there are any
    return @showErrors(currentQuestionView) unless @isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e > @questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = @questionIndex
    else
      plannedIndex = Math.min.apply(plannedIndex, isAvailable)

    if @questionIndex != plannedIndex
      @questionIndex = plannedIndex
      @updateQuestionVisibility()
      @updateProgressButtons()

  prevQuestion: ->

    currentQuestionView = @questionViews[@questionIndex]

    # show errors before doing anything if there are any
    return @showErrors(currentQuestionView) unless @isValid(currentQuestionView)

    # find the non-skipped questions
    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable  = _.filter isAvailable, (e) => e < @questionIndex

    # don't go anywhere unless we have somewhere to go
    if isAvailable.length == 0
      plannedIndex = @questionIndex
    else
      plannedIndex = Math.max.apply(plannedIndex, isAvailable)

    if @questionIndex != plannedIndex
      @questionIndex = plannedIndex
      @updateQuestionVisibility()
      @updateProgressButtons()

  updateProgressButtons: ->

    isAvailable = []
    for qv, i in @questionViews
      isAvailable.push i if not (qv.isAutostopped or qv.isSkipped)
    isAvailable.push @questionIndex

    $prev = @$el.find(".prev_question")
    $next = @$el.find(".next_question")

    minimum = Math.min.apply( minimum, isAvailable )
    maximum = Math.max.apply( maximum, isAvailable )

    if @questionIndex == minimum
      $prev.hide()
    else
      $prev.show()

    if @questionIndex == maximum
      $next.hide()
    else
      $next.show()

  updateExecuteReady: (ready) ->

#    console.log("updateExecuteReady: " + ready + " @triggerShowList? " + @triggerShowList?)
    @executeReady = ready

    return if not @triggerShowList?

    if @triggerShowList.length > 0
      for index in @triggerShowList
        @questionViews[index]?.trigger "show"
      @triggerShowList = []

    @updateSkipLogic() if @executeReady


  updateQuestionVisibility: ->

    return unless @model.get("focusMode")

    if @questionIndex == @questionViews.length
      @$el.find("#summary_container").html "
        last page here
      "
      @$el.find("#next_question").hide()
    else
      @$el.find("#summary_container").empty()
      @$el.find("#next_question").show()

    $questions = @$el.find(".question")
    $questions.hide()
    $questions.eq(@questionIndex).show()

    # trigger the question to run it's display code if the subtest's displaycode has already ran
    # if not, add it to a list to run later.
    if @executeReady
      @questionViews[@questionIndex].trigger "show"
    else
      @triggerShowList = [] if not @triggerShowList
      @triggerShowList.push @questionIndex

  showQuestion: (index) ->
    @questionIndex = index if _.isNumber(index) && index < @questionViews.length && index > 0
    @updateQuestionVisibility()
    @updateProgressButtons()

  i18n: ->
    @text =
      pleaseAnswer : t("SurveyRunView.message.please_answer")
      correctErrors : t("SurveyRunView.message.correct_errors")
      notEnough : _(t("SurveyRunView.message.not_enough")).escape()

      previousQuestion : t("SurveyRunView.button.previous_question")
      nextQuestion : t("SurveyRunView.button.next_question")
      "next" : t("SubtestRunView.button.next")
      "back" : t("SubtestRunView.button.back")
      "skip" : t("SubtestRunView.button.skip")
      "help" : t("SubtestRunView.button.help")

  # when a question is answered
  onQuestionAnswer: (element) ->
#    console.log("onQuestionAnswer @renderCount:" + @renderCount + "  @questions.length: " +  @questions.length)
#    this is not good. Should test for ==
    return unless @renderCount >= @questions.length

    # auto stop after limit
    @autostopped    = false
    autostopLimit   = @model.getNumber "autostopLimit"
    longestSequence = 0
    autostopCount   = 0

    if autostopLimit > 0
      for i in [1..@questionViews.length] # just in case they can't count
        currentAnswer = @questionViews[i-1].answer
        if currentAnswer == "0" or currentAnswer == "9"
          autostopCount++
        else
          autostopCount = 0
        longestSequence = Math.max(longestSequence, autostopCount)
        # if the value is set, we've got a threshold exceeding run, and it's not already autostopped
        if autostopLimit != 0 && longestSequence >= autostopLimit && not @autostopped
          @autostopped = true
          @autostopIndex = i
    @updateAutostop()
    @updateSkipLogic()

  updateAutostop: ->
    autostopLimit = @model.getNumber "autostopLimit"
    @questionViews.forEach (view, i) ->
      if i > (@autostopIndex - 1)
        if @autostopped
          view.isAutostopped = true
          view.$el.addClass    "disabled_autostop"
        else
          view.isAutostopped = false
          view.$el.removeClass "disabled_autostop"
    , @

  updateSkipLogic: ->
#    console.log("updateSkipLogic")
#    console.log("@questionViews" + @questionViews.length)
    @questionViews.forEach (qv) ->
      question = qv.model
      skipLogicCode = question.getString "skipLogic"
      unless skipLogicCode is ""
        try
          result = CoffeeScript.eval.apply(@, [skipLogicCode])
#          console.log("skipLogicCode: " + skipLogicCode)
        catch error
          name = ((/function (.{1,})\(/).exec(error.constructor.toString())[1])
          message = error.message
          alert "Skip logic error in question #{question.get('name')}\n\n#{name}\n\n#{message}"

        if result
          qv.$el.addClass "disabled_skipped"
          qv.isSkipped = true
        else
          qv.$el.removeClass "disabled_skipped"
          qv.isSkipped = false
      qv.updateValidity()
    , @

  isValid: (views = @questionViews) ->
    return true if not views? # if there's nothing to check, it must be good
    views = [views] if not _.isArray(views)
    for qv, i in views
      qv.updateValidity()
      # can we skip it?
      if not qv.model.getBoolean("skippable")
        # is it valid
        if not qv.isValid
          # red alert!!
#          console.log("pop up an error")
          return false
#    , @
    return true

  testValid: ->
#    console.log("SurveyRinItem testValid.")
#    if not @prototypeRendered then return false
#    currentView = Tangerine.progress.currentSubview
#    if @isValid?
#    console.log("testvalid: " + @isValid?)
    return @isValid()
#    else
#      return false
#    true


  # @TODO this should probably be returning multiple, single type hash values
  getSkipped: ->
    result = {}
    @questionViews.forEach (qv, i) ->
      result[@questions.models[i].get("name")] = "skipped"
    , @
    return result

  getResult: ->
    result = {}
    @questionViews.forEach (qv, i) ->
#      result[@questions.models[i].get("name")] =
      result[qv.name] =
        if qv.notAsked # because of grid score
          qv.notAskedResult
        else if not _.isEmpty(qv.answer) # use answer
          qv.answer
        else if qv.skipped
          qv.skippedResult
        else if qv.isSkipped
          qv.logicSkippedResult
        else if qv.isAutostopped
          qv.notAskedAutostopResult
        else
          qv.answer
    , @
    hash = @model.get("hash") if @model.has("hash")
    subtestResult =
      'body' : result
      'meta' :
        'hash' : hash
#    return result

  showErrors: (views = @questionViews) ->
    @$el.find('.message').remove()
    first = true
    views = [views] if not _.isArray(views)
    views.forEach (qv, i) ->
      if not _.isString(qv)
        message = ""
        if not qv.isValid
          # handle custom validation error messages
          customMessage = qv.model.get("customValidationMessage")
          if not _.isEmpty(customMessage)
            message = customMessage
          else
            message = @text.pleaseAnswer

          if first == true
            @showQuestion(i) if views == @questionViews
            qv.$el.scrollTo()
            Utils.midAlert @text.correctErrors
            first = false
        qv.setMessage message
    , @


  getSum: ->
#    if @prototypeView.getSum?
#      return @prototypeView.getSum()
#    else
# maybe a better fallback
#    console.log("This view does not return a sum, correct?")
    return {correct:0,incorrect:0,missing:0,total:0}

  childEvents:
    'answer scroll': 'onQuestionAnswer'
    'answer': 'onQuestionAnswer'
    'rendered': 'onQuestionRendered'

  buildChildView: (child, ChildViewClass, childViewOptions) ->
    options = _.extend({model: child}, childViewOptions);
    view = new ChildViewClass(options)

#    @listenTo view, "rendered",      @onQuestionRendered
#    @listenTo child, "answer scroll", @onQuestionAnswer

    @questionViews[childViewOptions.index] = view

    return view
  ,

#  Passes options to each childView instance
  childViewOptions: (model, index)->
    unless @dataEntry
      previous = @model.parent.result.getByHash(@model.get('hash'))
    notAskedCount = 0
    required = model.getNumber "linkedGridScore"

    isNotAsked = ( ( required != 0 && @model.parent.getGridScore() < required ) || @model.parent.gridWasAutostopped() ) && @model.parent.getGridScore() != false

    if isNotAsked then notAskedCount++

    name   = model.escape("name").replace /[^A-Za-z0-9_]/g, "-"
    answer = previous[name] if previous
    labels = {}
    labels.text = @text
    model.set('labels', labels)
    options =
      model         : model
      parent        : @
      dataEntry     : @dataEntry
      notAsked      : isNotAsked
      isObservation : @isObservation
      answer        : answer
      index  : index
    return options

  onBeforeRender: ->
#    @questions.sort()

  onRender: ->
#    @updateSkipLogic()
    @trigger "ready"
    @trigger "subRendered"
#    @listenTo oneView, "answer scroll", @onQuestionAnswer

  onRenderCollection:->
    @updateExecuteReady(true)
#    @trigger "ready"
#    @trigger "subRendered"

  onQuestionRendered: ->
#    console.log("onQuestionRendered @renderCount: " + @renderCount)
    @renderCount++
#    console.log("onQuestionRendered @renderCount incremented: " + @renderCount)
    if @renderCount == @questions.length
      @trigger "ready"
      @updateSkipLogic()
    @trigger "subRendered"

  onClose:->
    for qv in @questionViews
      qv.close?()
    @questionViews = []

  reset: (increment) ->
#    console.log("reset")
    @rendered.subtest = false
    @rendered.assessment = false
    #    currentView = @subtestViews[@orderMap[@index]]
    #    currentView.close()
    Tangerine.progress.currentSubview.close();
    @index =
      if @abortAssessment == true
        @subtestViews.length-1
      else
        @index + increment
    @render()
    window.scrollTo 0, 0
