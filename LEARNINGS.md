Here's a list of my learnings while building this website.

# NPM
## 🐛 `concurrently` + proxys + `socket.io`
Do you know when you spend 3 hours with a issue and the answer is one line of code? 😭How that happened:
- ✅ Started with a [boilerplate Create React App + Express](https://www.youtube.com/watch?v=v0t42xBIYIs).
- ❌ Added Socket.io to the project. Always got this error:
> Proxy error: Could not proxy request /socket.io/?EIO=3&transport=polling&t=MyUP1_K from localhost:3000 to http://localhost:5000.
[1] See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (ECONNRESET).
- ⏳🔍 Spent hours looking for answeres and trying other boilerplates. Didn't find an answer. The boilerplates were too heavy or didn't work properly neither.
- 💪 Decided to do it by myself from scratch. Install create-react-app, add express and... add socket.io. The error didn't happen! 😱 Why?
- 🐛 A small different. The boilerplate was using `concurrently` to run the two servers (react and express) at the same time. That's the cause of the error!
- 💡 Solution: Start the two servers in two different terminals. `yarn server` and `yarn client` without using `concurrently`.

# Node / Express / WebSockets

