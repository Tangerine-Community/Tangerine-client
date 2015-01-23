class TabletUser extends Backbone.Model

  url: 'user'

  RECENT_USER_MAX: 3

  initialize: ( options ) ->
    @myRoles = []

  ###
    Accessors
  ###
  name:        -> @get("name") || null
  tscNumber:   -> @get("tscNumber") || null
  roles:       -> @getArray("roles")
  isAdmin:     -> "_admin" in @roles()
  recentUsers: -> Tangerine.settings.getArray("recentUsers")

  ###
    Mutators
  ###
  setPassword: ( pass ) ->

    throw "Password cannot be empty" if pass is ""
    hashes = TabletUser.generateHash(pass)
    salt = hashes['salt']
    pass = hashes['pass']

    @set
      "pass" : pass
      "salt" : salt

    return @

  setId : (name) -> 
    @set
      "_id"  : TabletUser.calcId(name)
      "name" : name

  ###

  Preferences

  ###

  setPreferences: ( domain = "general", key = '', value = '', callback = $.noop) ->
    preferences = @get("preferences") || {}
    preferences[domain] = {} unless preferences[domain]?
    preferences[domain][key] = value
    @save({"preferences":preferences}, {success:callback, error:callback})


  getPreferences: ( domain = "general", key = "" ) ->
    prefs = @get("preferences")
    return prefs?[domain] || null if key is ""
    return prefs?[domain]?[key] || null



  ###
    Static methods
  ###

  @calcId: (name) -> "user-#{name}"

  @generateHash: ( pass, salt ) ->
    salt = hex_sha1(""+Math.random()) unless salt?
    pass = hex_sha1(pass+salt)
    return {
      pass : pass
      salt : salt
    }


  ###
    helpers
  ###
  verifyPassword: ( providedPass ) ->
    salt     = @get "salt"
    realHash = @get "pass"
    testHash = TabletUser.generateHash( providedPass, salt )['pass']
    return testHash is realHash

  ###
    controller type
  ###

  ghostLogin: (user, pass) ->
    Tangerine.log.db "User", "ghostLogin"
    $.ajax
      url: "#{Tangerine.settings.get("groupHost")}/_session"
      dataType : "json"
      xhrFields: 
        withCredentials: true
      data: 
        name: user
        password: pass
      type: "POST"
      error: -> console.log("That didn't work")
      success: (data) ->
        alert "Server login successful.\n\nPlease try again."


  signup: ( name, pass, attributes, callbacks={} ) =>

    @set "_id" : TabletUser.calcId(name)
    @fetch
      success: => @trigger "name-error", "User already exists."
      error: =>
        @set "name" : name
        @setPassword pass

        if attributes.response?
          attributes.response = hex_sha1(attributes.response+@get "salt")

        @save attributes,
          success: =>
            if Tangerine.settings.get("context") is "class"
              view = new RegisterTeacherView
                name : name
                pass : pass
              vm.show view
            else
              @trigger "login"
              callbacks.success?()

  login: ( name, pass, callbacks = {} ) ->
    user = $.cookie("user")
    throw "User already logged in" if user?
    if _.isEmpty(@attributes) or @get("name") isnt name
      @setId name
      @fetch
        success : =>
          @attemptLogin pass, callbacks
        error : (a, b) =>
          Utils.midAlert "User does not exist."
          @clear()
    else
      @attemptLogin pass, callbacks

  attemptLogin: ( pass, callbacks={} ) ->
    if @verifyPassword pass
      $.cookie "user", @id
      @trigger "login"
      callbacks.success?()
      
      recentUsers = @recentUsers().filter( (a) => !~a.indexOf(@name()))
      recentUsers.unshift(@name())
      recentUsers.pop() if recentUsers.length > @RECENT_USER_MAX
      Tangerine.settings.save "recentUsers" : recentUsers

      return true
    else
      @trigger "pass-error", t("LoginView.message.error_password_incorrect")
      $.removeCookie "user"
      callbacks.error?()
      return false

  sessionRefresh: (callbacks) ->
    user = $.cookie "user"
    if user?
      @set "_id": user
      @fetch
        error: -> callbacks.error?()
        success: ->
          callbacks.success()
    else
      callbacks.success()

  # @callbacks Supports isAdmin, isUser, isAuthenticated, isUnregistered
  verify: ( callbacks ) ->
    if @name() == null
      if callbacks?.isUnregistered?
        callbacks.isUnregistered()
      else
        Tangerine.router.navigate "login", true
    else
      callbacks?.isAuthenticated?()
      if @isAdmin()
        callbacks?.isAdmin?()
      else
        callbacks?.isUser?()

  logout: ->

    @clear()

    $.removeCookie("AuthSession")
    $.removeCookie("user")

    if Tangerine.settings.get("context") == "server"
      window.location = Tangerine.settings.urlIndex "trunk"
    else
      Tangerine.router.navigate "login", true

    Tangerine.log.app "User-logout", "logout"
