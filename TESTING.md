# Testing Documentation

This document describes the testing strategy and libraries used in the ShopSmart application.

## Overview

The application uses a comprehensive testing approach with three levels of testing:

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test components working together with mocked APIs
3. **End-to-End (E2E) Tests** - Test complete user journeys in a browser

---

## Testing Libraries

### Frontend (Client)

| Test Type | Library | Purpose |
|-----------|---------|---------|
| Unit Tests | **Vitest** + **React Testing Library** | Fast unit testing for React components |
| Integration Tests | **Vitest** + **MSW (Mock Service Worker)** | Testing API integration with mock data |
| E2E Tests | **Playwright** | Browser-based end-to-end testing |

### Backend (Server)

| Test Type | Library | Purpose |
|-----------|---------|---------|
| Unit/Integration | **Jest** + **Supertest** | API endpoint testing |

---

## Test Structure

```
client/
├── src/
│   ├── __tests__/
│   │   ├── unit/           # Unit tests
│   │   │   ├── Login.test.jsx
│   │   │   ├── Signup.test.jsx
│   │   │   └── Home.test.jsx
│   │   ├── integration/    # Integration tests
│   │   │   └── auth.test.jsx
│   │   └── mocks/          # MSW mock handlers
│   │       ├── handlers.js
│   │       └── server.js
│   └── App.test.jsx        # Basic app tests
├── e2e/                    # E2E tests
│   └── auth.spec.js
└── playwright.config.js

server/
├── tests/
│   ├── app.test.js         # Health check tests
│   └── auth.test.js        # Auth API tests
```

---

## Running Tests

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Backend Tests

```bash
cd server

# Run all tests
npm test
```

---

## Test Details

### 1. Unit Tests (Vitest + React Testing Library)

Unit tests verify that individual components render correctly and respond to user interactions.

**What they test:**
- Component renders without crashing
- Form elements are present (inputs, buttons, labels)
- Button clicks trigger expected behavior
- Form validation works
- Error messages are displayed
- Loading states are shown

**Example test:**
```javascript
it('should render login button', () => {
  renderWithProviders(<Login />);
  
  const loginButton = screen.getByTestId('login-button');
  expect(loginButton).toBeInTheDocument();
  expect(loginButton).toHaveTextContent('Login');
});

it('should allow typing in email field', () => {
  renderWithProviders(<Login />);
  
  const emailInput = screen.getByTestId('email-input');
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  expect(emailInput.value).toBe('test@example.com');
});
```

### 2. Integration Tests (Vitest + MSW)

Integration tests verify that components work correctly with the API layer using mock data.

**Mock Data:**
```javascript
// Mock users for testing
const mockUsers = [
  {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  }
];

// Valid credentials
const validCredentials = {
  'john@example.com': 'password123'
};
```

**What they test:**
- Login flow with valid/invalid credentials
- Signup flow with new/existing users
- Token storage in localStorage
- API error handling
- Form validation before API calls

**Example test:**
```javascript
it('should successfully login with valid credentials', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Login />);

  await user.type(emailInput, 'john@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(loginButton);

  await waitFor(() => {
    expect(localStorage.getItem('token')).toBeTruthy();
  });
});
```

### 3. E2E Tests (Playwright)

End-to-end tests verify complete user journeys in a real browser environment.

**What they test:**
- Navigation between pages
- Form submission and validation
- Complete signup flow
- Complete login flow
- Logout functionality
- Backend health status display
- Button click events firing correctly

**Example test:**
```javascript
test('should complete login and redirect to home', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ 
        success: true,
        data: { user: { id: 1, email: 'john@example.com' }, token: 'mock-token' }
      })
    });
  });

  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

---

## Test Coverage

### Unit Tests Cover:
- ✅ Login component rendering
- ✅ Signup component rendering
- ✅ Home component rendering
- ✅ Form input changes
- ✅ Button click events
- ✅ Form validation messages
- ✅ Loading states
- ✅ Required field validation

### Integration Tests Cover:
- ✅ Successful login with mock API
- ✅ Failed login with invalid credentials
- ✅ Successful signup with mock API
- ✅ Failed signup with existing email
- ✅ Password validation
- ✅ Token storage
- ✅ Route navigation
- ✅ Health check API

### E2E Tests Cover:
- ✅ Navigation between pages
- ✅ Complete signup journey
- ✅ Complete login journey
- ✅ Logout functionality
- ✅ Form validation in browser
- ✅ Error message display
- ✅ Button click events
- ✅ API response handling

---

## Setup Requirements

### For Unit & Integration Tests:
```bash
cd client
npm install
```

### For E2E Tests:
```bash
cd client
npm install
npx playwright install
```

### For Backend Tests:
```bash
cd server
npm install
```

---

## CI/CD Integration

The tests can be integrated into CI/CD pipelines using the workflow file:

```yaml
# Run frontend tests
- name: Run frontend tests
  working-directory: ./client
  run: npm test -- --run

# Run E2E tests
- name: Run E2E tests
  working-directory: ./client
  run: npx playwright test

# Run backend tests
- name: Run backend tests
  working-directory: ./server
  run: npm test
```

---

## Notes

1. **Mock Data**: Integration tests use mock data defined in `src/__tests__/mocks/handlers.js`
2. **E2E Mocking**: E2E tests use Playwright's route mocking to simulate API responses
3. **Test IDs**: Components use `data-testid` attributes for reliable test selection
4. **Parallel Execution**: Playwright runs tests in parallel across multiple browsers
