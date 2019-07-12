# Xompass PI WEBAPI Interface

## Installation
* **Install Node.js v6.9+ [Here](https://nodejs.org/en/)**
* **Clone the repository in your favorite directory**
* ``git clone https://github.com/xompass/xompass-pi-webapi-browser.git``
* ``cd xompass-pi-webapi-browser``
* ``npm install``
* ``npm start``

## Features
* Connect to a PI System with the WebAPI
* Navigate Through the Element Hierarchy
* Subscribe to realtime data (only on servers that support it)
* Websockets in frontend

## Usage
Web view (default port 7400) allows the following

### Settings:
* General Settings for PI System Access.  Requires to Save Settings and reload Service.

### PI Elements:
* Allows navigation and data subscription. Rememeber to click on Save Settings to avoid reloading everything everytime you enter the page.


## Structure
* **config_files/**  folder stores all the setting files (this should use a database for production)
* **routes/**  folder contains the routes files for the website
* **modules/**  folder contains all modules used. One module for each PI object handling (elements, templates, tags, databases, etc)
* **modules/interface.js**  module implements the PI WebAPI main calls reading and prepares all the objects (maps) to allow the Hierarchy Reading

## WebAPI Requirements
WebAPI must have Basic Authenticaiton Enabled

## TODO
* Since this is a cut-off from another project requires the following
* Implement JWT authroization
* Cleaning of interface.js module and better encapsulation (create more modules maybe needed)
* Cleaning of comments
* Removing unused variables
* Cleaning in general
* Add authentication, ideally with Azure Active Directory
* Bring important logs to the frontend (replace console.logs on backend by wsockets.log to send the logs to the webpage and improve debugging)
