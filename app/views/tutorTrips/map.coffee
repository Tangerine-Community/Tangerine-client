(doc) ->

  return unless doc.collection is "result"
  return unless doc.tripId

  #
  # by month
  #

  year  = docTime.getFullYear()
  month = docTime.getMonth() + 1
  emit "year#{year}month#{month}", doc.tripId

  #
  # by workflow
  #

  emit "workflow-" + doc.workflowId, doc.tripId
