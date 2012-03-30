// MOCK the Facebook API

var sessionFromFacebook = require('../lib/sessionFromFacebook');
sessionFromFacebook._dependencies.getMeFromFB = function(code, cb) {
    console.log('getMeFromFB stubbed');
    assert.equal(code, "stubbed-token")
    var fixtureResponse = {
        name : "Mr. Miyagi",
        id : 123456789
    };
    cb(false, fixtureResponse);
};

// stuff we need for this script

var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux').coux,
    assert = require("assert"),
    docstate = require("docstate"),
    tap = require("tap"), test = tap.test, plan = tap.plan,
    e = require('errLog').e;

// tests should also be capable of testing other implementations
// eg: integration tests

var testConfig = require('./testConfig');


function smallRand() {
    return Math.random().toString().substr(2,4);
}

var handshake_db = testConfig.host + '/' + testConfig.handshake_db;
// setup the database
var server = testConfig.host;

// so nodeunit will run us
exports.awesome = function(test) {
  setTimeout(function() {
    console.log("timeout node tap for grunt");
    test.done()
  },1 * 1000);
};

coux.del(handshake_db, function() {
  var syncpoint = new SyncpointAPI(testConfig);
  syncpoint.start(function(err) {
    console.log("syncpoint started")
    test("should create the handshake db on the server", function(test) {
      console.log("should create the handshake db on the server")
      coux(handshake_db, function(err, info) {
        console.log("handshake db info", info)
        test.ok(err === false)
        test.ok(info.db_name == testConfig.handshake_db)
        test.end()
      });
    });
  })
})

return

var handshakeId, handshakeDoc, userControlDb;



test("and a handshake doc", function(test) {
    console.log("testing handshake");
    var handshakeDoc = {
        oauth_creds : {
          consumer_key: smallRand(),
          consumer_secret: smallRand(),
          token_secret: smallRand(),
          token: smallRand()
        },
       "type": "session-fb",
       "fb_access_token": "stubbed-token",
       "state": "new"
    };
    coux.post(handshake_db, handshakeDoc, function(err, ok) {
        test.ok(err===false)
        console.log("did handshake", ok);
        handshakeId = ok.id;
        test.end()
    })
})

test("when the doc is active", function(test) {
    coux.waitForDoc(handshake_db, handshakeId, 1, function(err, doc) {
        test.ok(err===false)
        test.ok(doc.state=="xactive")
        handshakeDoc = doc
        test.end()
    })
})
test("should update the user doc", function(test) {
    coux([server, testConfig.users_db, handshakeDoc.user_id], e(function(err, user) {
        console.log("user",user.full_name)
        test.ok(user.state==='has-control')
        test.ok(user.oauth.consumer_keys[handshakeDoc.oauth_creds.consumer_key] === handshakeDoc.oauth_creds.consumer_secret);
        test.ok(user.control_database)
        userControlDb = user.control_database;
        test.end()
    }))
})
test("should create the control database", function(test) {
    coux([server, userControlDb], function(err, ok) {
        test.ok(err===false)
        test.end()
    })
})
test("should install the control design doc", function(test) {
    coux([server, userControlDb, "_design/control"], function(err, doc) {
        test.ok(err===false)
        test.ok(doc.views === false)
        test.end()
    })
})
