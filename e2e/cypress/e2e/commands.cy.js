/// <reference types="cypress" />

describe('Sending commands', () => {
  const roomId = "a1b2c3d4";
  const expectedCommandResponse = 'Type to chat, or enter one of the following commands:';

  beforeEach(() => {
    cy.login();
    cy.visit(`http://localhost:3000/rooms/${roomId}`)
    cy.get('li.ant-list-item').first().should('contain.text', 'Test User joined the chat. Welcome, Test User!');
  })

  it('responds to /help command', () => {
    cy.sendMessage('/help');
    cy.get('li.ant-list-item').should('contain.text', expectedCommandResponse);
  })

  it('responds to the /rename command', () => {
    cy.sendMessage('/rename user Renamed User');
    cy.get('li.ant-list-item').should('contain.text', "Test User changed their name to Renamed User");

    cy.sendMessage('Howdy!');
    cy.get('li.ant-list-item').should('contain.text', "Renamed User: Howdy!");
  })
})
