class CameraRunView extends Backbone.View

  className : "CameraRunView"

  events:
    "click .camera-capture-btn"	: 'capture'
    "click .camera-browse-btn"  : 'browse'

  config:
    allowCamera   : true
    allowGallery  : false
    allowEdit     : false
    image:
      quality       : 50
      targetHeight  : 200
      targetWidth   : 135
      mimeType      : 'image/png'

  initialize: (options={}) ->
    @model = options.model
    @parent = options.parent
    @i18n()

    @imgSource = null


  i18n: ->
    @text =
      "title"           : t('CameraRunView.title')

      "captureButton"   : t('CameraRunView.button.capture')
      "browseButton"    : t('CameraRunView.button.browse')

      "captureError"    : t('CameraRunView.error.capture')
      "noCameraError"   : t('CameraRunView.error.noCamera')

  capture: ->
    navigator.camera.getPicture(
      (data) =>
        @imgSource = "data:#{@config.image.mimeType};base64,"+ data
        @$el.find(".imageContainer").show()
        @$el.find(".photoCapture").attr("src", "data:#{@config.image.mimeType};base64,"+ data)
        ""
      ,
      (error) =>
        @handleError()
        ""
      ,
        destinationType:  Camera.DestinationType.DATA_URL
        sourceType:       Camera.PictureSourceType.CAMERA
        allowEdit:        @config.allowEdit
        #quaity:           @config.image.quality
        targetWidth:      @config.image.targetWidth
        targetHeight:     @config.image.targetHeight
    )
    ""

  browse: ->
    navigator.camera.getPicture(
      (data) =>
        @imgSource = "data:"+ @config.image.mimeType +";base64,"+ data
        @$el.find(".photoContainer").show()
        @$el.find(".photoCapture").attr("src", @imgSource)
      ,
      (error) =>
        @handleError()
      ,
        destinationType:  Camera.DestinationType.DATA_URL
        sourceType:       Camera.PictureSourceType.PHOTOLIBRARY
        allowEdit:        @config.allowEdit
        quality:          @config.image.quality
        targetWidth:      @config.image.targetWidth
        targetHeight:     @config.image.targetHeight
    )
    ""

  handleError: ->
    @$el.find(".imageContainer, .noCameraError").hide()
    @$el.find(".captureError").hide()
    ""

  initDisplay: ->
    @$el.find(".camera-capture-btn, .camera-browse-btn, .imageContainer, .captureError, .noCameraError").hide()
    @updateDisplay()
    ""

  updateDisplay: ->
    @$el.find(".camera-capture-btn").show()   if @config.allowCamera
    @$el.find(".camera-browse-btn").show()    if @config.allowGallery

    @$el.find(".imageContainer").hide()       if @imgSource is null

    @$el.find(".noCameraError").show()        if not navigator.camera
    ""

  render: =>
    if navigator.camera is undefined
      @buttonState = "disabled"

    @$el.html "
      <section class='CameraRunView'>
        <div class='grid grid-pad'>
          <div class='col-3-12'>
            <div class='content'>
              <button class='camera-capture-btn capture command' #{@buttonState}>#{@text.captureButton}</button>
              <button class='camera-browse-btn browse command' #{@buttonState}>#{@text.browseButton}</button>
            </div>
          </div>
          <div class='col-7-12'>
            <div class='content'>
              <div class='imageContainer'>
                <img class='photoCapture'/>
              </div>
              <div class='captureError error'>#{@text.captureError}</div>
              <div class='noCameraError error'>#{@text.noCameraError}</div>
            </div>
          </div>
        </div>
      </section>
    "
    @initDisplay()

    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    return { "photo": "#{@imgSource}" } || {}

  getSkipped: ->
    return {}

  getSum: ->
    return {}

  onClose: ->
    ""

  isValid: -> #if no cam always return true, otherwise check if image is present
    return true if navigator.camera is undefined

    if @imgSource is null then false else true


  showErrors: ->
    @$el.find("messages").html t('CameraRunView.error.invalid')
