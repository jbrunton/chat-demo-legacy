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
  }).then(response => {
    cy.get(response.body).as("user");
  });
  const sessionToken = Cypress._.uniqueId("token-");
  cy.request('POST', 'http://localhost:3000/api/dev/auth/create-session', {
    email,
    sessionToken,
  })
  cy.setCookie('next-auth.session-token', sessionToken);
});

Cypress.Commands.add('createRoom', (name = "Test Room", ownerEmail = "test.user@example.com") => {
  cy.request('POST', 'http://localhost:3000/api/dev/rooms/create', {
    name,
    ownerEmail,
  }).then(response => {
    cy.get(response.body).as("room");
  });
});

Cypress.Commands.add('sendMessage', (text) => {
  cy.get('input').type(`${text}{enter}`);
  // without a wait, we sometimes see a race condition with multiple messages combined
  cy.wait(1);
});

Cypress.Commands.add('getUser', () => {
  return cy.get("@user").then(([user]) => user);
});

Cypress.Commands.add('getRoom', () => {
  return cy.get("@room").then(([room]) => room);
});

Cypress.Commands.add('visitRoom', () => {
  cy.getRoom().then(room => {
    cy.visit(`http://localhost:3000/rooms/${room.id}`);
  });
});

Cypress.Commands.add('waitForSocket', () => {
  cy.getUser().then(user => {
    cy.get('li.ant-list-item').first().should('contain', `${user.name} joined the chat. Welcome, ${user.name}!`);
  });
});
