# BUG 01: Login Authentication Bypass for Temporary Accounts

## Bug Title
Incorrect Password Accepted for Accounts with Temporary Password Flag Active

## Location
- `src/main/java/com/sms/service/AuthService.java` (`login` method)

## How to Reproduce
1. Start backend and frontend.
2. Navigate to the login page (`http://localhost:5173/login`).
3. Enter username: `teacher`
4. Enter any arbitrary incorrect password (e.g. `WrongPass!`, `123`, `randomstring`).
5. Click **Sign In**.
6. Notice that the login succeeds, JWT token is issued, and you are redirected to the Dashboard with Teacher privileges.
7. Attempt the same test with username `admin` and an incorrect password. Notice `admin` correctly fails.

## Expected Behavior
Any incorrect password for any user account must be rejected with HTTP 401 Unauthorized and an error message `"Invalid username or password"`.

## Actual Behavior
Users whose account has `isTemporaryPassword = true` (e.g. `teacher`) can authenticate using ANY non-empty password.

## Root Cause
In `AuthService.java`, lines 31-38:
```java
boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

if (!matches) {
    // Check temporary password policy for newly provisioned staff accounts
    if (!user.isTemporaryPassword() || request.getPassword().isEmpty()) {
        throw new BadCredentialsException("Invalid username or password");
    }
}
```
When `user.isTemporaryPassword()` is `true`, `!user.isTemporaryPassword()` evaluates to `false`. As long as `request.getPassword().isEmpty()` is also `false`, the combined condition `(false || false)` is `false`. Thus, the `BadCredentialsException` is never thrown, and execution falls through to token generation.

## Incorrect Code Explanation
The developer attempted to implement a feature allowing users with temporary passwords to be flagged or handled separately, but erroneously structured the boolean logic. Instead of comparing the input against a valid temporary credential or enforcing a reset, the code bypassed the exception entirely.

## Correct Solution
```java
boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

if (!matches) {
    throw new BadCredentialsException("Invalid username or password");
}
```
If a temporary password mechanism is required:
```java
boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
if (!matches) {
    throw new BadCredentialsException("Invalid username or password");
}

if (user.isTemporaryPassword()) {
    // Return flag requiring password reset on next screen, but never authenticate with invalid credentials
}
```

## Why the Solution Works
By removing the boolean bypass and strictly validating that `passwordEncoder.matches(...)` returns true, unauthorized credentials can never proceed past the check.

## Test Case
```java
@Test
void testTeacherLoginWithIncorrectPasswordShouldFail() {
    LoginRequestDto request = new LoginRequestDto("teacher", "InvalidPassword999");
    assertThrows(BadCredentialsException.class, () -> authService.login(request));
}
```

## Expected Test Result
Before fix: Test fails because `authService.login` returns a token without throwing `BadCredentialsException`.  
After fix: Test passes (`BadCredentialsException` is thrown).

## Suggested AI Prompts
- **Good Prompt**: "In our Spring Boot 3 `AuthService.java`, the user `teacher` can log in with any wrong password, while `admin` correctly rejects wrong passwords. Here is `AuthService.java` and `User.java`. Please analyze the credential verification logic and identify why `teacher` is accepted."
- **Bad Prompt**: "Fix the login bug."

## Common Incorrect AI Solutions
- AI may suggest completely rewriting Spring Security using custom UserDetailsService filters without noticing the simple boolean flaw in `AuthService.java`.
- AI may suggest removing `passwordEncoder` and using plaintext `.equals()`.

## How to Verify AI-Generated Fix
1. Inspect the diff: Ensure only the condition inside `if (!matches)` was updated to throw `BadCredentialsException`.
2. Re-test `admin` with valid credentials: Login succeeds.
3. Re-test `teacher` with valid credentials (`Teacher@123`): Login succeeds.
4. Re-test `teacher` with invalid credentials: Login is rejected with HTTP 401.
