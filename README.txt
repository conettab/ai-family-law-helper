This repository is split into two parts. Frontend and backend.

Frontend:
  - cd into the frontend file from the root of the repository
  - run the website server for development with "npm run dev"
  - This will host the website on localhost:3000
  - When opening the website and accessing the backend through the hosted API, allow the API to start up for a while, as since I have used the free tier,
    it starts up as soon as someone makes a request. After it has loaded the conversation list, it is good to go.
Backend:
  - cd into the backend file from the root of the repository.
  - fill out your .env file to run the backend. An example is supplied inside the app directory.
  - run "pip install -r requirements.txt" to download all the required packages to run the backend API
  - run "fastapi run app/main.py" to run the backend API on your local machine.
  - This api is hosted on localhost:8000