const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

let commits = []
if (github.context.payload.commits) {
    commits = github.context.payload.commits
}
let pullRequestRef = ""
if (github.context.payload.pull_request && github.context.payload.pull_request.head && github.context.payload.pull_request.head.ref) {
    pullRequestRef = github.context.payload.pull_request.head.ref
}
let ticketList = [...commits, pullRequestRef, github.context.payload.ref]
console.log(JSON.stringify(ticketList))