# Sandbox Testing Mechanism - Test Specification

This document details test cases for the "Sandbox Testing Mechanism" to ensure its robust operation across various code sources, build/test scenarios, and anti-pattern detections.

## Overview

The Sandbox Testing Mechanism aims to verify the functionality of newly generated code by executing it within an isolated E2B sandbox. This involves fetching code, building/installing dependencies, running tests, executing an "example goal" (a small demonstration), and capturing results and anti-patterns.

## Test Cases

### Test Case 1: Python Git URL - Successful Execution with Explicit Commands & Goal

**Description:**
Verify successful execution of a Python project cloned from a Git repository, with explicitly defined build and test commands, and a clear example goal.

**Inputs:**
- `CODE_SOURCE`: `https://github.com/example/my-python-sdk.git` (assumes a valid Python project with `setup.py` and `pytest` tests)
- `build_command`: `pip install .`
- `test_command`: `pytest -q`
- `example_goal`: `Run a simple CLI function provided by the SDK to list available items.`
- `timeout`: `300000` (5 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "https://github.com/example/my-python-sdk.git",
    "build_command": "pip install .",
    "test_command": "pytest -q",
    "example_goal": "Run a simple CLI function provided by the SDK to list available items.",
    "timeout": 300000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "success",
      "example_goal_execution": "success"
    },
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop, ideally showing the output of the CLI function.
  - `logs/build.log`: Contains successful build output.
  - `logs/test.log`: Contains successful test output.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": []
  }
  ```

### Test Case 2: Node.js Git URL - Successful Execution with Inferred Commands & Goal

**Description:**
Verify successful execution of a Node.js project cloned from a Git repository, where build and test commands are correctly inferred from `package.json`.

**Inputs:**
- `CODE_SOURCE`: `https://github.com/example/my-nodejs-app.git` (assumes a valid Node.js project with `package.json` containing `install` and `test` scripts)
- `build_command`: `""` (inferred as `npm install`)
- `test_command`: `""` (inferred as `npm test`)
- `example_goal`: `Serve the web application, open the browser, and verify the homepage loads correctly showing "Hello World".`
- `timeout`: `300000` (5 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "https://github.com/example/my-nodejs-app.git",
    "build_command": "npm install",
    "test_command": "npm test",
    "example_goal": "Serve the web application, open the browser, and verify the homepage loads correctly showing \"Hello World\".",
    "timeout": 300000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "success",
      "example_goal_execution": "success"
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop showing the web application's homepage in a browser.
  - `logs/build.log`: Contains successful `npm install` output.
  - `logs/test.log`: Contains successful `npm test` output.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": []
  }
  ```

### Test Case 3: Local Python Directory - Successful Execution with Inferred Commands, No Explicit Example Goal

**Description:**
Verify handling of a local Python project directory, with inferred build/test commands, and `no_example_goal` anti-pattern detection when no explicit goal is provided.

**Inputs:**
- `CODE_SOURCE`: `./local-projects/simple-python-lib` (assumes a local directory with `setup.py` and `pytest` tests, no README with a quickstart)
- `build_command`: `""` (inferred as `pip install .`)
- `test_command`: `""` (inferred as `pytest -q`)
- `example_goal`: `""`
- `timeout`: `300000` (5 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "./local-projects/simple-python-lib",
    "build_command": "pip install .",
    "test_command": "pytest -q",
    "example_goal": "",
    "timeout": 300000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "success",
      "example_goal_execution": "skipped" // or "partially_executed" if a generic command is run
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop after build/test, may not show specific application output due to no example goal.
  - `logs/build.log`: Contains successful build output.
  - `logs/test.log`: Contains successful test output.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": ["no_example_goal"]
  }
  ```

### Test Case 4: Inline Code Snippet - Successful Python with Explicit Commands, No Tests

**Description:**
Verify handling of an inline Python code snippet, executed successfully, and detecting `missing_tests` anti-pattern.

**Inputs:**
- `CODE_SOURCE`:
  ```python
  # main.py
  def greet(name="World"):
      print(f"Hello, {name}!")

  if __name__ == "__main__":
      greet("Sandbox")
  ```
- `build_command`: `""` (No build steps needed for a simple script without dependencies)
- `test_command`: `""` (No explicit tests provided or inferred)
- `example_goal`: `Execute the 'main.py' script and capture its output.`
- `timeout`: `120000` (2 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "# main.py\ndef greet(name=\"World\"):\n    print(f\"Hello, {name}!\")\n\nif __name__ == \"__main__\":\n    greet(\"Sandbox\")\n",
    "build_command": "",
    "test_command": "",
    "example_goal": "Execute the 'main.py' script and capture its output.",
    "timeout": 120000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "skipped",
      "example_goal_execution": "success"
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop showing the terminal output `Hello, Sandbox!`.
  - `logs/build.log`: Empty or minimal log indicating no build needed.
  - `logs/test.log`: Empty or minimal log indicating no tests were run.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": ["missing_tests"]
  }
  ```

### Test Case 5: Anti-Pattern: Build Failure (Node.js Git URL)

**Description:**
Verify detection of `build_failed` anti-pattern when a Node.js project fails to build or install dependencies.

**Inputs:**
- `CODE_SOURCE`: `https://github.com/example/broken-nodejs-app.git` (assumes a Node.js project where `npm install` will fail, e.g., due to malformed `package.json` or unresolvable dependencies)
- `build_command`: `npm install`
- `test_command`: `npm test`
- `example_goal`: `Attempt to serve the web application.`
- `timeout`: `300000` (5 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "https://github.com/example/broken-nodejs-app.git",
    "build_command": "npm install",
    "test_command": "npm test",
    "example_goal": "Attempt to serve the web application.",
    "timeout": 300000,
    "phase": 7,
    "results": {
      "build": "failed",
      "tests": "skipped", // Tests should not be attempted if build fails
      "example_goal_execution": "skipped"
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop showing the terminal with `npm install` errors.
  - `logs/build.log`: Contains detailed `npm install` error output.
  - `logs/test.log`: Empty or indicates tests were skipped.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": ["build_failed", "tests_skipped_due_to_build_failure", "example_goal_skipped_due_to_build_failure"]
  }
  ```

### Test Case 6: Anti-Pattern: Test Failure (Python Git URL)

**Description:**
Verify detection of `tests_failed` anti-pattern when a Python project's tests fail despite a successful build.

**Inputs:**
- `CODE_SOURCE`: `https://github.com/example/failing-python-lib.git` (assumes a Python project where `pip install` succeeds but `pytest` returns failures)
- `build_command`: `pip install .`
- `test_command`: `pytest -q`
- `example_goal`: `Run a basic function from the library.`
- `timeout`: `300000` (5 minutes)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "https://github.com/example/failing-python-lib.git",
    "build_command": "pip install .",
    "test_command": "pytest -q",
    "example_goal": "Run a basic function from the library.",
    "timeout": 300000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "failed",
      "example_goal_execution": "success"
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: Screenshot of the sandbox desktop showing the terminal with `pytest` failures.
  - `logs/build.log`: Contains successful `pip install` output.
  - `logs/test.log`: Contains detailed `pytest` failure output.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": ["tests_failed"]
  }
  ```

### Test Case 7: Anti-Pattern: Timeout Exceeded (Long Running Task)

**Description:**
Verify that the sandbox is cleaned up and the process terminates with a timeout anti-pattern if the execution exceeds the specified `timeout`.

**Inputs:**
- `CODE_SOURCE`: `https://github.com/example/long-running-script.git` (assumes a project containing a script designed to run longer than the timeout, e.g., `while true; do echo "running..."; sleep 1; done`)
- `build_command`: `""`
- `test_command`: `""`
- `example_goal`: `Execute the long-running script.`
- `timeout`: `10000` (10 seconds - intentionally short for testing timeout)

**Expected Outcomes:**
- **`state.json` Status:**
  ```json
  {
    "code_source": "https://github.com/example/long-running-script.git",
    "build_command": "",
    "test_command": "",
    "example_goal": "Execute the long-running script.",
    "timeout": 10000,
    "phase": 7,
    "results": {
      "build": "success",
      "tests": "skipped",
      "example_goal_execution": "failed_due_to_timeout"
    },
    // ...
  }
  ```
- **Artifacts:**
  - `artifacts/final.png`: May show the terminal mid-execution, or a system message about timeout.
  - `logs/build.log`: Logs pertaining to any initial setup.
  - `logs/example_goal.log`: Logs showing partial execution until timeout.
- **`anti_patterns.json` Content:**
  ```json
  {
    "anti_patterns": ["timeout_exceeded"]
  }