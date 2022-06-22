const action = require("../main")

let tickets = action.getTickets(require("./input.json"))

action.transitionTickets(["PM-2"], "Ready for QA", "Pero started working on this issue", "peromed.atlassian.net", "peromed@gmail.com", "123")