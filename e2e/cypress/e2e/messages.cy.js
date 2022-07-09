/// <reference types="cypress" />

describe('Sending messages', () => {
  const roomId = "a1b2c3d4";

  beforeEach(() => {
    cy.login();
    cy.visit(`http://localhost:3000/rooms/${roomId}`);
    cy.get('li.ant-list-item').first().should('contain', 'Test User joined the chat. Welcome, Test User!');
  })

  it('displays a welcome message', () => {
    cy.get('li.ant-list-item').contains('joined the chat. Welcome, Test User').should('exist');
  })

  it('lets the user send a message', () => {
    cy.get('input').type('Hello, World!{enter}');
    cy.get('li.ant-list-item').contains('Hello, World!').should('exist');
  })

  it('shows messages from other users', () => {
    const message = {
      sender: {
        id: '123',
        name: 'Another User',
      },
      roomId,
      content: "Howdy!",
      time: new Date().toISOString(),
    };
    cy.request("POST", "http://localhost:3000/api/chat", message);
    cy.get('li.ant-list-item').contains('Howdy!').should('exist');
  })
})
