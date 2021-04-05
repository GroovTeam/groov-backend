# backend
> The backend for ThePoopCrew's music social media.

## Installation

Clone the repo

```sh
git clone https://github.com/ThePoopCrew/backend.git
```

Install the Firebase CLI with npm

```sh
npm install -g firebase-tools
```

Change directory and install dependencies
```sh
cd backend
npm install --prefix ./functions
```

## Usage example

In /functions/util/admin.js uncomment the following on line 6 to use the authentication emulator
```js
// firebase.auth().useEmulator('http://localhost:9099');
```

Rename /functions/dummy-config.js to just config.js to use emulator

Start the emulator

```sh
firebase emulators:start
```

Make API calls to indicated http function URL: ```http://localhost:5001/<projectID>/<region>/api```

Available routes:
```sh
/auth/register/
/auth/login/
```
Required registration fields:
```
- email
- username
- password
- firstName
- lastName
```

Required login fields:
```
- email
- password
```

NOTE: Firestore resets upon new emulator instance

## Further documentation
Documentation on all endpoints can be found on [SwaggerHub](https://app.swaggerhub.com/apis-docs/The-Poop-Crew/Poop-Crew-API/1.0.0#/)
