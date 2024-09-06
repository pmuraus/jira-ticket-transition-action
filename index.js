const action = require("./main")
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  let pullRequestRef = ""
  if (github.context.payload.pull_request && github.context.payload.pull_request.head && github.context.payload.pull_request.head.ref) {
    pullRequestRef = github.context.payload.pull_request.head.ref
  }
  console.log(github.context.payload)
  const branch = github.context.payload.ref.split('/').pop()
  let after = github.context.payload.after
  const workflowName = process.env["GITHUB_WORKFLOW"]
  const token = core.getInput("githubToken")
  const octokit = github.getOctokit(token);
  const repository = process.env.GITHUB_REPOSITORY;
  const [owner, repo] = repository.split("/");

  const workflows = await octokit.rest.actions.listRepoWorkflows({owner, repo});
  console.log("workflows", workflows.data.workflows)
  const jobId = workflows.data.workflows.find(it => it.name === workflowName).path.split('/').pop()
  const response = await octokit.rest.actions.listWorkflowRuns({owner, repo, workflow_id: jobId, per_page: 100});
  let workflow = response.data.workflow_runs
    .filter(it => it.conclusion === "success" && branch === it.head_branch)
    .sort((r1, r2) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime())
    .find(it => it !== undefined)

  let before = workflow && workflow.head_sha

  const output = process.env["GITHUB_OUTPUT"]
  let commitTickets = await action.extractCommits(after, before)
  let ticketList = [...commitTickets, pullRequestRef, github.context.payload.ref]
  let tickets = action.getTickets(ticketList)
  const targetTransition = core.getInput("targetTransition")
  const sourceTransition = core.getInput("sourceTransition")
  console.log("commitTickets ", commitTickets.map(it => it && it.message))
  console.log("tickets: ", tickets, "before: ", before, "after: ", after)
  let assigneeEmail = core.getInput("assigneeEmail")

  console.log('update assignee', assigneeEmail);

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

  let fixVersion = core.getInput("fixVersion")
  let jiraProject = core.getInput("jiraProject")

  if (fixVersion && jiraProject) {
    action.addReleaseVersion(
      core.getInput("jiraBaseUrl"),
      core.getInput("jiraEmail"),
      core.getInput("jiraToken"),
      fixVersion,
      jiraProject,
      tickets
    )
  }

  if (assigneeEmail) {
    action.updateAssignee(
      core.getInput("jiraBaseUrl"),
      core.getInput("jiraEmail"),
      core.getInput("jiraToken"),
      assigneeEmail,
      tickets,
    )
  }

}

run()