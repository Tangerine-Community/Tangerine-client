class StudentEditView extends Backbone.View

  events:
    'click .done' : 'done'
    'click .back' : 'back'

  initialize: ( options ) ->
    @student = options.student
    @klasses = options.klasses

  done: ->
    klassId = @$el.find("#klass_select option:selected").attr("data-id")
    klassId = null if klassId == "null"
    @student.set
      name    : @$el.find("#name").val()
      gender  : @$el.find("#gender").val()
      age     : @$el.find("#age").val()
      klassId : klassId
    @student.save()
    @back()

  back: ->
    window.history.back()

  render: ->
    name   = @student.get("name")   || ""
    gender = @student.get("gender") || ""
    age    = @student.get("age")    || ""

    klassId = @student.get("klassId")
    html = "
    <h1>Edit Student</h1>
    <button class='back navigation'>Back</button><br>
    <div class='info_box'>
      <div class='label_value'>
        <label for='name'>Name</label>
        <input id='name' value='#{name}'>
      </div>
      <div class='label_value'>
        <label for='gender'>Gender</label>
        <input id='gender' value='#{gender}'>
      </div>
      <div class='label_value'>
        <label for='age'>Age</label>
        <input id='age' value='#{age}'>
      </div>
      <div class='label_value'>
        <label for='klass_select'>Class</label>
        <select id='klass_select'>"
    html += "<option data-id='null' #{if klassId == null then "selected='selected'"}>None</option>"
    for klass in @klasses.models
      html += "<option data-id='#{klass.id}' #{if klass.id == klassId then "selected='selected'"}>#{klass.get 'year'} - #{klass.get 'grade'} - #{klass.get 'stream'}</option>"

    html += "
        </select>
      </div>
      <button class='done command'>Done</button>
    </div>
    "
    
    @$el.html html
    @trigger "rendered"
