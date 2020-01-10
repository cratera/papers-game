Here's a list of my learnings while building this website.

# NPM

## 🐛 `concurrently` + proxys + `socket.io`

Do you know when you spend 3 hours with a issue and the answer is one line of code? 😭How that happened:

- ✅ Started with a [boilerplate Create React App + Express](https://www.youtube.com/watch?v=v0t42xBIYIs).
- ❌ Added Socket.io to the project. Always got this error:
  > Proxy error: Could not proxy request /socket.io/?EIO=3&transport=polling&t=MyUP1_K from localhost:3000 to http://localhost:5000.
  > [1] See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (ECONNRESET).
- ⏳🔍 Spent hours looking for answeres and trying other boilerplates. Didn't find an answer. The boilerplates were too heavy or didn't work properly neither.
- 💪 Decided to do it by myself from scratch. Install create-react-app, add express and... add socket.io. The error didn't happen! 😱 Why?
- 🐛 A small different. The boilerplate was using `concurrently` to run the two servers (react and express) at the same time. That's the cause of the error!
- 💡 Solution: Start the two servers in two different terminals. `yarn server` and `yarn client` without using `concurrently`.
- [Update] that wasnt the problem. the problem was `url` when calling `io(url)`. [issue](https://github.com/socketio/socket.io/issues/1942#issuecomment-71443823)

# Node / Express / WebSockets

- Did my first REST API (HTTP GET/POST) with params using Express + fetch - from scratch.
- Hmm... not sure if HTTP is better than WebSockets in this case. Moving to WebSockets.
- Ngrok: Can't use it for alpha test. It has a limit of 20 connections per minute. I'll try Heroku.
- WOW socket [emit-cheatsheet](https://socket.io/docs/emit-cheatsheet/)
- Deployment status: Trying to figure it out.
  - Heroku try: [stackoverflow question](https://stackoverflow.com/questions/59455178/heroku-websockets-connected-clients-is-empty-and-cant-reuse-stored-values)
  - Zeit Now - Need to [try this](https://zeit.co/guides/deploying-pusher-channels-with-zeit-now)

# React

- Working on React for 3 years now, this is the first time where I can use **hooks** for real. It's not being a very easy learning curve with `useEffect`, I confess. But I'll get there.
