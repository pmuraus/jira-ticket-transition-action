const action = require("../main")

let tickets = action.getTickets(require("./input.json"))

action.transitionTickets(["PM-1"], "In Progress", "Pero started working on this issue", "peromed.atlassian.net", "peromed@gmail.com", "123")