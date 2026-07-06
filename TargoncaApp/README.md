# TargoncaApp

This project is set up to run in Expo Go.

## One-time setup

Install the missing packages:

```bash
npm install
```

## Run the app locally

Start Metro for Expo Go on your local network:

```bash
npm run start
```

Then scan the QR code with the Expo Go app on your device.

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

- `app.json` uses the scheme `targoncaapp`.
- The server can still be started with:

```bash
npm run server
```
