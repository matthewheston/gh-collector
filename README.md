# gh-collector #
## A tool for collecting GitHub data ##

### Overview ###

gh-collector is a tool for collecting GitHub data and storing it in a MySQL
database. While numerous libraries for interacting with the GitHub API already
exist, the purpose of gh-collector is to provide a command line application
that provides some convenient abstractions for certain data retrieval tasks,
the biggest of which is abstracting the paging necessary to retrieve large
amounts of GitHub data.

### Usage ###

You will run gh-collector with a command, which identifies what type of GitHub
data you are retrieving. These commands will require certain flags to be passed
to retrieve data. Other optional flags are provided for added functionality.
For example:

    gh-collector pull_requests --owner=rails --repo=rails --comments --verbose

will collect pull_requests for the GitHub repository located at rails/rails. The
owner and repo flags are necessary to complete thise call. The include-comments
flag indicates that you also want to retrieve comments on those pull requests.
The verbose flag enables verbose logging.

### Configuration ###

You will need to supply a config.js file in the same directory as gh-collector.
This file is used to store authentication and other information for the GitHub
API as well as your MySQL database. An example file looks like:

    config = {
      mysql_host : "localhost",
      mysql_db : "ghdata",
      mysql_username : "dbuser",
      mysql_password : "secret",
      github_username : "octocat",
      github_password : "secret"
    }

    module.exports = config;

It is important that you have a config object defined with the field names
exactly as they appear here. Note that this is simply a JavaScript object,
and it does not need to be formatted as JSON.

### SQL Setup ###
The db folder contains scripts to set up the necessary tables  to store
retrieved data. These scripts are split up, so if you don't plan on using
all tables, you can run only those necessary to create the tables you need.

### Supported Commands ###
- pull_requests
  - Required flags:
    - owner
    - repo
  - Option flags:
    - comments
