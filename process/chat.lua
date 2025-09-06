ChatLog = ChatLog or {}

Handlers.add('chat', Handlers.utils.hasMatchingTag('Action', 'Chat'), function(msg)
    local new_count = #ChatLog + 1
    ChatLog[new_count] = {
        sender = msg.From,
        message = msg.Data
    }
    Send({
        Target = msg.From,
        Tags = {
            Reference = msg.Id,
            Action = "Result",
            Result = "Success",
            Count = new_count
        }
    })
end)

Handlers.add('log', Handlers.utils.hasMatchingTag('Action', 'Log'), function(msg)
    local json = require('json')
    Send({
        Target = msg.From,
        Tags = {
            Reference = msg.Id,
            Action = "Result",
            Result = "Success",
            Count = #ChatLog
        },
        Data = json.encode(ChatLog)
    })
end)
