const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

let tickets = action.getTickets(github.context.payload.commits, github.context.payload.ref)
const targetTransition = core.getInput("targetTransition")
action.transitionTickets(
    tickets,
    targetTransition,
    core.getInput("message"),
    core.getInput("jiraBaseUrl"),
    core.getInput("jiraEmail"),
    core.getInput("jiraToken")
).then(transitioned => {
    console.log(`Tickets ${transitioned.join(", ")} transitioned to ${targetTransition}`)
})