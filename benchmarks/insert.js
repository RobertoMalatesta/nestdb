// Userland modules
var async = require('async')
  , execTime = require('exec-time')

// Local modules
  , commonUtilities = require('./commonUtilities')


// Local variables
  , benchDb = 'workspace/insert.bench.db'
  , profiler = new execTime('INSERT BENCH')
  , config = commonUtilities.getConfiguration(benchDb)
  , d = config.d
  , n = config.n
  ;


async.waterfall([
  async.apply(commonUtilities.prepareDb, benchDb)
, function (cb) {
    d.loadDatabase(function (err) {
      if (err) { return cb(err); }
      if (config.program.withIndex) {
        d.ensureIndex({ fieldName: 'docNumber' });
        n = 2 * n;   // We will actually insert twice as many documents
                     // because the index is slower when the collection is already
                     // big. So the result given by the algorithm will be a bit worse than
                     // actual performance
      }
      cb();
    });
  }
, function (cb) { profiler.beginProfiling(); return cb(); }
, async.apply(commonUtilities.insertDocs, d, n, profiler)
], function (err) {
  profiler.step("Benchmark finished");

  if (err) { return console.log("An error was encountered: ", err); }
});
