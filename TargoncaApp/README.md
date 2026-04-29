# TargoncaApp

This project is set up to use an Expo development build instead of Expo Go.

## One-time setup

Install the missing packages:

```bash
npm install
```

If `expo-dev-client` is not installed automatically, add it with:

```bash
npx expo install expo-dev-client
```

## Create a development build

Build the Android dev client:

```bash
npm run build:android:dev
```

If you want iOS, use:

```bash
npm run build:ios:dev
```

## Run the app locally

Start Metro in dev-client mode:

```bash
npm run start:dev
```

Then open the installed development build on your device and connect to the running bundler.

## Server environment variables

The backend reads its database connection settings from a root `.env` file:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

`PORT` still controls the Express server port and defaults to `3004`.

Create the file in the project root, then start the server normally with `npm run server`.

Example `.env` contents:

```powershell
PORT=3004
DB_HOST=192.168.50.81
DB_USER=knz
DB_PASSWORD=your-password
DB_NAME=hagyma_voros
DB_PORT=3307
```

## Notes

- `app.json` now uses the scheme `targoncaapp` for the dev build.
- `eas.json` includes a `development` profile with `developmentClient: true`.
- The server can still be started with:

```bash
npm run server
```
