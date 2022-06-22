const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

let tickets = action.getTickets(github.context.payload.commits, github.context.payload.ref)
console.log(`Payload ${github.context.payload.commits}`)
console.log(`Found tickets ${JSON.stringify(tickets, null, 2)}`)
const targetTransition = core.getInput("targetTransition")
const sourceTransition = core.getInput("sourceTransition")
action.transitionTickets(
    tickets,
    sourceTransition,
    targetTransition,
    core.getInput("message"),
    core.getInput("jiraBaseUrl"),
    core.getInput("jiraEmail"),
    core.getInput("jiraToken")
).then(transitioned => {
    console.log(`Tickets ${transitioned.join(", ")} transitioned to ${targetTransition}`)
})
