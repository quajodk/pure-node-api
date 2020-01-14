/**
 * Test Runner for testing the API
 */

// App for test runner
const _app = {};

// test object
_app.tests = {};

_app.tests.unit = require('./unit.test');

// count the test
_app.countTests = () => {
  let counter = 0;
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      let subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

// produce test result
_app.produceResult = (limit, successes, errors) => {
  console.log('');
  console.log('====== BEGIN TEST REPORT =======');
  console.log('');
  console.log('Total test: ', limit);
  console.log('Pass: ', successes);
  console.log('Fail: ', errors.length);
  console.log('');

  // print errors in details
  if (errors.length > 0) {
    console.log('====== BEGIN ERROR DETAILS =======');
    console.log('');

    errors.forEach(testError => {
      console.log('\x1b[32m%s\x1b[0m', testError.name);
    });

    console.log('');
    console.log('====== END ERROR DETAILS =======');
  }

  console.log('====== END TEST REPORT =======');
};

// app test runner
_app.runTest = () => {
  const errors = [];
  let successes = 0;
  const limit = _app.countTests();
  let counter = 0;
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (() => {
            const tmpTestName = testName;
            const testValue = subTests[testName];
            // call the test
            try {
              testValue(() => {
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceResult(limit, successes, errors);
                }
              });
            } catch (e) {
              errors.push({
                name: testName,
                error: e
              });
              console.log('\x1b[31m%s\x1b[0m', tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceResult(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

_app.runTest();

// export
module.exports = _app;
