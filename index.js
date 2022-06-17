const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

let tickets = action.getTickets(github.context.payload.commits)
const targetTransition = core.getInput("targetTransition")
await action.transitionTickets(
    tickets,
    targetTransition,
    core.getInput("message"),
    core.getInput("jiraBaseUrl"),
    core.getInput("jiraEmail"),
    core.getInput("jiraToken")
)
console.log(`Tickets ${transitioned.join(", ")} transitioned to ${targetTransition}`)