// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email = "test.user@example.com", name = "Test User") => {
  cy.request('POST', 'http://localhost:3000/api/dev/auth/create-user', {
    name,
    email,
  })
  const sessionToken = Cypress._.uniqueId("token-");
  cy.request('POST', 'http://localhost:3000/api/dev/auth/create-session', {
    email,
    sessionToken,
  })
  cy.setCookie('next-auth.session-token', sessionToken);
});
