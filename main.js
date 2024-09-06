const simpleGit = require('simple-git')

function getTickets(input) {
  const ticketRegex = /([a-zA-Z][a-zA-Z0-9_]+-[1-9][0-9]*)/g
  let source = ""
  if (input != null) {
    if (input instanceof Array) {
      source = input.map((it) => {
        return it ? (it.message ? it.message : it) : ""
      })
      source = source.join(" ")
    } else {
      source = input.message
    }
  }
  let resMap = {}
  if (source != null) {
    let res = source.match(ticketRegex)
    if (res != null) {
      res.forEach((it) => {
        resMap[it] = ""
      })
    }
  }
  return Object.keys(resMap)
}

async function extractCommits(after, before) {
  if (!after || !before) {
    return []
  }

  let options = {
    from: before,
    to: after
  }
  if (options.from === "0000000000000000000000000000000000000000") {
    return []
  }
  if (options.to === "0000000000000000000000000000000000000000") {
    return []
  }
  try {
    let res = await simpleGit().log(options)
    return res.all
  } catch (e) {
    console.log("error git: ", e)
    return []
  }
}

async function addReleaseVersion(baseUrl, email, token, version, project, tickets) {
  var JiraApi = require('jira-client');
  var jira = new JiraApi({
    protocol: 'https',
    host: baseUrl,
    username: email,
    password: token,
    apiVersion: '2',
    strictSSL: true
  });
  
  try {
    await jira.createVersion({
      "name": version,
      "project": project
    })
  } catch (err) {
    console.log(err)
  }

  for (let ticket of tickets) {
    let issue = await findTicket(jira, ticket)
    if (issue) {
      jira.updateIssue(issue.id, {
        "update": {
          "fixVersions": [
            {
              "add":
                {"name": version}
            }
          ]
        }
      })
    }
  }
}

async function findTicket(jira, ticket) {
  try {
    let issue = await jira.findIssue(ticket)
    return issue
  } catch {
    console.log(`Couldnt find ${ticket}`)
    return null
  }
}

async function transitionTickets(tickets, sourceTransition, targetTransition, message, baseUrl, email, token) {
  var JiraApi = require('jira-client');
  var jira = new JiraApi({
    protocol: 'https',
    host: baseUrl,
    username: email,
    password: token,
    apiVersion: '2',
    strictSSL: true
  });

  let transitioned = []
  for (let ticket of tickets) {
    try {
      let issue = await findTicket(jira, ticket)
      if (issue) {
        if (sourceTransition && sourceTransition.toLowerCase() !== issue.fields.status.name.toLowerCase()) {
          console.log(`${ticket} is not in ${sourceTransition} status (${issue.fields.status.name}), skipping`)
        } else {
          let transitionId = await jira.listTransitions(ticket).then(res => {
            return res.transitions.find((it) => it.name.toLowerCase() === targetTransition.toLowerCase()).id
          })
          if (issue.fields.status.name.toLowerCase() !== targetTransition.toLowerCase()) {
            await jira.transitionIssue(ticket, {transition: transitionId})
            transitioned.push(ticket)
            if (message) {
              await jira.addComment(ticket, message)
            }
          }
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }
  return transitioned
}

async function updateAssignee(baseUrl, email, token, assigneeEmail, tickets) {
  var JiraApi = require('jira-client');
  var jira = new JiraApi({
    protocol: 'https',
    host: baseUrl,
    username: email,
    password: token,
    apiVersion: '2',
    strictSSL: true
  });

  let transitioned = []
  for (let ticket of tickets) {
    try {
      let issue = await findTicket(jira, ticket)
      if (issue) {
        await jira.updateAssignee(ticket, assigneeEmail)
      }
    } catch (error) {
      console.log(error.message)
    }
  }
  return transitioned
}

module.exports = {
  getTickets,
  transitionTickets,
  extractCommits,
  addReleaseVersion,
  updateAssignee
}
