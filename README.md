# Papers Game

- In development... Made it work 🚧. Now making it better ✨

## Run the Game locally:

- Install dependencies for server and client

```bash
yarn setup
```

- Start the project: (choose dev or prod)

```bash
## dev mode
yarn dev

## prod mode
yarn prod
```

- Access `localhost:3000` and have fun!

Note: The game should be played on a mobile vertical viewport

## Deploy the Game (on heroku):

- Create react build

```bash
yarn build_client
```

- Send to heroku

```bash
# Creat heroku site
heroku create
# Send stuff to there
git push heroku master
# Open the site deployed
heroku open
```
