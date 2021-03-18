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
