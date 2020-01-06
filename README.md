# Papers Game

- In development... Made it work 🚧. Now making it better ✨

## Run the Game locally:

- Install dependencies for server and client

```bash
yarn setup
```

- Start the project: (choose dev or prod)

```bash
# DEV

## Run in a first tab:
yarn dev_server
## Run in a second tab:
yarn dev_client

## Or run them together:
yarn dev

# PROD
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
