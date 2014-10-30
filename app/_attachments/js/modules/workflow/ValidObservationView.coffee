class ValidObservationView extends Backbone.View

  initialize: ->
    @validCount = {
      thisMonth : 0
      lastMonth : 0
    }

    @tripIds = {}

    Utils.execute [
      @fetchTripIds 
    ], @

  fetchTripIds: (callback = $.noop) ->
    d = new Date()
    year  = d.getFullYear()
    month = d.getMonth()

    Utils.execute [
      (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          key     : "year#{year}month#{month}"
          reduce  : false
          success : (response) =>
            @tripIds.thisMonth = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          key     : "year#{year}month#{month-1}"
          reduce  : false
          success : (response) =>
            @tripIds.lastMonth = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        users = [Tangerine.user.get("name")].concat(Tangerine.user.getArray("previousUsers"))
        Tangerine.$db.view "#{Tangerine.design_doc}/tripsAndUsers",
          keys    : users
          reduce  : false
          success : (response) =>
            @tripIds.thisUser = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        bestPractices = "00b0a09a-2a9f-baca-2acb-c6264d4247cb"
        fullPrimr     = "c835fc38-de99-d064-59d3-e772ccefcf7d"
        workflowKeys = [bestPractices, fullPrimr].map (el) -> "workflow-#{el}"
        Tangerine.$db.view "#{Tangerine.design_doc}/tutorTrips",
          keys    : workflowKeys
          reduce  : false
          success : (response) =>
            @tripIds.theseWorkflows = _(response.rows.map (el) -> el.value).uniq()
            callback?()

      , (callback = $.noop) ->
        @tripIds.final = {
          thisMonth : _.intersection(@tripIds.thisMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
          lastMonth : _.intersection(@tripIds.lastMonth, @tripIds.theseWorkflows, @tripIds.thisUser)
        }

        callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/spirtRotut",
          group   : true
          keys    : @tripIds.final.thisMonth
          success : (response) =>
            validTrips = response.rows.filter (row) ->
              minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
              result = minutes >= 20
              return result

            @validCount.thisMonth = validTrips.length
            callback?()

      , (callback = $.noop) ->
        Tangerine.$db.view "#{Tangerine.design_doc}/spirtRotut",
          group   : true
          keys    : @tripIds.final.lastMonth
          success : (response) =>
            validTrips = response.rows.filter (row) ->
              minutes = (parseInt(row.value.maxTime) - parseInt(row['value']['minTime'])) / 1000 / 60
              result = minutes >= 20
              return result
            @validCount.lastMonth = validTrips.length
            callback?()
      , ( callback = $.noop ) ->
        subtestIndex = 0
        limit = 1

        checkSubtest = =>

          Tangerine.$db.view("#{Tangerine.design_doc}/byCollection",
            key   : "subtest"
            skip  : subtestIndex
            limit : limit
            success: (response) =>

              return alert "Failed to find locations" if response.rows.length is 0
              
              @locationSubtest = response.rows[0].value

              if @locationSubtest.prototype? && @locationSubtest.prototype is "location"

                @targetVisits = 0

                myCounty = Tangerine.user.get("location").County
                myZone   = Tangerine.user.get("location").Zone

                for location in @locationSubtest.locations
                  county = location[0]
                  zone   = location[1]
                  @targetVisits++ if county is myCounty and zone is myZone

                callback?()

              else

                subtestIndex++
                checkSubtest()
          )
        checkSubtest()
      , @render
      ], @

  render: (status) ->
    if status is "loading"
      @$el.html "<section><h2>Valid Observations</h2><p>Loading...</p></section>"
      return

    @$el.html "
      <section>
        <h2>Valid Observations</h2>
        <table class='class_table'><tr><th></th><th>Observations</th><th>Reimbursement</th></tr>
          <tr><th>This month</th><td>#{@validCount.thisMonth} </td><td>#{Math.commas(300+(Math.min(1,@validCount.thisMonth/@targetVisits)*6000))} KES</td></tr>
          <tr><th>Previous month</th><td>#{@validCount.lastMonth} </td><td>#{Math.commas(300+(Math.min(1, @validCount.lastMonth/@targetVisits)*6000))} KES</td></tr>
        </table>
      </section>
    "

