/// <reference types="cypress" />

describe('Sending commands', () => {
  const roomId = "a1b2c3d4";
  const expectedCommandResponse = 'Type to chat, or enter one of the following commands:';

  beforeEach(() => {
    cy.visit(`http://localhost:3000/rooms/${roomId}`)
    cy.get('li.ant-list-item').first().should('contain', 'joined the chat. Welcome, User');
  })

  it('responds to /help command', () => {
    cy.get('input').type('/help{enter}');
    cy.get('li.ant-list-item').contains(expectedCommandResponse).should('exist');
  })

  it('shows commands as private messages', () => {
    const message = {
      sender: {
        id: '123',
        name: 'Another User',
      },
      roomId,
      content: "/help",
      time: new Date().toISOString(),
    };
    cy.request("POST", "http://localhost:3000/api/chat", message);
    cy.get('li.ant-list-item').contains(expectedCommandResponse).should('not.exist');
  })
})
