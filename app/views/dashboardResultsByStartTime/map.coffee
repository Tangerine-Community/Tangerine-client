( doc ) ->

  return unless doc.collection is "result"
  startTime = doc.start_time or doc.startTime
  return unless startTime?

  result =
    resultId         : doc._id
    enumerator       : doc.enumerator or doc.editedBy
    assessmentName   : doc.assessmentName
    assessmentId     : doc.assessmentId
    startTime        : startTime
    tangerineVersion : doc.tangerine_version
    numberOfSubtests : doc.subtestData.length
    workflowId       : doc.workflowId
    tripId           : doc.tripId
    subtests         : []

  for subtest in doc.subtestData

    result.subtests.push subtest.name if subtest.name
    prototype = subtest.prototype

    if prototype is "id"
      result.id = subtest.data.participant_id

    if prototype is "location"
      for label, i in subtest.data.labels
       result["Location: #{label}"] = subtest.data.location[i]

  emit startTime , result
