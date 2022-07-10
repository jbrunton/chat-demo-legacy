/// <reference types="cypress" />

describe('Sending commands', () => {
  const roomId = "a1b2c3d4";
  const expectedCommandResponse = 'Type to chat, or enter one of the following commands:';

  beforeEach(() => {
    cy.login();
    cy.visit(`http://localhost:3000/rooms/${roomId}`)
    cy.get('li.ant-list-item').first().should('contain', 'Test User joined the chat. Welcome, Test User!');
  })

  it('responds to /help command', () => {
    cy.get('input').type('/help{enter}');
    cy.get('li.ant-list-item').contains(expectedCommandResponse).should('exist');
  })
})
