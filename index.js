const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  let pullRequestRef = ""
  if (github.context.payload.pull_request && github.context.payload.pull_request.head && github.context.payload.pull_request.head.ref) {
    pullRequestRef = github.context.payload.pull_request.head.ref
  }
  let before = core.getInput(getOutputString(github.context.payload.ref))
  let after = github.context.payload.after
  console.log("payload: ", github.context.payload)
  let commitTickets = await action.extractCommits(after, before)
  let ticketList = [...commitTickets, pullRequestRef, github.context.payload.ref]
  let tickets = action.getTickets(ticketList)
  const targetTransition = core.getInput("targetTransition")
  const sourceTransition = core.getInput("sourceTransition")
  console.log("commitTickets ", commitTickets.map(it=> it && it.message))
  console.log("tickets: ", tickets, "before: ", before, "after: ", after)

  // action.transitionTickets(
  //   tickets,
  //   sourceTransition,
  //   targetTransition,
  //   core.getInput("message"),
  //   core.getInput("jiraBaseUrl"),
  //   core.getInput("jiraEmail"),
  //   core.getInput("jiraToken")
  // ).then(transitioned => {
  //   console.log(`Tickets ${transitioned.join(", ")} transitioned to ${targetTransition}`)
  // })
  core.setOutput(getOutputString(github.context.payload.ref), after)
}

function getOutputString(ref) {
  ref = ref.replace(/\//g, '_');
  return `buildRef_${ref}`
}

run()