const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');


console.log(github.context)
let commits = []
if (github.context.payload.commits) {
    commits = github.context.payload.commits
}
let pullRequestRef = ""
if (github.context.payload.pull_request && github.context.payload.pull_request.head && github.context.payload.pull_request.head.ref) {
    pullRequestRef = github.context.payload.pull_request.head.ref
}
let tickets = action.getTickets([...commits, pullRequestRef], github.context.payload.ref)
console.log(`Payload ${JSON.stringify(github.context.payload.pull_request.head)}`)
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
