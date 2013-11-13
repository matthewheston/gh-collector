var GitHubApi = require("github");
var mysql = require("mysql");
var winston = require("winston");
var teddybear = require("teddybear");
var argv = require("optimist").argv;
var config = require("./config");

var github;
var connection;

initGithub();
initDb();

switch (argv._[0]) {
  case "pull_requests":
    if (!argv.owner || !argv.repo) {
      winston.error("owner and repo flags necessary for retrieving pull requests.");
      process.exit(1);
    }
    getPullRequests();
    break;
  default:
    winston.error("Command not recognized.")
      process.exit(1);
}

function getPullRequests() {
  if (argv.verbose) { winston.log("Enter getPullRequests."); }
  github.pullRequests.getAll( {
    "user": argv.owner,
    "repo": argv.repo,
    "state": "closed",
    "per_page": 100
  },function(e, data) {
    checkLimit(data);
    if (e) { winston.error(e); }
    insertPullRequest(data);
    if (data && data.meta && data.meta.link) {
      getMore(data.meta.link);
    } else {
      // we have no more paging to do, so get comments if we're instructed to
      if (argv.comments) {
        getPullRequestComments();
      }
    }
  });

  function getMore(link) {
    if (argv.verbose) { winston.log("Enter getMore."); }
    if (github.hasNextPage(link)) {
      github.getNextPage(link, function(e, data) {
        checkLimit(data);
        if (e) { winston.error(e); }
        if (data && data.meta && data.meta.link) {
          insertPullRequest(data);
          getMore(data.meta.link);
        } else {
          // we have no more paging to do, so get comments if we're instructed to
          if (argv.comments) {
            getPullRequestComments();
          } else {
            process.exit();
          }
        }
      });
    } else {
      if (argv.comments) {
        getPullRequestComments();
      } else {
        process.exit();
      }
    }
  }
  function insertPullRequest(data) {
    if (argv.verbose) { winston.log("Enter insertPullRequest."); }
    var records = data.map(function(e) {
      return [ e.base.repo.id,
      e.number,
      e.base.repo.owner.login,
      e.base.repo.name,
      e.user ? e.user.id : null,
      e.user ? e.user.login : null,
      e.merged_at == null ? null : new Date(e.merged_at),
      new Date(e.created_at),
      e.body,
      ]
    });
    if (argv.verbose) { winston.log(JSON.stringify(records)); }
    query = connection.query("INSERT INTO pull_requests (repo_id, number, repo_owner, repo_name, submitted_by_id, submitted_by_name, merged_at, submitted_on, body) VALUES ?",
        [records], function(e, result) {
          if (e) { winston.error(e); }
        });
  }
}

function getPullRequestComments() {
  if (argv.verbose) { winston.log("Enter getComments."); }
  var query = connection.query("SELECT id, number FROM pull_requests WHERE repo_owner='" + argv.owner + "' AND repo_name ='" + argv.repo + "'");
  query
    .on("error", function(err) {
      winston.error(err);
    })
  .on("result", function(row) {

    github.issues.getComments( {
      "user": argv.owner,
      "repo": argv.repo,
      "number": row.number,
      "per_page": 100
    },function(e, data) {
      checkLimit(data);
      if (e) { winston.error(e); }
      insertComments(data, row.number, row.id);
      winston.log(JSON.stringify(data));
      if (data && data.meta && data.meta.link) {
        getMore(data.meta.link, row.number, row.id);
      }
    });
  });


function getMore(link, number, id) {
  if (argv.verbose) { winston.log("Enter getMore."); }
  if (github.hasNextPage(link)) {
    github.getNextPage(link, function(e, data) {
      checkLimit(data);
      if (e) { winston.error(e); }
      insertComments(data, number, id);
      if (data && data.meta && data.meta.link) {
        getMore(data.meta.link);
      }
    });
  } else {
    process.exit();
  }
}

function insertComments(data, number, id) {
  if (argv.verbose) { winston.log("Enter insertComments."); }
  var records = data.map(function(e) {
    return [ new Date(e.created_at),
    e.user ? e.user.id : null,
    e.user ? e.user.login : null,
    e.body,
    number,
    id
    ]
  });
  if (argv.verbose) { winston.log(JSON.stringify(records)); }
  if (records.length) {
    query = connection.query("INSERT INTO pr_comments (created_at, user_id, user_login, body, number, pr_id) VALUES ?",
        [records], function(e, result) {
          if (e) {
            winston.error(e);
            winston.error(query.sql);
          }
        });
  }
}
}

function checkLimit(data) {
  if (data && data.meta && data.meta["x-ratelimit-remaining"]) {
    if (data.meta["x-ratelimit-remaining"] < 100) {
      winston.log("Limit reached. Timing out.");
      teddybear(1800000);
      initGithub();
    }
  }
}

function initDb() {
  connection = mysql.createConnection({
    host: config.mysql_host,
    user: config.mysql_username,
    password: config.mysql_password,
    database: config.mysql_db
  });
  connection.connect();
}


function initGithub() {
  github = new GitHubApi({
    version: "3.0.0"
  });
  github.authenticate({
    type: "basic",
    username: config.github_username,
    password: config.github_password
  });
}
