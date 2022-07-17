/// <reference types="cypress" />

describe('Sending messages', () => {
  beforeEach(() => {
    cy.login();
    cy.createRoom();
    cy.visitRoom();
    cy.waitForSocket();
  })

  it('displays a welcome message', () => {
    cy.get('li.ant-list-item').contains('joined the chat. Welcome, Test User').should('exist');
  })

  it('lets the user send a message', () => {
    cy.get('input').type('Hello, World!{enter}');
    cy.get('li.ant-list-item').contains('Hello, World!').should('exist');
  })

  // This no longer works with cookied based auth. Need a new dev endpoint.
  xit('shows messages from other users', () => {
    const message = {
      sender: {
        id: '123',
        name: 'Another User',
      },
      content: "Howdy!",
      time: new Date().toISOString(),
    };
    cy.request("POST", "http://localhost:3000/api/chat", message);
    cy.get('li.ant-list-item').contains('Howdy!').should('exist');
  })
})
