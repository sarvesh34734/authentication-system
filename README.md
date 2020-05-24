# authentication-system
an authentication system using node.js and passport-local

## Problem Statement
click here to view problem statement [here](https://docs.google.com/document/d/1H2rg0H2cBiMAF1MqmRVUeZNZAmGOFnEYAx_4QD9GRQM/edit)

## Prerequisites
  * npm installed
  * MongoDB setup (Start mongo server)
  * redis server setup (start redis server)

## Steps for setting up the app  
  1. Clone the repository.
  2. run npm install to install all dependencies
  3. edit config.env file inside config folder. Set GMAIL_USER_ID as your gmail username and GMAIL_PASSWORD as gmail password 
  4. Run the application using the command "node app.js" or "nodemon app.js"

## Execution steps:
* visit "http://localhost:3000".
* create an account
* a verification mail will be sent to your account
* click the link in your mail to activate
* Now you are all set up.
