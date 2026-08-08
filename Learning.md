- Write always down, what is not in your scope yet
- Don't write somehting in the ReadMe what doesn't work now. 
- TDD tests behavior - anything that can be wrong, so I have to ask 'is there behavior here that could break, and would a test catch a real bug?'
    - so when you have required fields, enum on roles, defaults, formats, unique, pre-save hooks -> that's all behavior.


# Jest
- Jest is two things:
    - test runner:
        - it finds my test files, executes them, and prints a pass/fail report
    - assertion library:
        - it gives you expect(...) to declare "this value should be X"
- Why we do that:
    - so when you have a check like /health, you have to do it every time manually, that means open browser and check it, every time. 
    - A test automates that check
    - so I add the e.g. a User model and accidentally break /health, the test screams immediately.
    - That's called cathcing a **regression**

# Supertest
- What: 
    - a tool that sends **fake HTTP request to my Express app in memory** and hand me the response to inspect
- Why:
    - normally an Express app only answers requests when it's listening on a port (that's what bin/www does - app.listen(3000)).
    - To test an endpoint I'd have to start the real server, then curl it, then shut it down.
    - Supertest does all that invisibly:
        - it boots my app on a temporary throwaway port, fires the request, collects the response, cleans up.
        - No port conlflicts, no manual server, and I can **assert on the response in code**.
- How it connects:
    - this is exactly why my app.js ends with **module.exports = app** and does not call app.listen. 
    - The app and the "start listening" step are separate on purpose:
        - bin/www starts it for real, and Supertest starts it for tests. Same app, two drivers.

# '-D' - dependencies vs devDependencies
- What:
    - 'npm i -D jest supertest' install in this example jest and supertest into the 'devDependencies' section of 'package.json' ('-D = --save-dev')

- Why the split matters:
    - 'package.json' distinguishes:
        - 'dependencies':
            - things the app needs to run in production (express, mongoose)
        - 'devDependencies':
            - things needed only to build/test (jest, supertest, nodemon)

Tests never run on the production server, so their tools don't belong in the production install. Keeping them separate makes your production deploy smaller and reduces its attack surface. It's a "right tool in the right drawer" thing. 

# "test": "jest" - npm scripts
- What:
    - the "scripts" block in 'package.json' is a list of **named shortcuts** for terminal commands. "test": "jest" means when someone runs 'npm test', execute 'jest'. The same is with dev or start etc. 
- Why:
    - two reasons:
        - Convention: every node dev knows 'npm test' runs the tests and 'npm start' runt the app, regardless of the tools underneath.
        - Local binaries: 'jest' isn't installed globally on the machine; it lives in 'node_modules/.bin'. npm scripts automatically look there, so 'npm test' finds it even though typing 'jest' directly in your terminal wouldn't. ('test' and 'start' are special-cased so you can skip the word 'run'; for others it's 'npm run <name>.')

# 'res.json(...)' vs 'res.send('OK')'
- Your current '/health' does 'res.status(200).send('OK'); that sends the **plain text** "OK". Compare:

|       | 'res.send('OK')' | 'res.json({ status: 'ok' })'    |
| :---- | :--------------  | :---------------------------    |
| Sends | the text 'OK'    | the JSON string {"status":"ok"} |
| Content-Type header | 'text/html' | 'application/json'     |
| Supertest's 'res.body' | '{}' (nothing to parse) | '{ status: 'ok'}' (a real object) |

- Why it matters for the test:
    - Supertest only fills 'res.body' with a parsed object when the response is JSON. If '/health' sends text, 'res.body' is empty and your 'toEqual({status:'ok'})' fails. Beyond the test: an API should speak **one language - JSON - everywhere**, so its clients (my gea frontend, the agent) always know how to read it. Mixing text and JSON is inconsistent.

# The test file, line by line
<em>
const request = require('supertest') // (a)
const app = require('../src/app') // (b)

test('GET /health returns 200 { status: "ok" }', async () => { //(c)
    const res = await request(app).get('/health')           // (d)
    expect(res.status).toBe(200)                            // (e)
    expect(res.body).toEqual({ status: 'ok' })              // (f)
})

* (a) import Supertest (the request-faker)
* (b) import your app - note: the app object, which isn't listening. Supertest will drive it.
* (c) 'test(name, fn)' defines one test. The string is a human-readable description printed in the report. 'async' because an HTTP request is asynchronous (it return a promise - a value that arrives later).
* (d) 'request(app).get('/health')' tells Supertest: "using my app, send a GET to '/health'." 'await' pauses until the response comes back and stores it in 'res'
* (e) first assertion: the status code must be exactly '200'.
* (f) second assertion: the parsed body must match ' { status: ok }'

As in Coyotiv learned, it can be also used it/describe, it is just an alias for 'test'. 'Describe' groups the 'it's, so that means when you test all with user, like create, update, get or delete etc. you can group it with describe.

# 'toBe' vs 'toEqual' - a real gotcha
- 'toBe' = strict '===' (identity). Perfect for primitives like 200 === 200. But for object it checks whether it's the same object in memory - so two different objects with identical contents are not 'toBe'
- 'toEqual' = deep quality - it walks into the object and compares contents recursively.

That's why status (a number) uses 'toBe', but body (an object) uses 'toEqual'. If you wrote 'expect(res.body).toBe({status:'ok'})', it would fail even when the contents match, because it's a different objects instance. This bites everyone once.

# Why 'tests/' and the '.test.js' name
Jest **auto-discovers** files that match '*.test.js' (or live in a '_tests_/' folder). You don't list your tests anywhere - jest scans for that naming pattern. So the filename ending in '.test.js' is what makes jest pick it up. Location is flexible ('tests/', or next to the source); the '.test.js' suffix is the important part.

# The rhythm: red -> greend -> refactor
This is the heartbeat of TDD:
1. **Red** - write the test first; it fails, because the behavior isn't there yet (e.g. '/health' still returns text, so 'toEqual' fails).
2. **Green** - change the code (switch 'res.json') until the test passes
3. **Refactor** - clean up the code, confident the test will catch any mistake.

The point isn't the test itself - it's that the test defines what "correct" means before you write the code, so you're never guessing whether it works.

# axios vs. supertest - different jobs
|       | supertest | axios |
| :---  | :-------  | :---- |
| Purpose | test your Express app | makre real HTTP requests to a running server|
| How | imports your 'app' and drives it in-memory (no port, no network) | sends actual requests over the network |
| Where it belongs | your backend tests ('health.test.js') | your fontend (gea) and the agent, calling your API |

Why supertest for /health, not axios:
- axios would need a server actually running on a port during the test - real network, slower, flaky, port conlficts. Supertest sidestept all that: it start the app on a throwaway port invisibly and talks to it directly. That's why it's the tool for testing the own endpoints. 

# validateSync() assertions

const User = require('../models/user')   // doesn't exist yet → tests will be red. Good.

describe('User model', () => {
  it('accepts a valid user', () => {
    const user = new User({ name: 'Ali', username: 'ali', email: 'ali@x.com', role: 'employee' })
    expect(user.validateSync()).toBeUndefined()   // undefined = no errors = valid
  })

  it('requires a name', () => {
    const user = new User({ username: 'ali', email: 'ali@x.com', role: 'employee' })
    const err = user.validateSync()               // returns a ValidationError object
    expect(err.errors.name).toBeDefined()         // .errors is keyed by field
  })
})


- it returns 'undefined' when the document is valid, or a 'ValidationError' when not. That error has an '.errors' object keyed by fieldn name - so err.errors.name existing means "name failed validation"

# What should be tested
- Ask always the question '**Can I have a bug, in the code that I write?**' 
- That means, when you use e.g. mongoose and test create, then you'll test a library and not what you write yourself, so don't test that, prefer tests that could be have a bug, because you'll write it and not a library.

