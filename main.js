function getTickets(input) {
    const ticketRegex = /([a-zA-Z][a-zA-Z0-9_]+-[1-9][0-9]*)/g
    let source = ""
    if (input instanceof Array) {
        source = input.map((it) => {
            return it.message
        })
        source = source.join(" ")
    } else {
        source = input.message
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

async function transitionTickets(tickets, targetTransition, message, baseUrl, email, token) {
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
    for (ticket of tickets) {
        try {
            let issue = await jira.findIssue(ticket)
            let transitionId = await jira.listTransitions(ticket).then(res => {
                return res.transitions.find((it) => it.name === targetTransition).id
            })
            if (issue.fields.status.name.toLowerCase() !== targetTransition.toLowerCase()) {
                await jira.transitionIssue(ticket, { transition: transitionId })
                transitioned.push(ticket)
                if (message != null) {
                    await jira.addComment(ticket, message)
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    return transitioned
}

module.exports = {
    getTickets,
    transitionTickets
}